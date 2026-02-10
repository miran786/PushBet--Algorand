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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
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

// --- CONFIG ---
var ALGOD_TOKEN = '';
var ALGOD_SERVER = 'https://testnet-api.algonode.cloud';
var ALGOD_PORT = 443;
var algodClient = new algosdk_1.default.Algodv2(ALGOD_TOKEN, ALGOD_SERVER, ALGOD_PORT);

// --- HELPER: Use Funded Account ---
// Mnemonic provided by previous run
var MNEMONIC = "switch also east able item youth moon rigid rice fetch blame skin snack luxury patrol leaf tool symbol blind lottery return elder sponsor absent old";
var account = algosdk_1.default.mnemonicToSecretKey(MNEMONIC);

console.log("USING ACCOUNT:");
console.log("Address:", account.addr);

var delay = function (ms) { return new Promise(function (res) { return setTimeout(res, ms); }); };

function waitForBalance(addr) {
    return __awaiter(this, void 0, void 0, function () {
        var i, info, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("Checking balance...");
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < 10)) return [3 /*break*/, 8];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, algodClient.accountInformation(addr).do()];
                case 3:
                    info = _a.sent();
                    console.log("Balance: ".concat(info.amount, " microAlgos"));
                    if (info.amount >= 1100000) { // 1.1 ALGO
                        return [2 /*return*/, true];
                    }
                    return [3 /*break*/, 5];
                case 4:
                    e_1 = _a.sent();
                    console.error("Error fetching balance:", e_1.message);
                    return [3 /*break*/, 5];
                case 5: return [4 /*yield*/, delay(2000)];
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

function main() {
    return __awaiter(this, void 0, void 0, function () {
        var funded, params, txn, signedTxn, tx, confirmedTxn;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, waitForBalance(account.addr)];
                case 1:
                    funded = _a.sent();
                    if (!funded) {
                        console.error("\n❌ Account balance too low (< 1.1 ALGO).");
                        process.exit(1);
                    }

                    console.log("\n--- Staking 1 ALGO ---");
                    return [4 /*yield*/, algodClient.getTransactionParams().do()];
                case 2:
                    params = _a.sent();
                    txn = algosdk_1.default.makePaymentTxnWithSuggestedParamsFromObject({
                        sender: account.addr,
                        receiver: account.addr, // Self-transaction
                        amount: 1000000, // 1 ALGO
                        note: new TextEncoder().encode("PushBet Stake: 1 ALGO | Verified by Agent"),
                        suggestedParams: params,
                    });

                    signedTxn = txn.signTxn(account.sk);
                    return [4 /*yield*/, algodClient.sendRawTransaction(signedTxn).do()];
                case 3:
                    tx = _a.sent();
                    console.log("Staking TxID:", tx.txid);
                    return [4 /*yield*/, algosdk_1.default.waitForConfirmation(algodClient, tx.txid, 4)];
                case 4:
                    confirmedTxn = _a.sent();
                    console.log("✅ Stake Confirmed! Block:", confirmedTxn["confirmed-round"]);
                    return [2 /*return*/];
            }
        });
    });
}
main().catch(console.error);
