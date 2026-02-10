const algosdk = require('algosdk');

const ALGOD_TOKEN = '';
const ALGOD_SERVER = 'https://testnet-api.algonode.cloud';
const ALGOD_PORT = 443;
const algodClient = new algosdk.Algodv2(ALGOD_TOKEN, ALGOD_SERVER, ALGOD_PORT);

async function getAppId(txId) {
    try {
        const info = await algosdk.waitForConfirmation(algodClient, txId, 4);
        console.log(`Tx: ${txId}`);
        console.log(`App ID: ${info['application-index'] || info.applicationIndex}`);
    } catch (e) {
        console.error(`Failed to fetch ${txId}:`, e.message);
    }
}

async function main() {
    await getAppId('YHN6UQ6NMKQOSF4VOXA3HI4VI6OTYK3STBM4NL4MHKP2TBZSULWA');
    await getAppId('5AF5C2A4BYZHDEEJ3MTVXWNTUN3SPM55QYOXQHXMAIEH4RNGV7VA');
    await getAppId('WKSBLC6YJX5QYUQ6BXIEGYGZURGY2SGI3FG4FB6ERB6JO4CVKOGA');
}

main();
