import { Wallet } from "lucide-react";

export function ConnectWalletButton() {
  return (
    <button className="group relative px-8 py-3.5 rounded-full font-['Exo_2'] font-bold tracking-widest
                     overflow-hidden transition-all duration-300 hover:scale-105">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--algorand-cyan)] to-[var(--electric-volt)]" />
      
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--electric-volt)] to-[var(--algorand-cyan)] 
                    opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Glow effect */}
      <div className="absolute inset-0 rounded-full shadow-lg shadow-[var(--neon-cyan-glow)] 
                    group-hover:shadow-2xl group-hover:shadow-[var(--neon-cyan-glow)] transition-shadow duration-300" />
      
      {/* Border */}
      <div className="absolute inset-0 rounded-full border-2 border-transparent 
                    group-hover:border-white/20 transition-colors duration-300" />
      
      {/* Content */}
      <span className="relative flex items-center gap-2 text-[var(--deep-charcoal)]">
        <Wallet className="w-5 h-5" strokeWidth={2.5} />
        CONNECT WALLET
      </span>
    </button>
  );
}
