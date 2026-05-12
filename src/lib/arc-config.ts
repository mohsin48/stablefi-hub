import { http, createConfig } from 'wagmi';

// Arc Testnet Only (Chain ID: 5042002)
export const arcTestnet = {
  id: 5042002,
  name: 'Arc Testnet',
  nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 6 },
  rpcUrls: {
    default: { http: ['https://5042002.rpc.thirdweb.com'] },
  },
  blockExplorers: {
    default: { name: 'ArcScan', url: 'https://testnet.arcscan.app/' },
  },
  contracts: {
    usdc: { address: '0x3600000000000000000000000000000000000001' },
    eurc: { address: '0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a' },
  },
  testnet: true,
} as const;

export const config = createConfig({
  chains: [arcTestnet],
  transports: {
    [arcTestnet.id]: http(),
  },
});
