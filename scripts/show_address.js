import algosdk from 'algosdk';
import { fileURLToPath } from 'url';
import path from 'path';

// dotenv.config(); // Not needed with --env-file

if (!process.env.MNEMONIC) {
    console.error("No MNEMONIC in .env");
    process.exit(1);
}

import fs from 'fs';

const account = algosdk.mnemonicToSecretKey(process.env.MNEMONIC);
const address = account.addr.toString();
console.log("ADDRESS:");
console.log(address);

fs.writeFileSync('address_clean.txt', address);
console.log("Saved to address_clean.txt");
