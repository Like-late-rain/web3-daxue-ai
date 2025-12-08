import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("🚀 开始部署 Web3 涂山大学合约...\n");

  const [deployer] = await ethers.getSigners();
  console.log("📍 部署账户:", deployer.address);
  console.log("💰 账户余额:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

  // 1. 部署 YCToken
  console.log("📝 部署 YCToken...");
  const YCToken = await ethers.getContractFactory("YCToken");
  const ycToken = await YCToken.deploy();
  await ycToken.waitForDeployment();
  const ycTokenAddress = await ycToken.getAddress();
  console.log("✅ YCToken 部署成功:", ycTokenAddress);

  // 2. 部署 UniversityCourse
  console.log("\n📝 部署 UniversityCourse...");
  const UniversityCourse = await ethers.getContractFactory("UniversityCourse");
  const universityCourse = await UniversityCourse.deploy(ycTokenAddress);
  await universityCourse.waitForDeployment();
  const universityCourseAddress = await universityCourse.getAddress();
  console.log("✅ UniversityCourse 部署成功:", universityCourseAddress);

  // 3. 转移一部分 YCT 到合约（用于流动性）
  console.log("\n💸 转移 100,000 YCT 到 deployer 作为流动性储备...");
  const transferAmount = ethers.parseEther("100000"); // 10万 YCT 作为储备
  // YCT 已经全部在 deployer 账户了，不需要额外转账

  // 4. 存入一些 ETH 到 YCToken 合约（用于兑换）
  console.log("💰 向 YCToken 合约存入 1 ETH 作为流动性...");
  const ethAmount = ethers.parseEther("1");
  const tx = await deployer.sendTransaction({
    to: ycTokenAddress,
    value: ethAmount,
  });
  await tx.wait();
  console.log("✅ ETH 流动性存入成功");

  // 5. 保存合约地址到 shared/addresses.json
  const addresses = {
    YCToken: ycTokenAddress,
    UniversityCourse: universityCourseAddress,
    deployer: deployer.address,
    network: (await ethers.provider.getNetwork()).name,
    chainId: (await ethers.provider.getNetwork()).chainId.toString(),
    deployedAt: new Date().toISOString(),
  };

  const sharedDir = path.join(__dirname, "..", "shared");
  if (!fs.existsSync(sharedDir)) {
    fs.mkdirSync(sharedDir, { recursive: true });
  }

  const addressesPath = path.join(sharedDir, "addresses.json");
  fs.writeFileSync(addressesPath, JSON.stringify(addresses, null, 2));
  console.log("\n💾 合约地址已保存到:", addressesPath);

  // 6. 复制 ABI 到 frontend
  console.log("\n📋 复制 ABI 文件到前端...");
  const artifactsDir = path.join(__dirname, "..", "artifacts", "contracts");
  const frontendContractsDir = path.join(__dirname, "..", "frontend", "src", "contracts");

  if (!fs.existsSync(frontendContractsDir)) {
    fs.mkdirSync(frontendContractsDir, { recursive: true });
  }

  // 复制 YCToken ABI
  const ycTokenArtifact = path.join(artifactsDir, "YCToken.sol", "YCToken.json");
  if (fs.existsSync(ycTokenArtifact)) {
    fs.copyFileSync(
      ycTokenArtifact,
      path.join(frontendContractsDir, "YCToken.json")
    );
    console.log("✅ YCToken ABI 已复制");
  }

  // 复制 UniversityCourse ABI
  const universityCourseArtifact = path.join(artifactsDir, "UniversityCourse.sol", "UniversityCourse.json");
  if (fs.existsSync(universityCourseArtifact)) {
    fs.copyFileSync(
      universityCourseArtifact,
      path.join(frontendContractsDir, "UniversityCourse.json")
    );
    console.log("✅ UniversityCourse ABI 已复制");
  }

  // 复制地址文件到前端
  fs.copyFileSync(
    addressesPath,
    path.join(frontendContractsDir, "addresses.json")
  );
  console.log("✅ 地址文件已复制到前端");

  console.log("\n🎉 部署完成！\n");
  console.log("📄 合约摘要:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("YCToken:", ycTokenAddress);
  console.log("UniversityCourse:", universityCourseAddress);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("\n💡 下一步:");
  console.log("1. 在 Sepolia 上验证合约: npm run verify:sepolia");
  console.log("2. 启动前端: npm run dev");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
