const { executePayout } = require("./gameController");
// const OpenAI = require("openai");

// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const verifyCleanliness = async (req, res) => {
    const { image, walletAddress } = req.body;

    if (!image || !walletAddress) {
        return res.status(400).json({ message: "Image and wallet address required" });
    }

    console.log(`Verifying cleanliness for ${walletAddress}...`);

    try {
        // MOCK AI Verification Logic
        // In production:
        // const response = await openai.chat.completions.create({
        //     model: "gpt-4-vision-preview",
        //     messages: [
        //         {
        //             role: "user",
        //             content: [
        //                 { type: "text", text: "Is this room clean or messy? Reply JSON: {status: 'clean' | 'messy', confidence: number}" },
        //                 { type: "image_url", image_url: { url: image } },
        //             ],
        //         },
        //     ],
        // });
        // const result = JSON.parse(response.choices[0].message.content);

        // Simulated Result
        const isClean = Math.random() > 0.3; // 70% chance of being clean for demo
        const result = {
            status: isClean ? "clean" : "messy",
            confidence: 0.85 + Math.random() * 0.14
        };

        if (result.status === "clean") {
            // Trigger Algorand Payout
            console.log("Room is clean! Initiating payout...");
            const txId = await executePayout(walletAddress);

            if (txId) {
                return res.status(200).json({
                    ...result,
                    payoutTxId: txId,
                    message: "Cleanliness verified! Reward sent."
                });
            } else {
                return res.status(200).json({
                    ...result,
                    message: "Cleanliness verified, but payout failed (Check backend logs)."
                });
            }
        } else {
            return res.status(200).json({
                ...result,
                message: "Room considered messy. Please clean and try again."
            });
        }

    } catch (error) {
        console.error("Verification error:", error);
        res.status(500).json({ message: "Verification process failed" });
    }
};

module.exports = {
    verifyCleanliness
};
