// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity ^0.8.0;

import "@maverick/maverick-v1/contracts/interfaces/IRouter.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract swapMaverick is Ownable {
    address private WETH = 0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6;
    address private constant ROUTER =
        0x9563Fdb01BFbF3D6c548C2C64E446cb5900ACA88;
    event Received(address, uint);

    struct swapParams {
        bytes path;
        address recipient;
        uint256 deadline;
        uint256 amountIn;
        uint256 amountOutMinimum;
    }

    function swap(
        IRouter.ExactInputParams memory params,
        IRouter.ExactInputParams memory paramsSwapOut,
        address tokenOut
    ) public payable onlyOwner {
        IERC20(WETH).approve(ROUTER, ~uint256(0));
        IERC20 tokenOutContract = IERC20(tokenOut);
        tokenOutContract.approve(ROUTER, ~uint256(0));
        params.amountIn = IERC20(WETH).balanceOf(address(this));

        IRouter(ROUTER).exactInput(params);
        paramsSwapOut.amountIn = tokenOutContract.balanceOf(address(this));
        IRouter(ROUTER).exactInput(paramsSwapOut);
        withdrawWETH();
    }

    function withdrawWETH() internal returns (bool) {
        IERC20(WETH).transfer(
            msg.sender,
            IERC20(WETH).balanceOf(address(this))
        );
        return true;
    }

    function withdrawWETHOwner() public onlyOwner returns (bool) {
        IERC20(WETH).transfer(
            msg.sender,
            IERC20(WETH).balanceOf(address(this))
        );
        return true;
    }

    function withdrawToken(address token) internal returns (bool) {
        IERC20(WETH).transfer(
            msg.sender,
            IERC20(token).balanceOf(address(this))
        );
        return true;
    }

    receive() external payable {
        emit Received(msg.sender, msg.value);
    }
}
