const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const User = require("./models/User");
const Game = require("./models/Game");
const PastGame = require("./models/pastGames");
const Asset = require("./models/Asset");

dotenv.config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/miran_db");
        console.log("MongoDB Connected");

        console.log("Clearing existing data...");
        await User.deleteMany({});
        await Game.deleteMany({});
        await PastGame.deleteMany({});
        await Asset.deleteMany({});

        console.log("Creating Users...");
        const hashedPassword = await bcrypt.hash("password123", 10);
        const users = [
            {
                email: "champ@campus.edu",
                password: hashedPassword,
                walletAddress: "ALGO_ADDR_1_TEST_ABC",
                username: "Student 1",
                funds: 100
            },
            {
                email: "fitness@campus.edu",
                password: hashedPassword,
                walletAddress: "ALGO_ADDR_2_TEST_XYZ",
                username: "Student 2",
                funds: 50
            },
            {
                email: "monitor@campus.edu",
                password: hashedPassword,
                walletAddress: "ALGO_ADDR_3_TEST_LMN",
                username: "Student 3",
                funds: 75
            },
            {
                email: "test@test.com",
                password: hashedPassword,
                username: "Student 4",
                walletAddress: "ALGO_DEV_TEST_ADDR",
                funds: 1000
            }
        ];
        await User.insertMany(users);

        console.log("Creating Past Games (Leaderboard)...");
        const pastGames = [

            {
                players: [{ walletAddress: users[0].walletAddress, stakeAmount: 10 }, { walletAddress: users[1].walletAddress, stakeAmount: 10 }],
                winner: [users[0].walletAddress],
                targetPushups: 20,
                stakeAmount: 10,
                responses: [
                    { walletAddress: users[0].walletAddress, response: "yes" },
                    { walletAddress: users[1].walletAddress, response: "yes" }
                ]
            },
            {
                players: [{ walletAddress: users[1].walletAddress, stakeAmount: 15 }, { walletAddress: users[2].walletAddress, stakeAmount: 15 }],
                winner: [users[1].walletAddress],
                targetPushups: 30,
                stakeAmount: 15,
                responses: [
                    { walletAddress: users[1].walletAddress, response: "yes" },
                    { walletAddress: users[2].walletAddress, response: "no" }
                ]
            }
        ];
        await PastGame.insertMany(pastGames);

        console.log("Creating Active Asset Loans...");
        const assets = [
            { itemId: "Projector_X1", borrower: users[2].walletAddress, depositTxId: "TX_ID_MOCK_123", status: "borrowed" }
        ];
        await Asset.insertMany(assets);

        console.log("Database seeded successfully!");
        process.exit();
    } catch (error) {
        console.error("Error seeding database:", error);
        process.exit(1);
    }
};

seedData();
