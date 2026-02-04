const algosdk = require('algosdk');
const dotenv = require('dotenv');
dotenv.config();

// Connect to Testnet (using a public node or AlgoNode for free)
const algodToken = '';
const algodServer = 'https://testnet-api.algonode.cloud';
const algodPort = 443;

const algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);

const initializeRefereeWallet = () => {
    const mnemonic = process.env.REFEREE_MNEMONIC;
    if (!mnemonic) {
        console.error("REFEREE_MNEMONIC not found in .env");
        return null;
    }
    try {
        const account = algosdk.mnemonicToSecretKey(mnemonic);
        console.log("Referee Wallet Initialized:", account.addr);
        return account;
    } catch (error) {
        console.error("Error initializing wallet:", error);
        return null;
    }
};

const checkBalance = async (address) => {
    try {
        const accountInfo = await algodClient.accountInformation(address).do();
        const balance = accountInfo.amount;
        console.log(`Balance for ${address}: ${balance} microAlgos`);
        return balance;
    } catch (error) {
        console.error("Error checking balance:", error);
        return 0;
    }
};

module.exports = {
    algodClient,
    initializeRefereeWallet,
    checkBalance
};
