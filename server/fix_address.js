const algosdk = require('algosdk');
const fs = require('fs');
const path = require('path');

const mnemonic = "bronze leader soul average wage produce hold swarm feed differ faint harvest word fitness skirt fork detail shrug soul current clever announce tail able write";
const account = algosdk.mnemonicToSecretKey(mnemonic);
const validAddress = account.addr;
console.log("Valid Address:", validAddress);

const files = [
    '../src/app/pages/Marketplace.tsx',
    '../src/app/pages/Admin.tsx',
    '../src/app/components/StakeDialog.tsx'
];

const truncatedAddress = "HZ57J3K46JIJXILONBBZOHX6BKPXEM2VVXNRFSUC35DQYIJCKQKZQ";

files.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        if (content.includes(truncatedAddress)) {
            content = content.replace(new RegExp(truncatedAddress, 'g'), validAddress);
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Updated ${file}`);
        } else {
            console.log(`No match in ${file}`);
        }
    } else {
        console.error(`File not found: ${filePath}`);
    }
});
