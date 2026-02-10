import algosdk from 'algosdk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const account = algosdk.generateAccount();
const mnemonic = algosdk.secretKeyToMnemonic(account.sk);

console.log("✅ Generated New Algorand Testnet Account");
console.log("----------------------------------------");
console.log(`Address:  ${account.addr}`);
console.log(`Mnemonic: ${mnemonic}`);
console.log("----------------------------------------");

const envPath = path.join(__dirname, '..', '.env');
const envContent = `MNEMONIC="${mnemonic}"\nALGOD_TOKEN=""\nALGOD_SERVER="https://testnet-api.algonode.cloud"\nALGOD_PORT=443\n`;

try {
    fs.writeFileSync(envPath, envContent);
    console.log("💾 Saved to .env file successfully!");
    console.log("\n⚠️  IMPORTANT NEXT STEP:");
    console.log(`1. Go to https://testnet.algoexplorer.io/dispenser`);
    console.log(`2. Paste your address: ${account.addr}`);
    console.log(`3. Fund it with ALGO.`);
    console.log(`4. Run 'node --env-file=.env scripts/deploy_all.js'`);
} catch (error) {
    console.error("Failed to write .env file:", error);
}
