require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config(); // Load environment variables from .env file

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20", // Specify the Solidity version
  defaultNetwork: "sepolia", // Set the default network to Sepolia
  networks: {
    hardhat: {}, // Local Hardhat network configuration
    sepolia: {
      url: `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`, // Infura URL for Sepolia
      accounts: [process.env.SEPOLIA_PRIVATE_KEY], // Use your private key from .env
    },
    
  },
   etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
     },
};