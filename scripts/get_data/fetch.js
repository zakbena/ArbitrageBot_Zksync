// let swapEthForTokens = require("./exactImput");
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

    // Check if the data has the expected array property
    if (data && Array.isArray(data.pools)) {
      // Access the array of objects
      const poolsArray = data.pools;

      // Now you can iterate through the array of objects
      poolsArray.forEach((pool) => {
        // Print specific properties from nested objects

        // console.log(pool);
        if (
          pool.tokenA.name == "Test USD Coin"
          // pool.tokenA.name == "Tapio Ether" &&
          // pool.tokenABalance > 1 &&
          // pool.tokenBBalance > 1
        ) {
          console.log("-------");
          console.log("Pool ID:", pool.id);
          console.log("TokenA - Name:", pool.tokenA.name);
          console.log("TokenA - Address:", pool.tokenA.address);
          console.log("TokenB - Name:", pool.tokenB.name);
          console.log("TokenB - Address:", pool.tokenB.address);
          console.log("TokenA Reserves", pool.tokenABalance);
          console.log("TokenB Reserves", pool.tokenBBalance);
          // Price per ETH-TokenB
          console.log(
            "Price Per Token  for Eth",
            pool.tokenABalance / pool.tokenBBalance
          );
        } else {
          // console.log("ntm");
        }
        // Perform any additional operations with each pool object
      });
    } else {
      console.error(
        "Invalid data structure: Missing or incorrect array property"
      );
    }
    var endTime = performance.now();
    console.log(`Call to doSomething took ${endTime - startTime} milliseconds`);
  })
  .catch((error) => {
    // Handle errors here
    console.error("Error fetching data:", error);
  });
