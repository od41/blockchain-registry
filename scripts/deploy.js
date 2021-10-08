const hre = require("hardhat");
const fs = require('fs');
const {adminAddress} = require('../src/.config')

async function main() {
  const Registry = await hre.ethers.getContractFactory("Registry");
  const registry = await Registry.deploy(adminAddress);

  await registry.deployed();

  console.log("Registry deployed to:", registry.address);

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
