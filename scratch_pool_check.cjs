const { ethers } = require("ethers");

const rpc = "https://rpc.testnet.arc.network";
const provider = new ethers.JsonRpcProvider(rpc);

const factoryAddress = "0x2B865487A1008D2694C1D367c761f00a564aCECb";
const factoryAbi = ["function getPair(address tokenA, address tokenB) external view returns (address pair)"];
const factory = new ethers.Contract(factoryAddress, factoryAbi, provider);

const USDC = "0x3600000000000000000000000000000000000000";
const EURC = "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a";
const WUSDC = "0x911b4000D3422F482F4062a913885f7b035382Df";

async function main() {
    try {
        const pair1 = await factory.getPair(USDC, EURC);
        console.log("Pool USDC-EURC:", pair1);
        
        const pair2 = await factory.getPair(WUSDC, EURC);
        console.log("Pool WUSDC-EURC:", pair2);
        
        const pair3 = await factory.getPair(WUSDC, USDC);
        console.log("Pool WUSDC-USDC:", pair3);
    } catch (e) {
        console.error(e);
    }
}

main();
