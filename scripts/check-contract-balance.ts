import { ethers } from "hardhat";
import addresses from "../shared/addresses.json";

async function main() {
  console.log("\n💰 检查合约余额...\n");

  // YCToken 合约 ETH 余额
  const ycTokenBalance = await ethers.provider.getBalance(addresses.YCToken);
  console.log("YCToken 合约地址:", addresses.YCToken);
  console.log("YCToken 合约 ETH 余额:", ethers.formatEther(ycTokenBalance), "ETH");

  // 部署者账户余额
  const deployerBalance = await ethers.provider.getBalance(addresses.deployer);
  console.log("\n部署者地址:", addresses.deployer);
  console.log("部署者 ETH 余额:", ethers.formatEther(deployerBalance), "ETH");

  // 部署者 YCT 余额
  const YCToken = await ethers.getContractAt("YCToken", addresses.YCToken);
  const yctBalance = await YCToken.balanceOf(addresses.deployer);
  console.log("部署者 YCT 余额:", ethers.formatEther(yctBalance), "YCT");

  console.log("\n" + "=".repeat(60));
  console.log("📊 资金总览");
  console.log("=".repeat(60));
  console.log("合约持有的 ETH:", ethers.formatEther(ycTokenBalance), "ETH (用于兑换流动性)");
  console.log("你持有的 ETH:", ethers.formatEther(deployerBalance), "ETH");
  console.log("你持有的 YCT:", ethers.formatEther(yctBalance), "YCT");
  console.log("=".repeat(60));

  const total = ycTokenBalance + deployerBalance;
  console.log("\n💡 你的总 ETH (包含合约中的):", ethers.formatEther(total), "ETH");
  console.log("\n✅ 你的 ETH 没有丢失，只是存在合约里作为流动性！");
  console.log("   当用户出售 YCT 时，会从这里取出 ETH 给用户。\n");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
