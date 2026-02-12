const algosdk = require('algosdk');
const fs = require('fs');
const path = require('path');

const algodClient = new algosdk.Algodv2('', 'https://testnet-api.algonode.cloud', 443);

async function testCompile() {
    const tealPath = path.resolve(__dirname, '../contracts/asset_escrow.teal');
    const programSource = fs.readFileSync(tealPath, 'utf8');
    const encoder = new TextEncoder();
    const programBytes = encoder.encode(programSource);

    try {
        const compileResponse = await algodClient.compile(programBytes).do();
        console.log("Compile Success!");
        console.log("Hash:", compileResponse.hash);
    } catch (e) {
        console.error("Compile Failed:", e.message);
        if (e.response && e.response.body) {
            console.error("Details:", JSON.stringify(e.response.body));
        }
    }
}

testCompile();
