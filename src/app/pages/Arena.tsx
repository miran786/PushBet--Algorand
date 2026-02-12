// @ts-nocheck
import { useState, useEffect } from "react";
import { VideoFeed } from "../components/VideoFeed";
import { StakeDialog } from "../components/StakeDialog";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

export function Arena() {
  const { user } = useAuth();
  const [showStakeDialog, setShowStakeDialog] = useState(false);
  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'FINISHED'>('IDLE');
  const [repCount, setRepCount] = useState(0);
  const [repTarget, setRepTarget] = useState(20);
  const [participationMode, setParticipationMode] = useState<'SOLO' | 'PARTNER'>('SOLO');

  const [timeLeft, setTimeLeft] = useState(15);
  const [gameResult, setGameResult] = useState<'WIN' | 'LOSS' | null>(null);
  const [calories, setCalories] = useState(0);
  const [burnEarned, setBurnEarned] = useState(0);

  const resetGame = () => {
    setGameState('IDLE');
    setRepCount(0);
    setTimeLeft(15);
    setGameResult(null);
    setCalories(0);
    setBurnEarned(0);
  };

  const handleStakeSuccess = () => {
    setGameState('PLAYING');
    setRepCount(0);
    setCalories(0);
    setBurnEarned(0);
    setTimeLeft(15);
    setGameResult(null);
    toast.success("Game Started! 15 Seconds on the clock!");
  };

  // Timer Logic
  useEffect(() => {
    let timer: any;
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

    const finalCalories = repCount * 0.5;
    if (finalCalories > 0) {
      // Award Badge if WON
      if (result === 'WIN') {
        try {
          fetch('http://localhost:8000/api/gamification/badges/award', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              walletAddress: user?.walletAddress || "DEMO_USER",
              badgeId: 'PUSHUP_MASTER'
            })
          });
        } catch (e) { console.error("Badge award failed", e); }
      }

      try {
        fetch('http://localhost:8000/api/gamification/burn/mint', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            walletAddress: user?.walletAddress || "DEMO_USER",
            calories: finalCalories * 200
          })
        }).then(res => res.json()).then(data => {
          if (data.minted > 0) setBurnEarned(data.minted);
        });
      } catch (e) {
        console.error("Mint failed", e);
      }
    }
  };

  const handleRepCount = (count: number) => {
    if (gameState !== 'PLAYING') return;
    setRepCount(count);
    setCalories(count * 0.5);
    if (count >= repTarget) {
      handleGameOver('WIN');
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-['Exo_2'] font-black text-4xl tracking-wider mb-2">
            <span className="bg-gradient-to-r from-[var(--algorand-cyan)] to-[var(--electric-volt)] bg-clip-text text-transparent">
              FITNESS ARENA
            </span>
          </h1>
          <p className="text-white/60 font-['Rajdhani'] tracking-wide">
            Prove your reps. Win your stake.
          </p>
        </div>

        <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 backdrop-blur-md">
          <button
            onClick={() => setParticipationMode('SOLO')}
            className={`px-6 py-2 rounded-lg font-['Rajdhani'] font-bold tracking-wider transition-all
                      ${participationMode === 'SOLO' ? 'bg-[var(--electric-volt)] text-black' : 'text-white/60 hover:text-white'}`}
          >
            SOLO
          </button>
          <button
            onClick={() => setParticipationMode('PARTNER')}
            className={`px-6 py-2 rounded-lg font-['Rajdhani'] font-bold tracking-wider transition-all
                      ${participationMode === 'PARTNER' ? 'bg-[var(--algorand-cyan)] text-black' : 'text-white/60 hover:text-white'}`}
          >
            PARTNER
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl shadow-black/50 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />

            <div className="relative aspect-video">
              <VideoFeed
                isActive={true}
                onRepCount={handleRepCount}
                repCount={repCount}
                repTarget={repTarget}
                stakeAmount={gameState === 'IDLE' ? '-' : (participationMode === 'SOLO' ? '1 ALGO' : 'PARTNER')}
              />
            </div>

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
                  {participationMode === 'SOLO' ? 'STAKE SOLO (1 ALGO)' : 'STAKE WITH PARTNER'}
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
                    <h2 className={`text-6xl font-black mb-4 ${gameResult === "WIN" ? "text-green-400" : "text-red-500"}`}>
                      {gameResult === "WIN" ? "VICTORY" : "DEFEAT"}
                    </h2>
                    <p className="text-2xl text-white mb-6 font-['Rajdhani']">
                      {gameResult === "WIN" ? "Target Crushed!" : "Time's Up!"}
                    </p>

                    <div className="grid grid-cols-2 gap-4 mb-8 max-w-sm mx-auto">
                      <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                        <div className="text-sm text-white/60">Reps</div>
                        <div className="text-2xl font-bold text-white">{repCount}</div>
                      </div>
                      <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                        <div className="text-sm text-white/60">Calories</div>
                        <div className="text-2xl font-bold text-[var(--electric-volt)]">{calories.toFixed(1)}</div>
                      </div>
                      {burnEarned > 0 && (
                        <div className="col-span-2 p-4 bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/50 rounded-xl">
                          <div className="text-sm text-orange-300 uppercase tracking-widest">Rewards</div>
                          <div className="text-3xl font-black text-white flex items-center justify-center gap-2">
                            +{burnEarned} $BURN
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

        <div className="space-y-6">
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl shadow-black/50">
            <h3 className="font-['Exo_2'] font-bold tracking-wider text-[var(--algorand-cyan)] mb-4">
              SESSION STATS
            </h3>
            <div className="space-y-4">
              <div>
                <div className="text-white/60 text-sm font-['Rajdhani'] mb-1">Rep Count</div>
                <div className="font-['Exo_2'] font-black text-5xl text-white">
                  {repCount}<span className="text-white/40 text-3xl">/{repTarget}</span>
                </div>
              </div>
              <div>
                <div className="text-white/60 text-sm font-['Rajdhani'] mb-1">Time Left</div>
                <div className={`font-['Exo_2'] font-black text-4xl ${timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                  00:{timeLeft.toString().padStart(2, '0')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <StakeDialog
        open={showStakeDialog}
        onOpenChange={setShowStakeDialog}
        onStakeSuccess={handleStakeSuccess}
        mode={participationMode}
      />
    </>
  );
}
