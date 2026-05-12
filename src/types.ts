export interface Token {
  symbol: string;
  name: string;
  balance: number;
  price: number;
  address?: string;
  icon?: string;
}

export interface Loan {
  id: string;
  asset: string;
  amount: number;
  collateral: number;
  collateralAsset: string;
  healthFactor: number;
  apy: number;
}

export interface Deposit {
  asset: string;
  amount: number;
  apy: number;
  yieldEarned: number;
}
