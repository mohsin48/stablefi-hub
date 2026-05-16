const { ethers } = require("ethers");

const rpc = "https://rpc.testnet.arc.network";
const provider = new ethers.JsonRpcProvider(rpc);

const erc20Abi = ["function balanceOf(address) external view returns (uint256)"];
const usdcErc20 = new ethers.Contract("0x3600000000000000000000000000000000000000", erc20Abi, provider);

// We'll just check a known active address if we can, or just print logic.
// Let's check the router's balance and WUSDC contract's balance
const WUSDC = "0x911b4000D3422F482F4062a913885f7b035382Df";

async function main() {
    try {
        const nativeBal = await provider.getBalance(WUSDC);
        const erc20Bal = await usdcErc20.balanceOf(WUSDC);
        console.log("WUSDC native balance:", nativeBal.toString());
        console.log("WUSDC ERC20 balance:", erc20Bal.toString());
    } catch (e) {
        console.error(e);
    }
}

main();
