import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia } from 'wagmi/chains';
import { defineChain } from 'viem';

// 自定义 Hardhat 本地链配置
const hardhatLocal = defineChain({
  id: 31337,
  name: 'Hardhat Local',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: { http: ['http://127.0.0.1:8545'] },
    public: { http: ['http://127.0.0.1:8545'] },
  },
  blockExplorers: undefined,
  testnet: true,
});

const chains = [hardhatLocal, sepolia] as const;
const appName = 'Web3 涂山大学';
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID';

export const config = getDefaultConfig({
  appName,
  projectId,
  chains: [hardhatLocal, sepolia],
  ssr: true,
});
