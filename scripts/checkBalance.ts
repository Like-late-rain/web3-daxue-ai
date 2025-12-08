import { ethers } from "hardhat";

async function main() {
  const YCToken = await ethers.getContractAt("YCToken", "0x5FbDB2315678afecb367f032d93F642f64180aa3");
  const ownerAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

  const balance = await YCToken.balanceOf(ownerAddress);
  console.log("=== YCToken 余额检查 ===");
  console.log("Owner 地址:", ownerAddress);
  console.log("Owner YCT 余额:", ethers.formatEther(balance), "YCT");

  const totalSupply = await YCToken.totalSupply();
  console.log("YCT 总供应量:", ethers.formatEther(totalSupply), "YCT");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
