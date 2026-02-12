"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function () { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function () { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var algosdk_1 = require("algosdk");
var fs = require("fs");
var path = require("path");

// --- CONFIG ---
var ALGOD_TOKEN = '';
var ALGOD_SERVER = 'https://testnet-api.algonode.cloud';
var ALGOD_PORT = 443;
var algodClient = new algosdk_1.default.Algodv2(ALGOD_TOKEN, ALGOD_SERVER, ALGOD_PORT);

// --- HELPER: Use Funded Account ---
// Mnemonic provided by previous run (funded with >10 ALGO ideally)
var MNEMONIC = "switch also east able item youth moon rigid rice fetch blame skin snack luxury patrol leaf tool symbol blind lottery return elder sponsor absent old";
var account = algosdk_1.default.mnemonicToSecretKey(MNEMONIC);

console.log("USING ACCOUNT:");
console.log("Address:", account.addr);

var delay = function (ms) { return new Promise(function (res) { return setTimeout(res, ms); }); };

// --- HELPER: Compile TEAL ---
function compileProgram(client, programSource) {
    return __awaiter(this, void 0, void 0, function () {
        var encoder, programBytes, compileResponse, compiledBytes;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    encoder = new TextEncoder();
                    programBytes = encoder.encode(programSource);
                    return [4 /*yield*/, client.compile(programBytes).do()];
                case 1:
                    compileResponse = _a.sent();
                    compiledBytes = new Uint8Array(Buffer.from(compileResponse.result, 'base64'));
                    return [2 /*return*/, compiledBytes];
            }
        });
    });
}

function main() {
    return __awaiter(this, void 0, void 0, function () {
        var params, commuteTealPath, commuteTeal, clearState, approvalBin, clearBin, txn, signedTxn, tx, confirmedTxn, appId, optInTxn, signedOptIn, txOpt;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("\n--- DEPLOYING COMMUTE CONTRACT (FULL TEST) ---");
                    return [4 /*yield*/, algodClient.getTransactionParams().do()];
                case 1:
                    params = _a.sent();

                    // 1. Compile Contract
                    commuteTealPath = path.resolve(__dirname, '../contracts/commute_checkin.teal');
                    commuteTeal = fs.readFileSync(commuteTealPath, 'utf8');
                    clearState = "#pragma version 8\nint 1\nreturn";

                    return [4 /*yield*/, compileProgram(algodClient, commuteTeal)];
                case 2:
                    approvalBin = _a.sent();
                    return [4 /*yield*/, compileProgram(algodClient, clearState)];
                case 3:
                    clearBin = _a.sent();

                    // 2. Deploy App
                    txn = algosdk_1.default.makeApplicationCreateTxnFromObject({
                        sender: account.addr,
                        approvalProgram: approvalBin,
                        clearProgram: clearBin,
                        numLocalInts: 4,
                        numLocalByteSlices: 4,
                        numGlobalInts: 0,
                        numGlobalByteSlices: 0,
                        onComplete: algosdk_1.default.OnApplicationComplete.NoOpOC,
                        suggestedParams: params,
                    });

                    signedTxn = txn.signTxn(account.sk);
                    return [4 /*yield*/, algodClient.sendRawTransaction(signedTxn).do()];
                case 4:
                    tx = _a.sent();
                    console.log("Deploy TxID:", tx.txid);
                    // Use waitForConfirmation response correctly
                    return [4 /*yield*/, algosdk_1.default.waitForConfirmation(algodClient, tx.txid, 4)];
                case 5:
                    confirmedTxn = _a.sent();
                    appId = confirmedTxn["application-index"];
                    // If undefined, try to fetch txn info again or check property name (v2 vs v3 SDK)
                    if (!appId) {
                        // Fallback for some indexers/nodes
                        appId = confirmedTxn.applicationIndex;
                    }
                    console.log("✅ Commute App Deployed! App ID:", appId);

                    // 3. Opt-In (Self)
                    console.log("Opting in...");
                    return [4 /*yield*/, algodClient.getTransactionParams().do()];
                case 6:
                    params = _a.sent();
                    optInTxn = algosdk_1.default.makeApplicationOptInTxnFromObject({
                        sender: account.addr,
                        appIndex: appId,
                        suggestedParams: params
                    });
                    signedOptIn = optInTxn.signTxn(account.sk);
                    return [4 /*yield*/, algodClient.sendRawTransaction(signedOptIn).do()];
                case 7:
                    txOpt = _a.sent();
                    return [4 /*yield*/, algosdk_1.default.waitForConfirmation(algodClient, txOpt.txid, 4)];
                case 8:
                    _a.sent();
                    console.log("✅ Opt-In Successful");

                    console.log("\n🎉 FULL TEST PASSED: Contract compiles, deploys, and accepts opt-in.");
                    console.log(`__APP_ID__:${appId}`);
                    return [2 /*return*/];
            }
        });
    });
}
main().catch(e => {
    console.error("❌ TEST FAILED");
    console.error("Error Message:", e.message);
    if (e.response) {
        console.error("Status:", e.status);
        if (e.response.body) {
            console.error("Response Body:", typeof e.response.body === 'object' ? JSON.stringify(e.response.body) : e.response.body.toString());
        } else if (e.response.text) {
            console.error("Response Text:", e.response.text);
        }
    } else {
        console.error("Full Error:", e);
    }
});
