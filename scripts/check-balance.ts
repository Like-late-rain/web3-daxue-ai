import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(deployer.address);
  const network = await ethers.provider.getNetwork();

  console.log("\n===== 账户信息 =====");
  console.log("网络:", network.name);
  console.log("Chain ID:", network.chainId.toString());
  console.log("部署账户:", deployer.address);
  console.log("余额:", ethers.formatEther(balance), "ETH");
  console.log("====================\n");

  if (balance < ethers.parseEther("0.1")) {
    console.log("⚠️  余额不足！建议至少拥有 0.1 ETH 用于部署");
    console.log("\n获取 Sepolia 测试 ETH:");
    console.log("- Alchemy Faucet: https://sepoliafaucet.com/");
    console.log("- Infura Faucet: https://www.infura.io/faucet/sepolia");
  } else {
    console.log("✅ 余额充足，可以开始部署");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
