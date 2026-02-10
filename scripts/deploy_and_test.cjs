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
var fs = require("fs");
var path = require("path");
// --- CONFIG ---
var ALGOD_TOKEN = '';
var ALGOD_SERVER = 'https://testnet-api.algonode.cloud';
var ALGOD_PORT = 443;
var algodClient = new algosdk_1.default.Algodv2(ALGOD_TOKEN, ALGOD_SERVER, ALGOD_PORT);
// --- HELPER: Create Account ---
var account = algosdk_1.default.generateAccount();
console.log("TEST ACCOUNT GENERATED:");
console.log("Address:", account.addr);
console.log("Mnemonic:", algosdk_1.default.secretKeyToMnemonic(account.sk));
console.log("\n⚠️  PLEASE FUND THIS ACCOUNT ON TESTNET DISPENSER: https://bank.testnet.algorand.network/");
console.log("Waiting 15 seconds for funding...");
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
        var funded, commuteTealPath, commuteTeal, clearState, approvalBin, clearBin, params, txn, signedTxn, tx, confirmedTxn, appId, optInTxn, _a, _b, signedOptIn, txOpt, regTxn, _c, _d, signedReg, txReg, appAddr, payTxn, _e, _f, callTxn, _g, _h, txns, s1, s2, txTrip;
        var _j, _k, _l, _m;
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
                    // 1. Deploy Commute App
                    console.log("\n--- Deploying Commute App ---");
                    commuteTealPath = path.resolve('../contracts/commute_checkin.teal');
                    commuteTeal = fs.readFileSync(commuteTealPath, 'utf8');
                    clearState = "#pragma version 6\nint 1\nreturn";
                    return [4 /*yield*/, compileProgram(algodClient, commuteTeal)];
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
                        numLocalInts: 4, // trip_active, collateral, etc.
                        numLocalByteSlices: 4, // role, matched_with, etc.
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
                    appId = confirmedTxn["application-index"];
                    console.log("✅ Commute App Deployed! App ID:", appId);
                    // 2. Test Opt-In (Rider)
                    console.log("\n--- Testing Opt-In (Rider) ---");
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
                    // 3. Register as Rider
                    console.log("\n--- Registering as Rider ---");
                    _d = (_c = algosdk_1.default).makeApplicationNoOpTxnFromObject;
                    _k = {
                        sender: account.addr,
                        appIndex: appId,
                        appArgs: [new TextEncoder().encode("register_rider")]
                    };
                    return [4 /*yield*/, algodClient.getTransactionParams().do()];
                case 11:
                    regTxn = _d.apply(_c, [(_k.suggestedParams = _o.sent(),
                            _k)]);
                    signedReg = regTxn.signTxn(account.sk);
                    return [4 /*yield*/, algodClient.sendRawTransaction(signedReg).do()];
                case 12:
                    txReg = _o.sent();
                    return [4 /*yield*/, algosdk_1.default.waitForConfirmation(algodClient, txReg.txid, 4)];
                case 13:
                    _o.sent();
                    console.log("✅ Registered as Rider");
                    // 4. Start Trip (Deposit Collateral)
                    console.log("\n--- Starting Trip (Deposit 1 ALGO) ---");
                    appAddr = algosdk_1.default.getApplicationAddress(appId);
                    _f = (_e = algosdk_1.default).makePaymentTxnWithSuggestedParamsFromObject;
                    _l = {
                        sender: account.addr,
                        receiver: appAddr,
                        amount: 1000000
                    };
                    return [4 /*yield*/, algodClient.getTransactionParams().do()];
                case 14:
                    payTxn = _f.apply(_e, [(_l.suggestedParams = _o.sent(),
                            _l)]);
                    _h = (_g = algosdk_1.default).makeApplicationNoOpTxnFromObject;
                    _m = {
                        sender: account.addr,
                        appIndex: appId,
                        appArgs: [new TextEncoder().encode("start_trip")]
                    };
                    return [4 /*yield*/, algodClient.getTransactionParams().do()];
                case 15:
                    callTxn = _h.apply(_g, [(_m.suggestedParams = _o.sent(),
                            _m)]);
                    txns = [payTxn, callTxn];
                    algosdk_1.default.assignGroupID(txns);
                    s1 = payTxn.signTxn(account.sk);
                    s2 = callTxn.signTxn(account.sk);
                    return [4 /*yield*/, algodClient.sendRawTransaction([s1, s2]).do()];
                case 16:
                    txTrip = _o.sent();
                    return [4 /*yield*/, algosdk_1.default.waitForConfirmation(algodClient, txTrip.txid, 4)];
                case 17:
                    _o.sent();
                    console.log("✅ Trip Started & Collateral Locked");
                    console.log("\n🎉 ALL TESTS PASSED! The Commute App Logic is Valid.");
                    return [2 /*return*/];
            }
        });
    });
}
main().catch(console.error);
