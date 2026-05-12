import { http, createConfig } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';

// Custom Arc Network Definition
export const arcNetwork = {
  id: 490424,
  name: 'Arc Network',
  nativeCurrency: { name: 'Arc', symbol: 'ARC', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://mainnet.arc.network'] },
  },
  blockExplorers: {
    default: { name: 'ArcScan', url: 'https://arcscan.app' },
  },
} as const;

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
    // Contract addresses would go here in production
  },
  testnet: true,
} as const;

export const config = createConfig({
  chains: [mainnet, arcTestnet],
  transports: {
    [mainnet.id]: http(),
    [arcTestnet.id]: http(),
  },
});
