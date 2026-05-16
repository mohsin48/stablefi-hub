const { ethers } = require("ethers");

const rpc = "https://rpc.testnet.arc.network";
const provider = new ethers.JsonRpcProvider(rpc);

const ROUTER_ADDRESS = "0x437b1aBf6e5a69548849b15EC35f83A73Fa1E28F";
const routerAbi = [
    "function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)"
];
const router = new ethers.Contract(ROUTER_ADDRESS, routerAbi, provider);

const WUSDC = "0x911b4000D3422F482F4062a913885f7b035382Df";
const EURC = "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a";

async function main() {
    try {
        // Swap 1 WUSDC (18 decimals) to EURC (6 decimals)
        const amountIn = ethers.parseUnits("1", 18);
        const amountsOut = await router.getAmountsOut(amountIn, [WUSDC, EURC]);
        console.log("1 WUSDC -> EURC:", ethers.formatUnits(amountsOut[1], 6));

        // Swap 1 EURC (6 decimals) to WUSDC (18 decimals)
        const amountIn2 = ethers.parseUnits("1", 6);
        const amountsOut2 = await router.getAmountsOut(amountIn2, [EURC, WUSDC]);
        console.log("1 EURC -> WUSDC:", ethers.formatUnits(amountsOut2[1], 18));

    } catch (e) {
        console.error(e);
    }
}

main();
