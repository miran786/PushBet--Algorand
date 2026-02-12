const mongoose = require("mongoose");
require("dotenv").config();

const uri = process.env.MONGO_URI || "mongodb://localhost:27017/miran_db";
console.log(`Testing connection to: ${uri}`);

mongoose.connect(uri)
    .then(() => {
        console.log("✅ MongoDB Connection Successful!");
        process.exit(0);
    })
    .catch((err) => {
        console.error("❌ MongoDB Connection Failed:", err);
        process.exit(1);
    });
