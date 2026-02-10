import algosdk from 'algosdk';

// Configuration
const ALGOD_TOKEN = '';
const ALGOD_SERVER = 'https://testnet-api.algonode.cloud';
const ALGOD_PORT = 443;

const algodClient = new algosdk.Algodv2(ALGOD_TOKEN, ALGOD_SERVER, ALGOD_PORT);

async function generateProof(round: number, txID: string) {
    console.log(`Generating State Proof for Round ${round}...`);

    try {
        // 1. Get State Proof
        // Note: State Proofs are generated every N rounds (e.g., 256). 
        // You usually get the proof for the block's interval.
        const stateProof = await algodClient.getStateProof(round).do();
        console.log("State Proof Fetched!");

        // 2. Get Transaction Proof
        // Merkle proof that a specific transaction exists in a block
        const txProof = await algodClient.getTransactionProof(round, txID).do();
        console.log("Transaction Proof Fetched!");

        // 3. Construct Passport
        const passport = {
            round: round,
            txID: txID,
            stateProof: {
                message: stateProof.message,
                signature: stateProof.signature,
                // Full proof data would be here
            },
            txProof: {
                proof: txProof.proof,
                hashtype: txProof.hashtype,
                idx: txProof.idx,
                stibhash: txProof.stibhash,
                treedepth: txProof.treedepth
            }
        };

        console.log("\n--- CROSS-CHAIN IDENTITY PASSPORT ---");
        console.log(JSON.stringify(passport, null, 2));
        console.log("-------------------------------------");

        return passport;

    } catch (error) {
        console.error("Failed to generate proof:", error);
    }
}

// Example Usage
// Replace with a valid Round and TxID from Testnet
const EXAMPLE_ROUND = 46000000;
const EXAMPLE_TXID = "TX_ID_HERE";

if (require.main === module) {
    const args = process.argv.slice(2);
    if (args.length === 2) {
        generateProof(parseInt(args[0]), args[1]);
    } else {
        console.log("Usage: ts-node proof_generator.ts <ROUND> <TXID>");
    }
}
