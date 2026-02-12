// @ts-nocheck
import { useState, useEffect, useRef } from "react";
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

  // Partner mode state
  const [partnerName, setPartnerName] = useState("");
  const [partnerReps, setPartnerReps] = useState(0);
  const partnerIntervalRef = useRef<any>(null);

  const combinedReps = repCount + partnerReps;

  const resetGame = () => {
    setGameState('IDLE');
    setRepCount(0);
    setTimeLeft(15);
    setGameResult(null);
    setCalories(0);
    setBurnEarned(0);
    setPartnerReps(0);
    if (partnerIntervalRef.current) {
      clearInterval(partnerIntervalRef.current);
      partnerIntervalRef.current = null;
    }
  };

  const handleStakeSuccess = (data: { partnerName?: string; repTarget: number }) => {
    setGameState('PLAYING');
    setRepCount(0);
    setCalories(0);
    setBurnEarned(0);
    setTimeLeft(15);
    setGameResult(null);
    setPartnerReps(0);
    setRepTarget(data.repTarget);
    if (data.partnerName) {
      setPartnerName(data.partnerName);
    }
    toast.success(data.partnerName
      ? `Co-Op Started with ${data.partnerName}! 15 seconds!`
      : "Game Started! 15 Seconds on the clock!");
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

  // Partner simulation — reps increment at a randomized pace
  useEffect(() => {
    if (gameState === 'PLAYING' && participationMode === 'PARTNER' && partnerName) {
      partnerIntervalRef.current = setInterval(() => {
        setPartnerReps((prev) => prev + 1);
      }, 1500 + Math.random() * 1500); // 1.5–3s per rep
    }
    return () => {
      if (partnerIntervalRef.current) {
        clearInterval(partnerIntervalRef.current);
        partnerIntervalRef.current = null;
      }
    };
  }, [gameState, participationMode, partnerName]);

  const handleGameOver = async (result: "WIN" | "LOSS") => {
    setGameState('FINISHED');
    setGameResult(result);
    if (partnerIntervalRef.current) {
      clearInterval(partnerIntervalRef.current);
      partnerIntervalRef.current = null;
    }

    if (result === "LOSS") {
      toast.error(participationMode === 'PARTNER'
        ? "Time's up! Co-Op stake lost."
        : "Time's up! Stake lost to House.");
    } else {
      toast.success(participationMode === 'PARTNER'
        ? "Co-Op Target Crushed! Both players win!"
        : "Target Reached! Challenge Complete!");
    }

    const finalCalories = repCount * 0.5;
    if (finalCalories > 0) {
      if (result === 'WIN') {
        try {
          fetch('http://localhost:8000/api/gamification/badges/award', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              walletAddress: user?.walletAddress || "DEMO_USER",
              badgeId: participationMode === 'PARTNER' ? 'COOP_CHAMPION' : 'PUSHUP_MASTER'
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

    // Win condition: solo = your reps, partner = combined reps
    const effectiveReps = participationMode === 'PARTNER' ? count + partnerReps : count;
    if (effectiveReps >= repTarget) {
      handleGameOver('WIN');
    }
  };

  // Also check partner reps crossing threshold
  useEffect(() => {
    if (gameState === 'PLAYING' && participationMode === 'PARTNER') {
      if (combinedReps >= repTarget) {
        handleGameOver('WIN');
      }
    }
  }, [partnerReps]);

  const isPartnerMode = participationMode === 'PARTNER';
  const progressPercent = isPartnerMode
    ? Math.min((combinedReps / repTarget) * 100, 100)
    : Math.min((repCount / repTarget) * 100, 100);

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
            {isPartnerMode ? 'Team up. Combine reps. Win together.' : 'Prove your reps. Win your stake.'}
          </p>
        </div>

        <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 backdrop-blur-md">
          <button
            onClick={() => { if (gameState === 'IDLE') setParticipationMode('SOLO'); }}
            className={`px-6 py-2 rounded-lg font-['Rajdhani'] font-bold tracking-wider transition-all
                      ${participationMode === 'SOLO' ? 'bg-[var(--electric-volt)] text-black' : 'text-white/60 hover:text-white'}
                      ${gameState !== 'IDLE' ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            SOLO
          </button>
          <button
            onClick={() => { if (gameState === 'IDLE') setParticipationMode('PARTNER'); }}
            className={`px-6 py-2 rounded-lg font-['Rajdhani'] font-bold tracking-wider transition-all
                      ${participationMode === 'PARTNER' ? 'bg-[var(--algorand-cyan)] text-black' : 'text-white/60 hover:text-white'}
                      ${gameState !== 'IDLE' ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                repTarget={isPartnerMode ? repTarget : repTarget}
                stakeAmount={gameState === 'IDLE' ? '-' : (isPartnerMode ? 'CO-OP' : '1 ALGO')}
              />
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${gameState === 'PLAYING' ? 'bg-[var(--electric-volt)] animate-pulse' : 'bg-white/20'} shadow-lg`} />
                <span className="font-['Rajdhani'] font-semibold text-sm tracking-wider text-white/80">
                  {gameState === 'PLAYING' ? (isPartnerMode ? 'CO-OP LIVE' : 'LIVE TRACKING') : 'PREVIEW / WARMUP'}
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
                  {isPartnerMode ? 'STAKE WITH PARTNER' : 'STAKE SOLO (1 ALGO)'}
                </button>
              )}

              {gameState === 'PLAYING' && (
                <div className="font-['Exo_2'] font-bold text-[var(--electric-volt)]">
                  {isPartnerMode ? 'CO-OP IN PROGRESS' : 'GAME IN PROGRESS'}
                </div>
              )}

              {/* FINISHED OVERLAY */}
              {gameState === 'FINISHED' && (
                <div className="absolute inset-0 flex items-center justify-center z-10 p-8 bg-black/60 backdrop-blur-md rounded-2xl border border-white/10">
                  <div className="text-center w-full max-w-md">
                    <h2 className={`text-5xl font-black mb-2 ${gameResult === "WIN" ? "text-green-400" : "text-red-500"}`}>
                      {isPartnerMode
                        ? (gameResult === "WIN" ? "CO-OP VICTORY" : "CO-OP DEFEAT")
                        : (gameResult === "WIN" ? "VICTORY" : "DEFEAT")}
                    </h2>
                    <p className="text-xl text-white/80 mb-6 font-['Rajdhani']">
                      {gameResult === "WIN"
                        ? (isPartnerMode ? "Target crushed together!" : "Target Crushed!")
                        : "Time's Up!"}
                    </p>

                    {/* Results grid */}
                    {isPartnerMode ? (
                      /* CO-OP RESULTS */
                      <div className="space-y-4 mb-6">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 bg-white/5 rounded-xl border border-[var(--electric-volt)]/30">
                            <div className="text-xs text-[var(--electric-volt)] uppercase tracking-widest mb-1">Your Reps</div>
                            <div className="text-3xl font-black text-white">{repCount}</div>
                          </div>
                          <div className="p-3 bg-white/5 rounded-xl border border-[var(--algorand-cyan)]/30">
                            <div className="text-xs text-[var(--algorand-cyan)] uppercase tracking-widest mb-1">{partnerName}</div>
                            <div className="text-3xl font-black text-white">{partnerReps}</div>
                          </div>
                        </div>

                        <div className="p-3 bg-gradient-to-r from-[var(--algorand-cyan)]/10 to-[var(--electric-volt)]/10 rounded-xl border border-white/10">
                          <div className="text-xs text-white/60 uppercase tracking-widest mb-1">Combined</div>
                          <div className="text-3xl font-black bg-gradient-to-r from-[var(--algorand-cyan)] to-[var(--electric-volt)] bg-clip-text text-transparent">
                            {combinedReps} / {repTarget}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                            <div className="text-xs text-white/60">Calories</div>
                            <div className="text-xl font-bold text-[var(--electric-volt)]">{calories.toFixed(1)}</div>
                          </div>
                          {burnEarned > 0 && (
                            <div className="p-3 bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/50 rounded-xl">
                              <div className="text-xs text-orange-300 uppercase">Rewards</div>
                              <div className="text-xl font-black text-white">+{burnEarned} $BURN</div>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      /* SOLO RESULTS */
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
                    )}

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

        {/* RIGHT PANEL — Stats */}
        <div className="space-y-6">
          {/* Partner Info Card (only in partner mode during game) */}
          {isPartnerMode && gameState === 'PLAYING' && partnerName && (
            <div className="backdrop-blur-xl bg-gradient-to-br from-[var(--algorand-cyan)]/10 to-indigo-600/10 border border-[var(--algorand-cyan)]/30 rounded-2xl p-5 shadow-2xl shadow-black/50 animate-in slide-in-from-top-4 duration-500">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--algorand-cyan)] to-indigo-600 flex items-center justify-center text-black font-black text-sm">
                  {partnerName.charAt(0)}
                </div>
                <div>
                  <div className="font-['Exo_2'] font-bold text-white text-sm">{partnerName}</div>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-green-400 text-xs font-['Rajdhani']">ACTIVE</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-white/50 text-xs font-['Rajdhani'] uppercase tracking-widest">Partner Reps</div>
                  <div className="font-['Exo_2'] font-black text-3xl text-[var(--algorand-cyan)]">{partnerReps}</div>
                </div>
                <div className="text-right">
                  <div className="text-white/50 text-xs font-['Rajdhani'] uppercase tracking-widest">Pace</div>
                  <div className="font-['Rajdhani'] font-semibold text-white/80">
                    {timeLeft < 15 ? ((partnerReps / (15 - timeLeft)) * 60).toFixed(0) : '—'} /min
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Session Stats */}
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl shadow-black/50">
            <h3 className="font-['Exo_2'] font-bold tracking-wider text-[var(--algorand-cyan)] mb-4">
              SESSION STATS
            </h3>
            <div className="space-y-4">
              <div>
                <div className="text-white/60 text-sm font-['Rajdhani'] mb-1">
                  {isPartnerMode ? 'Your Reps' : 'Rep Count'}
                </div>
                <div className="font-['Exo_2'] font-black text-5xl text-white">
                  {repCount}<span className="text-white/40 text-3xl">/{isPartnerMode ? '—' : repTarget}</span>
                </div>
              </div>

              {/* Combined progress (partner mode only) */}
              {isPartnerMode && gameState === 'PLAYING' && (
                <div className="animate-in fade-in duration-500">
                  <div className="flex justify-between text-sm font-['Rajdhani'] mb-2">
                    <span className="text-white/60">Combined Progress</span>
                    <span className="font-bold text-white">{combinedReps} / {repTarget}</span>
                  </div>
                  <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500 ease-out"
                      style={{
                        width: `${progressPercent}%`,
                        background: `linear-gradient(90deg, var(--algorand-cyan), var(--electric-volt))`
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs font-['Rajdhani'] mt-1 text-white/40">
                    <span>You: {repCount}</span>
                    <span>{partnerName}: {partnerReps}</span>
                  </div>
                </div>
              )}

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
