const algosdk = require('algosdk');

const MNEMONIC = "switch also east able item youth moon rigid rice fetch blame skin snack luxury patrol leaf tool symbol blind lottery return elder sponsor absent old";
const account = algosdk.mnemonicToSecretKey(MNEMONIC);
const algodClient = new algosdk.Algodv2('', 'https://testnet-api.algonode.cloud', 443);

async function checkBalance() {
    const info = await algodClient.accountInformation(account.addr).do();
    console.log(`Address: ${account.addr}`);
    console.log(`Balance: ${info.amount} microAlgos`);
}

checkBalance().catch(console.error);
