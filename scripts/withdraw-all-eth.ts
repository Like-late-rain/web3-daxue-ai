import { ethers } from "hardhat";
import addresses from "../shared/addresses.json";

async function main() {
  console.log("\n💰 开始提取合约中的所有 ETH...\n");

  const [deployer] = await ethers.getSigners();

  // 获取 YCToken 合约
  const YCToken = await ethers.getContractAt("YCToken", addresses.YCToken);

  // 检查提取前的余额
  console.log("=".repeat(60));
  console.log("📊 提取前状态");
  console.log("=".repeat(60));

  const contractBalanceBefore = await ethers.provider.getBalance(addresses.YCToken);
  const deployerBalanceBefore = await ethers.provider.getBalance(deployer.address);

  console.log("YCToken 合约地址:", addresses.YCToken);
  console.log("YCToken 合约 ETH 余额:", ethers.formatEther(contractBalanceBefore), "ETH");
  console.log("\n你的钱包地址:", deployer.address);
  console.log("你的钱包 ETH 余额:", ethers.formatEther(deployerBalanceBefore), "ETH");

  if (contractBalanceBefore === 0n) {
    console.log("\n⚠️  合约中没有 ETH 可提取");
    return;
  }

  // 提取 ETH
  console.log("\n" + "=".repeat(60));
  console.log("🔄 正在提取 ETH...");
  console.log("=".repeat(60));

  const tx = await YCToken.withdrawETH();
  console.log("✅ 交易已发送");
  console.log("📝 交易 Hash:", tx.hash);
  console.log("🔗 Etherscan:", `https://sepolia.etherscan.io/tx/${tx.hash}`);

  console.log("\n⏳ 等待交易确认...");
  const receipt = await tx.wait();
  console.log("✅ 交易已确认！");
  console.log("📦 区块号:", receipt!.blockNumber);

  // 检查提取后的余额
  console.log("\n" + "=".repeat(60));
  console.log("📊 提取后状态");
  console.log("=".repeat(60));

  const contractBalanceAfter = await ethers.provider.getBalance(addresses.YCToken);
  const deployerBalanceAfter = await ethers.provider.getBalance(deployer.address);

  console.log("YCToken 合约 ETH 余额:", ethers.formatEther(contractBalanceAfter), "ETH");
  console.log("你的钱包 ETH 余额:", ethers.formatEther(deployerBalanceAfter), "ETH");

  // 计算详细信息
  const withdrawn = contractBalanceBefore - contractBalanceAfter;
  const gasCost = receipt!.gasUsed * receipt!.gasPrice;
  const netGain = withdrawn - gasCost;
  const balanceIncrease = deployerBalanceAfter - deployerBalanceBefore;

  console.log("\n" + "=".repeat(60));
  console.log("💵 财务总结");
  console.log("=".repeat(60));
  console.log("提取金额:", ethers.formatEther(withdrawn), "ETH");
  console.log("Gas 费用:", ethers.formatEther(gasCost), "ETH");
  console.log("净收益:", ethers.formatEther(netGain), "ETH");
  console.log("钱包增加:", ethers.formatEther(balanceIncrease), "ETH");
  console.log("=".repeat(60));

  console.log("\n✅ ETH 提取成功！");

  console.log("\n" + "=".repeat(60));
  console.log("💡 重要提醒");
  console.log("=".repeat(60));
  console.log("• 合约现在 ETH 余额为 0");
  console.log("• 用户仍然可以购买 YCT（会自动存入 ETH）");
  console.log("• 用户只能出售他们购买时对应的 YCT 数量");
  console.log("• 数学上保证：购买的 YCT 永远能兑换回 ETH");
  console.log("• 用户购买后，你可以再次提取累积的 ETH");
  console.log("=".repeat(60));

  console.log("\n🔗 在 Etherscan 上查看交易:");
  console.log(`https://sepolia.etherscan.io/tx/${tx.hash}`);
  console.log();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
