const { ethers } = require("ethers");

const rpc = "https://rpc.testnet.arc.network";
const provider = new ethers.JsonRpcProvider(rpc);

const erc20Abi = ["function decimals() external view returns (uint8)"];
const wusdc = new ethers.Contract("0x911b4000D3422F482F4062a913885f7b035382Df", erc20Abi, provider);
const eurc = new ethers.Contract("0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a", erc20Abi, provider);
const usdc = new ethers.Contract("0x3600000000000000000000000000000000000000", erc20Abi, provider);

async function main() {
    try {
        console.log("WUSDC decimals:", await wusdc.decimals());
        console.log("EURC decimals:", await eurc.decimals());
        console.log("USDC decimals:", await usdc.decimals());
    } catch (e) {
        console.error(e);
    }
}

main();
