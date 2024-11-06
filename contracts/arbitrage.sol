// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity ^0.8.0;

import "@maverick/maverick-v1/contracts/interfaces/IRouter.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/Uniswap.sol";

interface IUniswapV2Callee {
    function uniswapV2Call(
        address sender,
        uint amount0,
        uint amount1,
        bytes calldata data
    ) external;
}

contract arbitrage is Ownable, IUniswapV2Callee {
    address private WETH = 0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6;
    address private constant ROUTER =
        0x9563Fdb01BFbF3D6c548C2C64E446cb5900ACA88;

    // Uniswap V2 factory
    address private constant FACTORY =
        0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f;
    event Received(address, uint);
    event Log(string message, uint val);

    function flashSwap(
        address _tokenBorrow,
        uint _amount,
        IRouter.ExactInputParams memory params,
        IRouter.ExactInputParams memory paramsSwapOut,
        address tokenOut
    ) external onlyOwner {
        address pair = IUniswapV2Factory(FACTORY).getPair(_tokenBorrow, WETH);
        require(pair != address(0), "!pair");

        address token0 = IUniswapV2Pair(pair).token0();
        address token1 = IUniswapV2Pair(pair).token1();
        uint amount0Out = WETH == token0 ? _amount : 0;
        uint amount1Out = WETH == token1 ? _amount : 0;

        // need to pass some data to trigger uniswapV2Call
        bytes memory data = abi.encode(
            WETH,
            _amount,
            params,
            paramsSwapOut,
            tokenOut
        );

        IUniswapV2Pair(pair).swap(amount0Out, amount1Out, address(this), data);
    }

    // called by pair contract
    function uniswapV2Call(
        address _sender,
        uint _amount0,
        uint _amount1,
        bytes calldata _data
    ) external override {
        address token0 = IUniswapV2Pair(msg.sender).token0();
        address token1 = IUniswapV2Pair(msg.sender).token1();
        address pair = IUniswapV2Factory(FACTORY).getPair(token0, token1);
        require(msg.sender == pair, "!pair");
        require(_sender == address(this), "!sender");

        (
            address tokenBorrow,
            uint amount,
            IRouter.ExactInputParams memory _paramsSwapIn,
            IRouter.ExactInputParams memory _paramsSwapOut,
            address tokenOut
        ) = abi.decode(
                _data,
                (
                    address,
                    uint,
                    IRouter.ExactInputParams,
                    IRouter.ExactInputParams,
                    address
                )
            );

        _paramsSwapIn.amountIn = amount;
        IERC20(WETH).approve(ROUTER, ~uint256(0));
        IERC20(tokenBorrow).approve(ROUTER, ~uint256(0));
        IERC20 tokenOutContract = IERC20(tokenOut);
        tokenOutContract.approve(ROUTER, ~uint256(0));
        IRouter(ROUTER).exactInput(_paramsSwapIn);
        _paramsSwapOut.amountIn = tokenOutContract.balanceOf(address(this));
        IRouter(ROUTER).exactInput(_paramsSwapOut);

        // about 0.3%
        uint fee = ((amount * 3) / 997) + 1;
        uint amountToRepay = amount + fee;
        IERC20(tokenBorrow).transfer(pair, amountToRepay);
    }

    function withdrawWETH() public onlyOwner returns (bool) {
        IERC20(WETH).transfer(
            msg.sender,
            IERC20(WETH).balanceOf(address(this))
        );
        return true;
    }

    receive() external payable {
        emit Received(msg.sender, msg.value);
    }
}
