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
var MNEMONIC = "switch also east able item youth moon rigid rice fetch blame skin snack luxury patrol leaf tool symbol blind lottery return elder sponsor absent old";
var account = algosdk_1.default.mnemonicToSecretKey(MNEMONIC);

console.log("USING ACCOUNT:");
console.log("Address:", account.addr);
// console.log("Mnemonic:", algosdk_1.default.secretKeyToMnemonic(account.sk));
// console.log("\n⚠️  PLEASE FUND THIS ACCOUNT ON TESTNET DISPENSER: https://bank.testnet.algorand.network/");
// console.log("Waiting 15 seconds for funding...");

var delay = function (ms) { return new Promise(function (res) { return setTimeout(res, ms); }); };

function waitForBalance(addr) {
    return __awaiter(this, void 0, void 0, function () {
        var i, info, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < 30)) return [3 /*break*/, 8];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, algodClient.accountInformation(addr).do()];
                case 3:
                    info = _a.sent();
                    if (info.amount > 0) {
                        console.log("\nFunds received! Balance: ".concat(info.amount, " microAlgos"));
                        return [2 /*return*/, true];
                    }
                    return [3 /*break*/, 5];
                case 4:
                    e_1 = _a.sent();
                    return [3 /*break*/, 5];
                case 5:
                    process.stdout.write(".");
                    return [4 /*yield*/, delay(2000)];
                case 6:
                    _a.sent();
                    _a.label = 7;
                case 7:
                    i++;
                    return [3 /*break*/, 1];
                case 8: return [2 /*return*/, false];
            }
        });
    });
}

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

// --- DEPLOY SCRIPT ---
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var funded, assetTealPath, assetTeal, clearState, approvalBin, clearBin, params, txn, signedTxn, tx, confirmedTxn, appId, optInTxn, _a, _b, signedOptIn, txOpt;
        var _j;
        return __generator(this, function (_o) {
            switch (_o.label) {
                case 0: return [4 /*yield*/, delay(5000)];
                case 1:
                    _o.sent(); // Give user time to read address
                    return [4 /*yield*/, waitForBalance(account.addr)];
                case 2:
                    funded = _o.sent();
                    if (!funded) {
                        console.error("\n❌ Account not funded in time. Aborting.");
                        process.exit(1);
                    }

                    // 1. Deploy Asset Lending App
                    console.log("\n--- Deploying Asset Lending App ---");
                    assetTealPath = path.resolve(__dirname, '../contracts/asset_escrow.teal');
                    assetTeal = fs.readFileSync(assetTealPath, 'utf8');
                    clearState = "#pragma version 8\nint 1\nreturn";
                    return [4 /*yield*/, compileProgram(algodClient, assetTeal)];
                case 3:
                    approvalBin = _o.sent();
                    return [4 /*yield*/, compileProgram(algodClient, clearState)];
                case 4:
                    clearBin = _o.sent();
                    return [4 /*yield*/, algodClient.getTransactionParams().do()];
                case 5:
                    params = _o.sent();
                    txn = algosdk_1.default.makeApplicationCreateTxnFromObject({
                        sender: account.addr,
                        approvalProgram: approvalBin,
                        clearProgram: clearBin,
                        numLocalInts: 4, // item_id, collateral, borrow_time
                        numLocalByteSlices: 4,
                        numGlobalInts: 0,
                        numGlobalByteSlices: 0,
                        onComplete: algosdk_1.default.OnApplicationComplete.NoOpOC,
                        suggestedParams: params,
                    });
                    signedTxn = txn.signTxn(account.sk);
                    return [4 /*yield*/, algodClient.sendRawTransaction(signedTxn).do()];
                case 6:
                    tx = _o.sent();
                    console.log("Deploy TxID:", tx.txid);
                    return [4 /*yield*/, algosdk_1.default.waitForConfirmation(algodClient, tx.txid, 4)];
                case 7:
                    confirmedTxn = _o.sent();
                    appId = confirmedTxn["application-index"] || confirmedTxn.applicationIndex;
                    console.log("✅ Asset Lending App Deployed! App ID:", appId);

                    // 2. Test Opt-In
                    console.log("\n--- Testing Opt-In ---");
                    _b = (_a = algosdk_1.default).makeApplicationOptInTxnFromObject;
                    _j = {
                        sender: account.addr,
                        appIndex: appId
                    };
                    return [4 /*yield*/, algodClient.getTransactionParams().do()];
                case 8:
                    optInTxn = _b.apply(_a, [(_j.suggestedParams = _o.sent(),
                        _j)]);
                    signedOptIn = optInTxn.signTxn(account.sk);
                    return [4 /*yield*/, algodClient.sendRawTransaction(signedOptIn).do()];
                case 9:
                    txOpt = _o.sent();
                    return [4 /*yield*/, algosdk_1.default.waitForConfirmation(algodClient, txOpt.txid, 4)];
                case 10:
                    _o.sent();
                    console.log("✅ Opt-In Successful");
                    console.log("\n🎉 Deployment & Opt-In Complete.");
                    return [2 /*return*/];
            }
        });
    });
}
main().catch(console.error);
