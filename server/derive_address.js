const algosdk = require('algosdk');
const mnemonic = "bronze leader soul average wage produce hold swarm feed differ faint harvest word fitness skirt fork detail shrug soul current clever announce tail able write";
try {
    const account = algosdk.mnemonicToSecretKey(mnemonic);
    console.log("Address: " + account.addr);
} catch (e) {
    console.error(e);
}
