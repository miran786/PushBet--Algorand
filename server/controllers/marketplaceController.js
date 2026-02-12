const Need = require("../models/Need");
const Claim = require("../models/Claim");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Use server-side env or fallback
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

// Helper: get Gemini model
function getGeminiModel() {
    if (!GEMINI_API_KEY) {
        console.warn("[Marketplace] No GEMINI_API_KEY set — AI features disabled");
        return null;
    }
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    return genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
}

// POST /needs — Create a new need
exports.createNeed = async (req, res) => {
    try {
        const { description, reward, requesterWallet } = req.body;

        if (!description || !reward || !requesterWallet) {
            return res.status(400).json({ success: false, message: "description, reward, and requesterWallet are required" });
        }

        let category = "general";
        let aiTerms = "Submit a photo or description as proof of completion.";

        // Use Gemini to analyze the need and generate terms
        const model = getGeminiModel();
        if (model) {
            try {
                const prompt = `You are an AI contract builder for a campus marketplace. A student has posted this need:
"${description}"

Analyze this need and respond with ONLY valid JSON (no markdown, no code blocks):
{
  "category": "one of: lost_item, notes, errand, tutoring, transport, food, electronics, other",
  "terms": "A clear, specific description of what proof the fulfiller must submit to verify they completed this need. Be specific about what photo or evidence is needed."
}`;

                const result = await model.generateContent(prompt);
                const text = result.response.text();
                const jsonMatch = text.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const parsed = JSON.parse(jsonMatch[0]);
                    category = parsed.category || "general";
                    aiTerms = parsed.terms || aiTerms;
                }
            } catch (aiErr) {
                console.error("[Marketplace] Gemini error:", aiErr.message);
                // Proceed with defaults
            }
        }

        const need = await Need.create({
            requesterWallet,
            description,
            reward,
            category,
            aiTerms
        });

        res.json({
            success: true,
            need,
            message: "Need created with AI-generated terms"
        });
    } catch (err) {
        console.error("[Marketplace] createNeed error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// GET /needs — List all open needs
exports.getNeeds = async (req, res) => {
    try {
        const needs = await Need.find({ status: { $in: ["open", "claimed"] } })
            .sort({ createdAt: -1 })
            .limit(50);
        res.json({ success: true, needs });
    } catch (err) {
        console.error("[Marketplace] getNeeds error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// GET /needs/:id — Get a single need with claims
exports.getNeed = async (req, res) => {
    try {
        const need = await Need.findById(req.params.id);
        if (!need) return res.status(404).json({ success: false, message: "Need not found" });

        const claims = await Claim.find({ needId: need._id }).sort({ createdAt: -1 });
        res.json({ success: true, need, claims });
    } catch (err) {
        console.error("[Marketplace] getNeed error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// POST /needs/:id/claim — Claim a need
exports.claimNeed = async (req, res) => {
    try {
        const { claimerWallet } = req.body;
        if (!claimerWallet) {
            return res.status(400).json({ success: false, message: "claimerWallet is required" });
        }

        const need = await Need.findById(req.params.id);
        if (!need) return res.status(404).json({ success: false, message: "Need not found" });
        if (need.status !== "open") return res.status(400).json({ success: false, message: "Need is not open" });
        if (need.requesterWallet === claimerWallet) {
            return res.status(400).json({ success: false, message: "Cannot claim your own need" });
        }

        need.status = "claimed";
        need.claimedBy = claimerWallet;
        await need.save();

        res.json({ success: true, need, message: "Need claimed successfully" });
    } catch (err) {
        console.error("[Marketplace] claimNeed error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// POST /needs/:id/submit-proof — Submit proof for AI verification
exports.submitProof = async (req, res) => {
    try {
        const { claimerWallet, proofDescription, proofImage } = req.body;
        if (!claimerWallet || !proofDescription) {
            return res.status(400).json({ success: false, message: "claimerWallet and proofDescription are required" });
        }

        const need = await Need.findById(req.params.id);
        if (!need) return res.status(404).json({ success: false, message: "Need not found" });
        if (need.status !== "claimed") {
            return res.status(400).json({ success: false, message: "Need must be claimed before submitting proof" });
        }
        if (need.claimedBy !== claimerWallet) {
            return res.status(400).json({ success: false, message: "Only the claimer can submit proof" });
        }

        let aiVerified = false;
        let aiConfidence = 0;
        let aiReason = "AI verification unavailable — defaulting to manual review.";

        // Use Gemini to verify the proof
        const model = getGeminiModel();
        if (model) {
            try {
                const parts = [];

                const textPrompt = `You are an AI verification oracle for a campus marketplace smart contract.

ORIGINAL NEED: "${need.description}"
REQUIRED PROOF (AI-generated terms): "${need.aiTerms}"
SUBMITTED PROOF DESCRIPTION: "${proofDescription}"

${proofImage ? "A proof image has also been submitted (see attached)." : "No proof image was submitted."}

Analyze whether the submitted proof satisfactorily fulfills the original need according to the required terms.
Respond with ONLY valid JSON (no markdown, no code blocks):
{
  "verified": true or false,
  "confidence": 0.0 to 1.0,
  "reason": "Brief explanation of your verification decision"
}`;

                parts.push(textPrompt);

                // If proof image is a base64 data URL, send it to Gemini
                if (proofImage && proofImage.startsWith("data:image")) {
                    const base64Data = proofImage.split(",")[1];
                    const mimeType = proofImage.split(";")[0].split(":")[1];
                    parts.push({
                        inlineData: { data: base64Data, mimeType: mimeType || "image/jpeg" }
                    });
                }

                const result = await model.generateContent(parts);
                const text = result.response.text();
                const jsonMatch = text.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const parsed = JSON.parse(jsonMatch[0]);
                    aiVerified = parsed.verified === true && (parsed.confidence || 0) > 0.7;
                    aiConfidence = parsed.confidence || 0;
                    aiReason = parsed.reason || "No reason provided";
                }
            } catch (aiErr) {
                console.error("[Marketplace] Gemini verification error:", aiErr.message);
            }
        }

        // Create the claim record
        const claim = await Claim.create({
            needId: need._id,
            claimerWallet,
            proofDescription,
            proofImage: proofImage ? "(image submitted)" : "",
            aiVerified,
            aiConfidence,
            aiReason
        });

        // If verified, mark need as completed
        if (aiVerified) {
            need.status = "completed";
            await need.save();
        }

        res.json({
            success: true,
            verified: aiVerified,
            confidence: aiConfidence,
            reason: aiReason,
            claim,
            message: aiVerified
                ? "✅ Proof verified! Payment can be released."
                : "❌ Proof not verified. " + aiReason
        });
    } catch (err) {
        console.error("[Marketplace] submitProof error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
