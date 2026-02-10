import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logPath = path.join(__dirname, '..', 'deploy_output_final.txt');

try {
    // Try reading as UTF-16LE
    const content = fs.readFileSync(logPath, 'utf16le');
    console.log(content);
} catch (e) {
    console.error("Failed to read log:", e.message);
}
