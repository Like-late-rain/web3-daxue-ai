import { ethers } from "hardhat";
import addresses from "../shared/addresses.json";

async function main() {
  console.log("\n📊 查询 YCT 代币分布情况...\n");

  const YCToken = await ethers.getContractAt("YCToken", addresses.YCToken);

  // 1. 总供应量
  const totalSupply = await YCToken.totalSupply();
  console.log("=".repeat(60));
  console.log("📈 YCT 总供应量:", ethers.formatEther(totalSupply), "YCT");
  console.log("=".repeat(60));

  // 2. 各地址持有量
  console.log("\n💰 YCT 代币持有情况:\n");

  // YCToken 合约自己持有的 YCT
  const contractYCT = await YCToken.balanceOf(addresses.YCToken);
  console.log("YCToken 合约持有:", ethers.formatEther(contractYCT), "YCT");
  console.log("  └─ 地址:", addresses.YCToken);

  // 部署者（owner）持有的 YCT
  const deployerYCT = await YCToken.balanceOf(addresses.deployer);
  console.log("\n部署者（你）持有:", ethers.formatEther(deployerYCT), "YCT");
  console.log("  └─ 地址:", addresses.deployer);

  // UniversityCourse 合约持有的 YCT
  const courseContractYCT = await YCToken.balanceOf(addresses.UniversityCourse);
  console.log("\nUniversityCourse 合约持有:", ethers.formatEther(courseContractYCT), "YCT");
  console.log("  └─ 地址:", addresses.UniversityCourse);

  // 3. YCToken 合约的 ETH 余额
  const contractETH = await ethers.provider.getBalance(addresses.YCToken);
  console.log("\n" + "=".repeat(60));
  console.log("💵 YCToken 合约的 ETH 余额:", ethers.formatEther(contractETH), "ETH");
  console.log("=".repeat(60));

  // 4. 计算已分发的 YCT
  const distributed = totalSupply - contractYCT;
  console.log("\n" + "=".repeat(60));
  console.log("📊 YCT 分布统计");
  console.log("=".repeat(60));
  console.log("总供应量:", ethers.formatEther(totalSupply), "YCT (100%)");
  console.log("合约持有:", ethers.formatEther(contractYCT), "YCT",
              `(${(Number(contractYCT) * 100 / Number(totalSupply)).toFixed(2)}%)`);
  console.log("已分发:", ethers.formatEther(distributed), "YCT",
              `(${(Number(distributed) * 100 / Number(totalSupply)).toFixed(2)}%)`);
  console.log("=".repeat(60));

  // 5. 流动性分析
  console.log("\n" + "=".repeat(60));
  console.log("💡 流动性分析");
  console.log("=".repeat(60));

  if (contractYCT > 0n) {
    // 合约里的 YCT 可以兑换多少 ETH
    const canExchangeETH = contractYCT / 10000n;
    console.log("合约里的 YCT 可兑换:", ethers.formatEther(canExchangeETH), "ETH");
    console.log("合约实际持有 ETH:", ethers.formatEther(contractETH), "ETH");

    if (contractETH >= canExchangeETH) {
      console.log("✅ 流动性充足！合约里的 YCT 都能兑换回 ETH");
    } else {
      const shortage = canExchangeETH - contractETH;
      console.log("⚠️  流动性不足！缺少:", ethers.formatEther(shortage), "ETH");
    }
  } else {
    console.log("合约没有持有 YCT");
  }

  // 6. 你的 YCT 兑换分析
  if (deployerYCT > 0n) {
    const yourCanExchangeETH = deployerYCT / 10000n;
    console.log("\n你持有的 YCT 可兑换:", ethers.formatEther(yourCanExchangeETH), "ETH");
    console.log("合约实际持有 ETH:", ethers.formatEther(contractETH), "ETH");

    if (contractETH >= yourCanExchangeETH) {
      console.log("✅ 你可以将所有 YCT 兑换回 ETH");
    } else {
      const shortage = yourCanExchangeETH - contractETH;
      console.log("⚠️  合约 ETH 不足，还差:", ethers.formatEther(shortage), "ETH");
      const canSellYCT = contractETH * 10000n;
      console.log("💡 你目前最多可以出售:", ethers.formatEther(canSellYCT), "YCT");
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("📝 说明");
  console.log("=".repeat(60));
  console.log("• 兑换比例: 1 ETH = 10,000 YCT");
  console.log("• YCToken 合约持有的 YCT: 用户购买时从这里转出");
  console.log("• 部署者持有的 YCT: 部署时铸造的初始供应量");
  console.log("• 合约持有的 ETH: 用户购买 YCT 时支付的 ETH");
  console.log("=".repeat(60));
  console.log();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
