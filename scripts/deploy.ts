import hre, { ethers } from "hardhat";
import addressUtils from "../utils/addressUtils";

async function main() {
  const faucet = await ethers.getContractFactory("Faucet");
  const tx = await faucet.deploy();

  await tx.deployed();

  await addressUtils.saveAddresses(hre.network.name, { Faucet: tx.address });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
