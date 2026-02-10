// @ts-nocheck
import { useState, useEffect } from "react";
import { VideoFeed } from "../components/VideoFeed";
import { StakeDialog } from "../components/StakeDialog";
import { toast } from "sonner";

export function Arena() {
  const [showStakeDialog, setShowStakeDialog] = useState(false);
  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'FINISHED'>('IDLE');
  const [repCount, setRepCount] = useState(0);
  const [repTarget, setRepTarget] = useState(20);

  const [timeLeft, setTimeLeft] = useState(15);
  const [gameResult, setGameResult] = useState<'WIN' | 'LOSS' | null>(null);
  const [calories, setCalories] = useState(0);
  const [burnEarned, setBurnEarned] = useState(0);

  // Timer Logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState === 'PLAYING' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && gameState === 'PLAYING') {
      handleGameOver("LOSS");
    }
    return () => clearInterval(timer);
  }, [timeLeft, gameState]);

  const handleGameOver = async (result: "WIN" | "LOSS") => {
    setGameState('FINISHED');
    setGameResult(result);

    if (result === "LOSS") {
      toast.error("Time's up! Stake lost to House.");
    } else {
      toast.success("Target Reached! Challenge Complete!");
    }

    // Calculate $BURN tokens (1 per 10 (lowered from 100 for demo) kcal)
    // 10 pushups = 5 kcal. So maybe 1 per 5 kcal for demo?
    // Let's do: 1 Pushup = 0.5 Kcal. To get 1 Token, need 5 pushups (2.5kcal)?
    // Let's make it easy: 1 Rep = 1 Token for HACKATHON DEMO excitement.
    // Or strictly: if calories > 2, mint.

    const finalCalories = repCount * 0.5;
    if (finalCalories > 0) {
      try {
        // Fire and forget minting for smoother UI
        fetch('http://localhost:8000/api/gamification/burn/mint', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            walletAddress: "DEMO_USER", // Replace with actual activeAccount?.address
            calories: finalCalories * 200 // Multiply by 200 to hack the backend divide by 100 threshold for demo
          })
        }).then(res => res.json()).then(data => {
          if (data.minted > 0) setBurnEarned(data.minted);
        });
      } catch (e) {
        console.error("Mint failed", e);
      }
    }
  };

  const handleStakeSuccess = () => {
    setGameState('PLAYING');
    setRepCount(0);
    setCalories(0); // Reset calories
    setBurnEarned(0); // Reset burn earned
    setTimeLeft(15); // Reset timer
    setGameResult(null);
    toast.success("Game Started! 15 Seconds on the clock!");
  };

  const handleRepCount = (count: number) => {
    if (gameState !== 'PLAYING') return;

    setRepCount(count);
    if (count >= repTarget) {
      setGameState('FINISHED');
      setGameResult('WIN');
      toast.success("Target Reached! Challenge Complete!");
    }
  };

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
              <VideoFeed
                isActive={true}
                onRepCount={handleRepCount}
              />
            </div>

            {/* Status label */}
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${gameState === 'PLAYING' ? 'bg-[var(--electric-volt)] animate-pulse' : 'bg-white/20'} shadow-lg`} />
                <span className="font-['Rajdhani'] font-semibold text-sm tracking-wider text-white/80">
                  {gameState === 'PLAYING' ? 'LIVE TRACKING' : 'PREVIEW / WARMUP'}
                </span>
              </div>

              {gameState === 'IDLE' && (
                <button
                  onClick={() => setShowStakeDialog(true)}
                  className="px-6 py-2 rounded-lg font-['Exo_2'] font-bold tracking-wider text-sm
                            bg-gradient-to-r from-[var(--algorand-cyan)]/20 to-[var(--electric-volt)]/20
                            border border-[var(--algorand-cyan)]/50 text-white
                            hover:from-[var(--algorand-cyan)]/30 hover:to-[var(--electric-volt)]/30
                            transition-all duration-300 shadow-lg shadow-[var(--neon-cyan-glow)]/30">
                  PLACE STAKE
                </button>
              )}

              {gameState === 'PLAYING' && (
                <div className="font-['Exo_2'] font-bold text-[var(--electric-volt)]">
                  GAME IN PROGRESS
                </div>
              )}

              {gameState === 'FINISHED' && (
                <div className="absolute inset-0 flex items-center justify-center z-10 p-8 bg-black/60 backdrop-blur-md rounded-2xl border border-white/10">
                  <div className="text-center">
                    <h2 className={`text-6xl font-black mb-4 ${gameResult === "WIN" ? "text-[var(--neon-green)]" : "text-red-500"}`}>
                      {gameResult === "WIN" ? "VICTORY" : "DEFEAT"}
                    </h2>
                    <p className="text-2xl text-white mb-6 font-['Rajdhani']">
                      {gameResult === "WIN" ? "Target Crushed!" : "Time's Up!"}
                    </p>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                      <div className="p-4 bg-white/5 rounded-xl">
                        <div className="text-sm text-white/60">Reps</div>
                        <div className="text-2xl font-bold text-white">{repCount}</div>
                      </div>
                      <div className="p-4 bg-white/5 rounded-xl">
                        <div className="text-sm text-white/60">Calories</div>
                        <div className="text-2xl font-bold text-[var(--electric-volt)]">{calories.toFixed(1)}</div>
                      </div>
                      {burnEarned > 0 && (
                        <div className="col-span-2 p-4 bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/50 rounded-xl">
                          <div className="text-sm text-orange-300 uppercase tracking-widest">Rewards</div>
                          <div className="text-3xl font-black text-white flex items-center justify-center gap-2">
                            🔥 +{burnEarned} $BURN
                          </div>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={resetGame}
                      className="px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-colors"
                    >
                      Play Again
                    </button>
                  </div>
                </div>
              )}
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
                    {repCount}
                  </span>
                  <span className="text-white/40 text-3xl">/{repTarget}</span>
                </div>
                <div className="mt-2 w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[var(--electric-volt)] to-[var(--algorand-cyan)] rounded-full shadow-lg shadow-[var(--neon-green-glow)] transition-all duration-300"
                    style={{ width: `${Math.min((repCount / repTarget) * 100, 100)}%` }}
                  />
                </div>
              </div>

              {/* Stake Amount */}
              <div className="pt-4 border-t border-white/10">
                <div className="text-white/60 text-sm font-['Rajdhani'] mb-1 tracking-wide">Current Stake</div>
                <div className="font-['Exo_2'] font-black text-3xl tracking-tight text-[var(--algorand-cyan)]">
                  {gameState === 'IDLE' ? '-' : '1 ALGO'}
                </div>
              </div>

              {/* Timer */}
              <div className="pt-4 border-t border-white/10">
                <div className="text-white/60 text-sm font-['Rajdhani'] mb-1 tracking-wide">Time Remaining</div>
                <div className={`font-['Exo_2'] font-black text-4xl tracking-tight ${timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                  00:{timeLeft.toString().padStart(2, '0')}
                </div>
              </div>

              {/* Status */}
              <div className="pt-4 border-t border-white/10">
                <div className="text-white/60 text-sm font-['Rajdhani'] mb-1 tracking-wide">Status</div>
                <div className={`font-['Exo_2'] font-bold text-2xl tracking-tight ${gameState === 'IDLE' ? 'text-white' :
                  gameResult === 'WIN' ? 'text-green-500' :
                    gameResult === 'LOSS' ? 'text-red-500' :
                      'text-[var(--electric-volt)]'
                  }`}>
                  {gameState === 'FINISHED' ? (gameResult === 'WIN' ? 'VICTORY' : 'DEFEAT') : gameState}
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
      <StakeDialog
        open={showStakeDialog}
        onOpenChange={setShowStakeDialog}
        onStakeSuccess={handleStakeSuccess}
      />
    </>
  );
}
