import { useState } from "react";
import { VideoFeed } from "../components/VideoFeed";
import { ConnectWalletButton } from "../components/ConnectWalletButton";
import { StakeDialog } from "../components/StakeDialog";

export function Arena() {
  const [showStakeDialog, setShowStakeDialog] = useState(false);

  return (
    <>
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-['Exo_2'] font-black text-4xl tracking-wider mb-2">
            <span className="bg-gradient-to-r from-[var(--algorand-cyan)] to-[var(--electric-volt)] bg-clip-text text-transparent">
              PUSHBET
            </span>
          </h1>
          <p className="text-white/60 font-['Rajdhani'] tracking-wide">
            Prove your reps. Win your stake.
          </p>
        </div>

        {/* Connect Wallet Button */}
        <ConnectWalletButton />
      </div>

      {/* Main Video Feed Container */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Central Video Feed - Takes 2 columns */}
        <div className="xl:col-span-2">
          <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 
                        shadow-2xl shadow-black/50 overflow-hidden">
            {/* Glassmorphism overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />
            
            {/* Video Feed */}
            <div className="relative aspect-video">
              <VideoFeed imageUrl="https://images.unsplash.com/photo-1662386392754-c0fe8e9dc7af?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJzb24lMjBkb2luZyUyMHB1c2h1cCUyMHdvcmtvdXR8ZW58MXx8fHwxNzcwMTgzODA0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" />
            </div>

            {/* Status label */}
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[var(--electric-volt)] animate-pulse shadow-lg shadow-[var(--neon-green-glow)]" />
                <span className="font-['Rajdhani'] font-semibold text-sm tracking-wider text-white/80">
                  LIVE TRACKING
                </span>
              </div>
              <button 
                onClick={() => setShowStakeDialog(true)}
                className="px-6 py-2 rounded-lg font-['Exo_2'] font-bold tracking-wider text-sm
                         bg-gradient-to-r from-[var(--algorand-cyan)]/20 to-[var(--electric-volt)]/20
                         border border-[var(--algorand-cyan)]/50 text-white
                         hover:from-[var(--algorand-cyan)]/30 hover:to-[var(--electric-volt)]/30
                         transition-all duration-300 shadow-lg shadow-[var(--neon-cyan-glow)]/30">
                PLACE STAKE
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar Stats */}
        <div className="space-y-6">
          {/* HUD Stats Card */}
          <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 
                        shadow-2xl shadow-black/50 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />
            
            <div className="relative space-y-4">
              <h3 className="font-['Exo_2'] font-bold tracking-wider text-[var(--algorand-cyan)] mb-4">
                SESSION STATS
              </h3>
              
              {/* Rep Count */}
              <div>
                <div className="text-white/60 text-sm font-['Rajdhani'] mb-1 tracking-wide">Rep Count</div>
                <div className="font-['Exo_2'] font-black text-5xl tracking-tight">
                  <span className="bg-gradient-to-r from-[var(--electric-volt)] to-[var(--algorand-cyan)] bg-clip-text text-transparent">
                    18
                  </span>
                  <span className="text-white/40 text-3xl">/20</span>
                </div>
                <div className="mt-2 w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full w-[90%] bg-gradient-to-r from-[var(--electric-volt)] to-[var(--algorand-cyan)] rounded-full
                                shadow-lg shadow-[var(--neon-green-glow)]" />
                </div>
              </div>

              {/* Stake Amount */}
              <div className="pt-4 border-t border-white/10">
                <div className="text-white/60 text-sm font-['Rajdhani'] mb-1 tracking-wide">Current Stake</div>
                <div className="font-['Exo_2'] font-black text-3xl tracking-tight text-[var(--algorand-cyan)]">
                  50 ALGO
                </div>
              </div>

              {/* Timer */}
              <div className="pt-4 border-t border-white/10">
                <div className="text-white/60 text-sm font-['Rajdhani'] mb-1 tracking-wide">Time Remaining</div>
                <div className="font-['Exo_2'] font-bold text-2xl tracking-tight text-white">
                  02:47
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 
                        shadow-2xl shadow-black/50 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />
            
            <div className="relative space-y-3">
              <h3 className="font-['Exo_2'] font-bold tracking-wider text-[var(--electric-volt)] mb-4">
                TOP PLAYERS
              </h3>
              
              {[
                { rank: 1, name: "CryptoAthlete", reps: 100, prize: "250 ALGO" },
                { rank: 2, name: "BlockchainBuff", reps: 95, prize: "150 ALGO" },
                { rank: 3, name: "AlgoWarrior", reps: 87, prize: "75 ALGO" },
              ].map((player) => (
                <div key={player.rank} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5
                                                 hover:bg-white/10 hover:border-[var(--algorand-cyan)]/30 transition-all duration-200">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-['Exo_2'] font-bold
                                 ${player.rank === 1 ? 'bg-gradient-to-br from-[var(--electric-volt)] to-[var(--algorand-cyan)] text-[var(--deep-charcoal)]' : 'bg-white/10 text-white/60'}`}>
                    {player.rank}
                  </div>
                  <div className="flex-1">
                    <div className="font-['Rajdhani'] font-semibold text-white text-sm">{player.name}</div>
                    <div className="text-white/40 text-xs">{player.reps} reps</div>
                  </div>
                  <div className="font-['Exo_2'] font-bold text-[var(--algorand-cyan)] text-sm">
                    {player.prize}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stake Dialog */}
      <StakeDialog open={showStakeDialog} onOpenChange={setShowStakeDialog} />
    </>
  );
}
