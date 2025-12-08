import { run } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("🔍 开始验证合约...\n");

  // 读取已部署的合约地址
  const addressesPath = path.join(__dirname, "..", "shared", "addresses.json");

  if (!fs.existsSync(addressesPath)) {
    console.error("❌ 找不到 addresses.json 文件。请先部署合约！");
    process.exit(1);
  }

  const addresses = JSON.parse(fs.readFileSync(addressesPath, "utf-8"));

  try {
    // 验证 YCToken
    console.log("📝 验证 YCToken...");
    await run("verify:verify", {
      address: addresses.YCToken,
      constructorArguments: [],
    });
    console.log("✅ YCToken 验证成功\n");
  } catch (error: any) {
    if (error.message.includes("Already Verified")) {
      console.log("ℹ️  YCToken 已经验证过了\n");
    } else {
      console.error("❌ YCToken 验证失败:", error.message, "\n");
    }
  }

  try {
    // 验证 UniversityCourse
    console.log("📝 验证 UniversityCourse...");
    await run("verify:verify", {
      address: addresses.UniversityCourse,
      constructorArguments: [addresses.YCToken],
    });
    console.log("✅ UniversityCourse 验证成功\n");
  } catch (error: any) {
    if (error.message.includes("Already Verified")) {
      console.log("ℹ️  UniversityCourse 已经验证过了\n");
    } else {
      console.error("❌ UniversityCourse 验证失败:", error.message, "\n");
    }
  }

  console.log("🎉 验证完成！");
  console.log("\n📄 Etherscan 链接:");
  console.log("YCToken:", `https://sepolia.etherscan.io/address/${addresses.YCToken}`);
  console.log("UniversityCourse:", `https://sepolia.etherscan.io/address/${addresses.UniversityCourse}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
