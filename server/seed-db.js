const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");
const Game = require("./models/Game");
const PastGame = require("./models/pastGames");
const Asset = require("./models/Asset");

dotenv.config();

mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/miran_db")
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.error(err));

const seedData = async () => {
    try {
        console.log("Clearing existing data...");
        await User.deleteMany({});
        await Game.deleteMany({});
        await PastGame.deleteMany({});
        await Asset.deleteMany({});

        console.log("Creating Users...");
        const users = [
            { walletAddress: "ALGO_ADDR_1_TEST_ABC", username: "Campus_Champ", funds: 100 },
            { walletAddress: "ALGO_ADDR_2_TEST_XYZ", username: "Fitness_Freak", funds: 50 },
            { walletAddress: "ALGO_ADDR_3_TEST_LMN", username: "Clean_Monitor", funds: 75 },
        ];
        await User.insertMany(users);

        console.log("Creating Past Games (Leaderboard)...");
        const pastGames = [
            {
                players: [{ walletAddress: users[0].walletAddress, stakeAmount: 10 }, { walletAddress: users[1].walletAddress, stakeAmount: 10 }],
                winner: [users[0].walletAddress],
                prizePool: 20,
                timestamp: new Date(Date.now() - 86400000) // Yesterday
            },
            {
                players: [{ walletAddress: users[1].walletAddress, stakeAmount: 15 }, { walletAddress: users[2].walletAddress, stakeAmount: 15 }],
                winner: [users[1].walletAddress],
                prizePool: 30,
                timestamp: new Date(Date.now() - 172800000) // 2 days ago
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
