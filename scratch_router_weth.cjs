const { ethers } = require("ethers");

const rpc = "https://rpc.testnet.arc.network";
const provider = new ethers.JsonRpcProvider(rpc);

const ROUTER_ADDRESS = "0x437b1aBf6e5a69548849b15EC35f83A73Fa1E28F";
const routerAbi = ["function WETH() external view returns (address)"];
const router = new ethers.Contract(ROUTER_ADDRESS, routerAbi, provider);

async function main() {
    try {
        const weth = await router.WETH();
        console.log("Router WETH:", weth);
    } catch (e) {
        console.error(e);
    }
}

main();
