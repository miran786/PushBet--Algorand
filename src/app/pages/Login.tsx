import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { FaUser, FaLock } from "react-icons/fa";

export function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { login } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await fetch("http://localhost:8000/api/users/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();

            if (data.success) {
                login(data.token, data.user);
                navigate("/");
            } else {
                toast.error(data.message || "Login failed");
            }
        } catch (error) {
            toast.error("Server error. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-black/90 p-4">
            <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-3xl p-8 shadow-2xl">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-[var(--electric-volt)]">Welcome Back</h1>
                    <p className="text-gray-400">Sign in to access the Campus Protocol</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-gray-400 text-sm font-bold mb-2">Email</label>
                        <div className="relative">
                            <FaUser className="absolute left-3 top-3 text-gray-500" />
                            <input
                                type="email"
                                className="w-full bg-gray-800 border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[var(--electric-volt)]"
                                placeholder="student@university.edu"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-gray-400 text-sm font-bold mb-2">Password</label>
                        <div className="relative">
                            <FaLock className="absolute left-3 top-3 text-gray-500" />
                            <input
                                type="password"
                                className="w-full bg-gray-800 border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[var(--electric-volt)]"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-[var(--electric-volt)] text-black font-bold py-3 rounded-xl hover:bg-yellow-400 transition-all disabled:opacity-50"
                    >
                        {isLoading ? "Signing In..." : "Sign In"}
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setEmail("test@test.com");
                            setPassword("password123");
                        }}
                        className="w-full mt-4 bg-gray-800 text-gray-400 font-bold py-2 rounded-xl hover:bg-gray-700 transition-all text-xs border border-gray-700"
                    >
                        ⚡ DEV LOGIN (TestUser)
                    </button>
                </form>

                <div className="mt-6 text-center text-gray-400 text-sm">
                    Don't have an account? <Link to="/signup" className="text-[var(--electric-volt)] hover:underline">Sign Up</Link>
                </div>
            </div>
        </div>
    );
}
