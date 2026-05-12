import { http, createConfig } from 'wagmi';

// Official Arc Testnet Configuration
// Source: https://docs.arc.network/arc/references/connect-to-arc
export const arcTestnet = {
  id: 5042002,
  name: 'Arc Testnet',
  nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 6 },
  rpcUrls: {
    default: { http: ['https://rpc.testnet.arc.network'] },
  },
  blockExplorers: {
    default: { name: 'ArcScan', url: 'https://testnet.arcscan.app' },
  },
  contracts: {
    usdc: { address: '0x3600000000000000000000000000000000000000' },
    eurc: { address: '0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a' },
    stableFx: { address: '0x867650F5eAe8df91445971f14d89fd84F0C9a9f8' },
  },
  testnet: true,
} as const;

export const config = createConfig({
  chains: [arcTestnet],
  transports: {
    [arcTestnet.id]: http(),
  },
});
