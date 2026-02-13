import { useState, useRef, useEffect } from "react";
import { FaPaperPlane, FaRobot, FaUser, FaCheckCircle } from "react-icons/fa";
import { toast } from "sonner";

interface ChatMessage {
    role: "user" | "assistant";
    content: string;
}

interface Need {
    description: string;
    reward: number;
    category: string;
}

interface MarketplaceChatProps {
    onContractReady: (need: Need) => void;
}

export function MarketplaceChat({ onContractReady }: MarketplaceChatProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: "assistant", content: "Hi! I'm your AI Market Assistant. I can help you build a smart contract for anything you need. What are you looking for?" }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg = input.trim();
        setInput("");
        const newMessages = [...messages, { role: "user" as const, content: userMsg }];
        setMessages(newMessages);
        setIsLoading(true);

        try {
            const res = await fetch("http://localhost:8000/api/marketplace/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: newMessages })
            });
            const data = await res.json();

            if (data.success) {
                setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);

                if (data.contract) {
                    toast.success("Contract details finalized!");
                    onContractReady(data.contract);
                }
            } else {
                console.error("AI Error Details:", data); // Log full error object
                toast.error("AI Error: " + data.message);
            }
        } catch (e) {
            console.error("Fetch/Network Error:", e); // Log network error
            toast.error("Connection error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[500px] bg-gray-900/50 rounded-2xl border border-white/10 overflow-hidden">
            {/* Header */}
            <div className="p-4 bg-gray-800/50 border-b border-white/5 flex items-center gap-3">
                <div className="p-2 bg-[var(--neon-purple)] rounded-lg">
                    <FaRobot className="text-white" />
                </div>
                <div>
                    <h3 className="font-bold text-white">AI Negotiator</h3>
                    <p className="text-xs text-green-400 flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        Online
                    </p>
                </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[80%] p-3 rounded-2xl ${msg.role === "user"
                            ? "bg-purple-600 text-white rounded-tr-none"
                            : "bg-gray-800 text-gray-200 rounded-tl-none border border-white/5"
                            }`}>
                            <p className="whitespace-pre-wrap">{msg.content.replace(/```json[\s\S]*```/, "").trim()}</p>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-gray-800 p-3 rounded-2xl rounded-tl-none border border-white/5 flex gap-1">
                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-75" />
                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-150" />
                        </div>
                    </div>
                )}
            </div>

            {/* Input */}
            <div className="p-4 bg-gray-800/30 border-t border-white/5">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        placeholder="Type your message..."
                        className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none transition-all"
                    />
                    <button
                        onClick={handleSend}
                        disabled={isLoading || !input.trim()}
                        className="p-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl transition-all disabled:opacity-50"
                    >
                        <FaPaperPlane />
                    </button>
                </div>
            </div>
        </div>
    );
}
