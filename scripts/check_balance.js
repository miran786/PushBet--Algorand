import algosdk from 'algosdk';
import { fileURLToPath } from 'url';
import path from 'path';

// Load .env via --env-file flag
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ALGOD_TOKEN = '';
const ALGOD_SERVER = 'https://testnet-api.algonode.cloud';
const ALGOD_PORT = 443;
const algodClient = new algosdk.Algodv2(ALGOD_TOKEN, ALGOD_SERVER, ALGOD_PORT);

async function checkBalance() {
    try {
        if (!process.env.MNEMONIC) {
            throw new Error("MNEMONIC missing from .env");
        }
        const account = algosdk.mnemonicToSecretKey(process.env.MNEMONIC);
        const accountInfo = await algodClient.accountInformation(account.addr).do();
        console.log(`Address: ${account.addr}`);
        console.log(`Balance: ${accountInfo.amount} microAlgos`);

        if (accountInfo.amount < 1000000) {
            console.log("⚠️  WARNING: Balance is low! You need at least 1 ALGO to deploy.");
        } else {
            console.log("✅ Balance looks good.");
        }
    } catch (e) {
        console.error("Error checking balance:", e.message);
    }
}

checkBalance();
