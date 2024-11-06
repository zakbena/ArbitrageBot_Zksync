
// Replace this URL with your actual API endpoint
const apiUrl = "https://api.mav.xyz/api/v3/pools/5";

// Fetch data from the API

fetch(apiUrl)
  .then((response) => {
    // Check if the response is successful (status code 200)
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    // Parse the response JSON
    return response.json();
  })
  .then((data) => {
    var startTime = performance.now();

    // Handle the data here
    // console.log("Fetched data:", data);
    let storedPool = [];
    // Check if the data has the expected array property
    if (data && Array.isArray(data.pools)) {
      // Access the array of objects
      const poolsArray = data.pools;

      storedPool = poolsArray.map((dataPool) => {
        if (
          dataPool.tokenA.name == "Ether" &&
          dataPool.tokenA.name == "Tapio Ether" &&
          dataPool.tokenABalance > 1 &&
          dataPool.tokenBBalance > 1
        ) {
          return {
            poolId: dataPool.id,
            TokenA: dataPool.tokenA.name,
            TokenAAddress: dataPool.tokenA.address,
            TokenB: dataPool.tokenB.name,
            TokenBAddress: dataPool.tokenB.address,
            TokenAReserves: dataPool.tokenABalance,
            TokenBReserves: dataPool.tokenBBalance,
            price: dataPool.tokenABalance / dataPool.tokenBBalance
          };
        } else {
          return;
        }
      });
    } else {
      console.error(
        "Invalid data structure: Missing or incorrect array property"
      );
    }

    let filteredPool = storedPool.filter(Boolean);
    console.log(filteredPool);
    // console.log(filteredPool);

    let buyPool, sellPool;
    Array.prototype.hasMin = function (attrib) {
      return (
        (this.length &&
          this.reduce(function (prev, curr) {
            return prev[attrib] < curr[attrib] ? prev : curr;
          })) ||
        null
      );
    };

    Array.prototype.hasMax = function (attrib) {
      return (
        (this.length &&
          this.reduce(function (prev, curr) {
            return prev[attrib] > curr[attrib] ? prev : curr;
          })) ||
        null
      );
    };

    var endTime = performance.now();

    // console.log(min, max);
    buyPool = filteredPool.hasMin("poolId").poolId;
    sellPool = filteredPool.hasMax("poolId").poolId;

    console.log(buyPool);
    console.log(sellPool);
    // console.log(filteredPool);
    console.log(`Call to doSomething took ${endTime - startTime} milliseconds`);
  })
  .catch((error) => {
    // Handle errors here
    console.error("Error fetching data:", error);
  });
