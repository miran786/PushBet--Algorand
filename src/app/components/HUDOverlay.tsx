interface HUDOverlayProps {
  repCount?: number;
  repTarget?: number;
  stakeAmount?: number | string;
}

export function HUDOverlay({ repCount = 0, repTarget = 20, stakeAmount = "1 ALGO" }: HUDOverlayProps) {
  return (
    <>
      {/* Top HUD Bar */}
      <div className="absolute top-6 left-6 right-6 flex justify-between items-start pointer-events-none">
        {/* Left HUD Info */}
        <div className="backdrop-blur-md bg-[var(--matte-black)]/80 border border-[var(--algorand-cyan)]/30 
                      rounded-lg px-4 py-2 shadow-lg shadow-[var(--neon-cyan-glow)]/30">
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <span className="font-['Rajdhani'] text-[var(--algorand-cyan)] text-xs tracking-wider">REP COUNT</span>
              <div className="font-['Exo_2'] font-black text-2xl tracking-tight">
                <span className="text-[var(--electric-volt)]">{repCount}</span>
                <span className="text-white/40">/{repTarget}</span>
              </div>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="flex flex-col">
              <span className="font-['Rajdhani'] text-[var(--algorand-cyan)] text-xs tracking-wider">STAKE</span>
              <div className="font-['Exo_2'] font-bold text-lg tracking-tight text-white">
                {stakeAmount}
              </div>
            </div>
          </div>
        </div>

        {/* Right HUD Status */}
        <div className="backdrop-blur-md bg-[var(--matte-black)]/80 border border-[var(--electric-volt)]/30 
                      rounded-lg px-4 py-2 shadow-lg shadow-[var(--neon-green-glow)]/30">
          <div className="flex items-center gap-2">
            <div className="relative w-2 h-2">
              <div className="absolute inset-0 rounded-full bg-[var(--electric-volt)] animate-ping" />
              <div className="relative rounded-full w-2 h-2 bg-[var(--electric-volt)]" />
            </div>
            <span className="font-['Rajdhani'] font-semibold text-sm tracking-wider text-white">
              AI TRACKING ACTIVE
            </span>
          </div>
        </div>
      </div>

      {/* Bottom HUD Bar */}
      <div className="absolute bottom-6 left-6 right-6 pointer-events-none">
        <div className="backdrop-blur-md bg-[var(--matte-black)]/80 border border-white/20 
                      rounded-lg px-6 py-3 shadow-lg shadow-black/50">
          <div className="flex items-center justify-between">
            {/* Form Analysis */}
            <div className="flex items-center gap-4">
              <div className="flex flex-col">
                <span className="font-['Rajdhani'] text-white/60 text-xs tracking-wider">FORM SCORE</span>
                <div className="font-['Exo_2'] font-bold text-xl text-[var(--electric-volt)]">
                  94%
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-['Rajdhani'] text-white/60 text-xs tracking-wider">DEPTH</span>
                <div className="font-['Exo_2'] font-bold text-xl text-[var(--algorand-cyan)]">
                  OPTIMAL
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-['Rajdhani'] text-white/60 text-xs tracking-wider">TEMPO</span>
                <div className="font-['Exo_2'] font-bold text-xl text-white">
                  2.1s
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="font-['Rajdhani'] font-semibold text-sm text-white/60">
                Challenge Progress
              </span>
              <div className="w-48 h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[var(--electric-volt)] via-[var(--algorand-cyan)] to-[var(--electric-volt)] 
                                rounded-full shadow-lg shadow-[var(--neon-cyan-glow)] animate-pulse transition-all duration-300"
                  style={{ width: `${Math.min((repCount / repTarget) * 100, 100)}%` }}
                />
              </div>
              <span className="font-['Exo_2'] font-bold text-sm text-white">
                {Math.round(Math.min((repCount / repTarget) * 100, 100))}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Corner Indicators */}
      <div className="absolute top-3 left-3 pointer-events-none">
        <div className="flex flex-col gap-1">
          <div className="w-12 h-0.5 bg-gradient-to-r from-[var(--algorand-cyan)] to-transparent" />
          <div className="w-0.5 h-12 bg-gradient-to-b from-[var(--algorand-cyan)] to-transparent" />
        </div>
      </div>
      <div className="absolute top-3 right-3 pointer-events-none">
        <div className="flex flex-col items-end gap-1">
          <div className="w-12 h-0.5 bg-gradient-to-l from-[var(--algorand-cyan)] to-transparent" />
          <div className="w-0.5 h-12 bg-gradient-to-b from-[var(--algorand-cyan)] to-transparent ml-auto" />
        </div>
      </div>
      <div className="absolute bottom-3 left-3 pointer-events-none">
        <div className="flex flex-col gap-1">
          <div className="w-0.5 h-12 bg-gradient-to-t from-[var(--electric-volt)] to-transparent" />
          <div className="w-12 h-0.5 bg-gradient-to-r from-[var(--electric-volt)] to-transparent" />
        </div>
      </div>
      <div className="absolute bottom-3 right-3 pointer-events-none">
        <div className="flex flex-col items-end gap-1">
          <div className="w-0.5 h-12 bg-gradient-to-t from-[var(--electric-volt)] to-transparent ml-auto" />
          <div className="w-12 h-0.5 bg-gradient-to-l from-[var(--electric-volt)] to-transparent" />
        </div>
      </div>

      {/* Center Crosshair */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <div className="relative w-6 h-6">
          <div className="absolute top-0 left-1/2 w-px h-2 -translate-x-1/2 bg-[var(--algorand-cyan)]/60" />
          <div className="absolute bottom-0 left-1/2 w-px h-2 -translate-x-1/2 bg-[var(--algorand-cyan)]/60" />
          <div className="absolute left-0 top-1/2 w-2 h-px -translate-y-1/2 bg-[var(--algorand-cyan)]/60" />
          <div className="absolute right-0 top-1/2 w-2 h-px -translate-y-1/2 bg-[var(--algorand-cyan)]/60" />
          <div className="absolute top-1/2 left-1/2 w-1 h-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--algorand-cyan)] animate-pulse" />
        </div>
      </div>
    </>
  );
}
