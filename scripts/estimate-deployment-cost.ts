import { ethers } from "hardhat";

async function main() {
  console.log("\n🔍 开始估算部署成本...\n");

  // 获取部署账户
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();

  console.log("===== 网络信息 =====");
  console.log("网络:", network.name);
  console.log("Chain ID:", network.chainId.toString());
  console.log("部署账户:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("当前余额:", ethers.formatEther(balance), "ETH");
  console.log("====================\n");

  // 获取当前 gas price
  const feeData = await ethers.provider.getFeeData();
  const gasPrice = feeData.gasPrice || ethers.parseUnits("10", "gwei");

  console.log("===== Gas Price 信息 =====");
  console.log("当前 Gas Price:", ethers.formatUnits(gasPrice, "gwei"), "Gwei");
  if (feeData.maxFeePerGas) {
    console.log("Max Fee Per Gas:", ethers.formatUnits(feeData.maxFeePerGas, "gwei"), "Gwei");
  }
  if (feeData.maxPriorityFeePerGas) {
    console.log("Max Priority Fee:", ethers.formatUnits(feeData.maxPriorityFeePerGas, "gwei"), "Gwei");
  }
  console.log("===========================\n");

  // 1. 估算 YCToken 部署
  console.log("📊 估算 YCToken 部署成本...");
  const YCTokenFactory = await ethers.getContractFactory("YCToken");
  const ycTokenDeployTx = await YCTokenFactory.getDeployTransaction();
  const ycTokenGasEstimate = await ethers.provider.estimateGas({
    from: deployer.address,
    data: ycTokenDeployTx.data,
  });

  const ycTokenCost = ycTokenGasEstimate * gasPrice;
  console.log("- 预估 Gas:", ycTokenGasEstimate.toString());
  console.log("- 预估成本:", ethers.formatEther(ycTokenCost), "ETH");

  // 2. 估算 UniversityCourse 部署
  console.log("\n📊 估算 UniversityCourse 部署成本...");
  const UniversityCourseFactory = await ethers.getContractFactory("UniversityCourse");
  // 使用一个假地址作为构造函数参数
  const dummyAddress = "0x0000000000000000000000000000000000000001";
  const universityCourseDeployTx = await UniversityCourseFactory.getDeployTransaction(dummyAddress);
  const universityCourseGasEstimate = await ethers.provider.estimateGas({
    from: deployer.address,
    data: universityCourseDeployTx.data,
  });

  const universityCourseCost = universityCourseGasEstimate * gasPrice;
  console.log("- 预估 Gas:", universityCourseGasEstimate.toString());
  console.log("- 预估成本:", ethers.formatEther(universityCourseCost), "ETH");

  // 3. 估算初始化操作
  console.log("\n📊 估算初始化操作成本...");

  // approve 操作大约需要 46,000 gas
  const approveGas = 46000n;
  const approveCost = approveGas * gasPrice;
  console.log("- Approve 预估 Gas:", approveGas.toString());
  console.log("- Approve 预估成本:", ethers.formatEther(approveCost), "ETH");

  // 存入 ETH 流动性大约需要 30,000 gas
  const depositGas = 30000n;
  const depositCost = depositGas * gasPrice;
  console.log("- 存入 ETH 预估 Gas:", depositGas.toString());
  console.log("- 存入 ETH 预估成本:", ethers.formatEther(depositCost), "ETH");

  // 实际存入的 ETH 金额
  const liquidityAmount = ethers.parseEther("0.01");
  console.log("- 实际存入 ETH:", ethers.formatEther(liquidityAmount), "ETH");

  // 4. 计算总成本
  console.log("\n" + "=".repeat(50));
  console.log("💰 总成本估算");
  console.log("=".repeat(50));

  const totalGasCost = ycTokenCost + universityCourseCost + approveCost + depositCost;
  const totalCost = totalGasCost + liquidityAmount;

  console.log("\nGas 费用:");
  console.log("- YCToken 部署:", ethers.formatEther(ycTokenCost), "ETH");
  console.log("- UniversityCourse 部署:", ethers.formatEther(universityCourseCost), "ETH");
  console.log("- Approve 操作:", ethers.formatEther(approveCost), "ETH");
  console.log("- 存入流动性操作:", ethers.formatEther(depositCost), "ETH");
  console.log("- Gas 小计:", ethers.formatEther(totalGasCost), "ETH");

  console.log("\n流动性:");
  console.log("- 存入 ETH:", ethers.formatEther(liquidityAmount), "ETH");

  console.log("\n" + "-".repeat(50));
  console.log("总计:", ethers.formatEther(totalCost), "ETH");
  console.log("=".repeat(50));

  // 5. 安全检查
  console.log("\n✅ 余额检查:");
  const recommendedBalance = totalCost * 120n / 100n; // 建议余额为估算的 120%

  if (balance < totalCost) {
    console.log("❌ 余额不足！");
    console.log("   需要:", ethers.formatEther(totalCost), "ETH");
    console.log("   当前:", ethers.formatEther(balance), "ETH");
    console.log("   缺少:", ethers.formatEther(totalCost - balance), "ETH");
  } else if (balance < recommendedBalance) {
    console.log("⚠️  余额勉强够用，建议多准备一些");
    console.log("   当前:", ethers.formatEther(balance), "ETH");
    console.log("   建议:", ethers.formatEther(recommendedBalance), "ETH");
  } else {
    console.log("✅ 余额充足！");
    console.log("   当前:", ethers.formatEther(balance), "ETH");
    console.log("   需要:", ethers.formatEther(totalCost), "ETH");
    console.log("   剩余:", ethers.formatEther(balance - totalCost), "ETH");
  }

  // 6. 实时成本对比
  console.log("\n📈 不同 Gas Price 下的成本对比:");
  console.log("-".repeat(50));
  console.log("Gas Price (Gwei) | Gas 费用 (ETH) | 总成本 (ETH)");
  console.log("-".repeat(50));

  const gasPrices = [5, 10, 20, 30, 50];
  const totalGasUnits = ycTokenGasEstimate + universityCourseGasEstimate + approveGas + depositGas;

  for (const gp of gasPrices) {
    const gpBigInt = ethers.parseUnits(gp.toString(), "gwei");
    const gasCost = totalGasUnits * gpBigInt;
    const total = gasCost + liquidityAmount;
    console.log(
      gp.toString().padEnd(16) + " | " +
      ethers.formatEther(gasCost).padEnd(14) + " | " +
      ethers.formatEther(total)
    );
  }
  console.log("-".repeat(50));

  // 7. 获取测试 ETH 的链接
  if (balance < recommendedBalance) {
    console.log("\n💡 获取测试 ETH:");
    console.log("- Alchemy Faucet: https://sepoliafaucet.com/");
    console.log("- Infura Faucet: https://www.infura.io/faucet/sepolia");
    console.log("- Google Cloud: https://cloud.google.com/application/web3/faucet/ethereum/sepolia");
  }

  console.log("\n✨ 估算完成！\n");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
