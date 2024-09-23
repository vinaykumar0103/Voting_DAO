# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a Hardhat Ignition module that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/Lock.js

# Deployed Addresses

VotingDao#VotingDao - 0x80897Aa9aa4e2914AeFb12591eaD2c620c9bF54a
```


Install Packages

# npm install

Compile the Contract

# npx hardhat compile

Deploy the Contract

# npx hardhat ignition deploy ./ignition/modules/Lock.js --network sepolia (any chain)

verify the contract

# npx hardhat ignition deploy ./ignition/modules/Lock.js --network sepolia --verify

Run the test

# npx hardhat test




