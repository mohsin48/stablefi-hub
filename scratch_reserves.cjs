const { ethers } = require("ethers");

const rpc = "https://rpc.testnet.arc.network";
const provider = new ethers.JsonRpcProvider(rpc);

const pool1 = new ethers.Contract("0x1D29b887cd430bc6884FDD68327163DCfcAC40E1", ["function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)"], provider);
const pool2 = new ethers.Contract("0xA68452393dFEfF01Fe3d6174672FA83ED653F7fa", ["function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)"], provider);

async function main() {
    try {
        const res1 = await pool1.getReserves();
        console.log("WUSDC-EURC reserves:", res1[0].toString(), res1[1].toString());
        
        const res2 = await pool2.getReserves();
        console.log("WUSDC-USDC reserves:", res2[0].toString(), res2[1].toString());
    } catch (e) {
        console.error(e);
    }
}

main();
