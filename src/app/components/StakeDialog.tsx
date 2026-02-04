import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Coins, TrendingUp } from "lucide-react";

interface StakeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StakeDialog({ open, onOpenChange }: StakeDialogProps) {
  const [stakeAmount, setStakeAmount] = useState("50");
  const [repTarget, setRepTarget] = useState("20");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[var(--matte-black)] border-2 border-[var(--algorand-cyan)]/30 text-white max-w-lg
                               backdrop-blur-xl shadow-2xl shadow-[var(--neon-cyan-glow)]/50">
        <DialogHeader>
          <DialogTitle className="font-['Exo_2'] font-black text-3xl tracking-wider">
            <span className="bg-gradient-to-r from-[var(--algorand-cyan)] to-[var(--electric-volt)] bg-clip-text text-transparent">
              PLACE YOUR STAKE
            </span>
          </DialogTitle>
          <DialogDescription className="font-['Rajdhani'] text-white/60 text-base">
            Set your stake amount and rep target to enter the challenge
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Stake Amount */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 font-['Rajdhani'] font-semibold text-sm tracking-wider text-[var(--algorand-cyan)]">
              <Coins className="w-4 h-4" />
              STAKE AMOUNT
            </label>
            <div className="relative">
              <input
                type="number"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                className="w-full px-4 py-4 rounded-xl bg-white/5 border-2 border-white/10 
                         focus:border-[var(--algorand-cyan)]/50 outline-none
                         font-['Exo_2'] font-bold text-2xl tracking-tight text-white
                         transition-all duration-300 pr-20"
                placeholder="50"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 font-['Exo_2'] font-bold text-lg text-[var(--algorand-cyan)]">
                ALGO
              </div>
            </div>
            <div className="flex gap-2">
              {["10", "25", "50", "100"].map((amount) => (
                <button
                  key={amount}
                  onClick={() => setStakeAmount(amount)}
                  className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10
                           hover:bg-[var(--algorand-cyan)]/20 hover:border-[var(--algorand-cyan)]/50
                           font-['Rajdhani'] font-semibold text-sm transition-all duration-200"
                >
                  {amount}
                </button>
              ))}
            </div>
          </div>

          {/* Rep Target */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 font-['Rajdhani'] font-semibold text-sm tracking-wider text-[var(--electric-volt)]">
              <TrendingUp className="w-4 h-4" />
              REP TARGET
            </label>
            <div className="relative">
              <input
                type="number"
                value={repTarget}
                onChange={(e) => setRepTarget(e.target.value)}
                className="w-full px-4 py-4 rounded-xl bg-white/5 border-2 border-white/10 
                         focus:border-[var(--electric-volt)]/50 outline-none
                         font-['Exo_2'] font-bold text-2xl tracking-tight text-white
                         transition-all duration-300 pr-20"
                placeholder="20"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 font-['Exo_2'] font-bold text-lg text-[var(--electric-volt)]">
                REPS
              </div>
            </div>
            <div className="flex gap-2">
              {["10", "20", "30", "50"].map((reps) => (
                <button
                  key={reps}
                  onClick={() => setRepTarget(reps)}
                  className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10
                           hover:bg-[var(--electric-volt)]/20 hover:border-[var(--electric-volt)]/50
                           font-['Rajdhani'] font-semibold text-sm transition-all duration-200"
                >
                  {reps}
                </button>
              ))}
            </div>
          </div>

          {/* Potential Win */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-[var(--algorand-cyan)]/10 to-[var(--electric-volt)]/10
                        border border-[var(--algorand-cyan)]/30">
            <div className="flex justify-between items-center">
              <span className="font-['Rajdhani'] text-white/80">Potential Win:</span>
              <span className="font-['Exo_2'] font-black text-2xl bg-gradient-to-r from-[var(--algorand-cyan)] to-[var(--electric-volt)] bg-clip-text text-transparent">
                {(parseFloat(stakeAmount || "0") * 1.8).toFixed(1)} ALGO
              </span>
            </div>
          </div>

          {/* Confirm Button */}
          <button
            onClick={() => {
              // Handle stake placement
              onOpenChange(false);
            }}
            className="w-full py-4 rounded-xl font-['Exo_2'] font-bold tracking-widest
                     bg-gradient-to-r from-[var(--algorand-cyan)] to-[var(--electric-volt)]
                     text-[var(--deep-charcoal)] shadow-lg shadow-[var(--neon-cyan-glow)]
                     hover:shadow-xl hover:shadow-[var(--neon-cyan-glow)] transition-all duration-300
                     hover:scale-105"
          >
            CONFIRM STAKE
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
