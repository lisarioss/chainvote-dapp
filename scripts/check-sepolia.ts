import { network } from "hardhat";
import { formatEther } from "ethers";

const { ethers } = await network.connect();

const [deployer] = await ethers.getSigners();

const address = await deployer.getAddress();

const balance = await ethers.provider.getBalance(address);

console.log("Network: Sepolia");
console.log("Deployer:", address);
console.log("Balance:", formatEther(balance), "ETH");