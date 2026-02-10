import { Trophy, TrendingUp, Zap, Award, Filter } from "lucide-react";

export function Leaderboard() {
  const topPlayers = [
    {
      rank: 1,
      name: "CryptoAthlete",
      avatar: "🏆",
      totalReps: 2450,
      winRate: 92,
      earnings: "5,240 ALGO",
      streak: 12,
      level: 45
    },
    {
      rank: 2,
      name: "BlockchainBuff",
      avatar: "💪",
      totalReps: 2180,
      winRate: 88,
      earnings: "4,820 ALGO",
      streak: 8,
      level: 42
    },
    {
      rank: 3,
      name: "AlgoWarrior",
      avatar: "⚡",
      totalReps: 2050,
      winRate: 85,
      earnings: "4,210 ALGO",
      streak: 15,
      level: 40
    },
    {
      rank: 4,
      name: "FitnessFiend",
      avatar: "🔥",
      totalReps: 1920,
      winRate: 82,
      earnings: "3,890 ALGO",
      streak: 6,
      level: 38
    },
    {
      rank: 5,
      name: "RepMaster",
      avatar: "💎",
      totalReps: 1850,
      winRate: 79,
      earnings: "3,520 ALGO",
      streak: 4,
      level: 36
    },
    {
      rank: 6,
      name: "GymShark",
      avatar: "🦈",
      totalReps: 1720,
      winRate: 76,
      earnings: "3,180 ALGO",
      streak: 3,
      level: 34
    },
    {
      rank: 7,
      name: "FlexMachine",
      avatar: "🤖",
      totalReps: 1650,
      winRate: 74,
      earnings: "2,940 ALGO",
      streak: 5,
      level: 32
    },
    {
      rank: 8,
      name: "IronPusher",
      avatar: "🏋️",
      totalReps: 1580,
      winRate: 71,
      earnings: "2,650 ALGO",
      streak: 2,
      level: 30
    },
  ];

  const categories = [
    { name: "All Time", active: true },
    { name: "This Week", active: false },
    { name: "This Month", active: false },
  ];

  return (
    <>
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-['Exo_2'] font-black text-4xl tracking-wider mb-2">
            <span className="bg-gradient-to-r from-[var(--algorand-cyan)] to-[var(--electric-volt)] bg-clip-text text-transparent">
              LEADERBOARD
            </span>
          </h1>
          <p className="text-white/60 font-['Rajdhani'] tracking-wide">
            Top performers in the PushBet arena
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Leaderboard - 2 columns */}
        <div className="xl:col-span-2 space-y-6">
          {/* Filter Tabs */}
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.name}
                  className={`px-6 py-3 rounded-xl font-['Rajdhani'] font-semibold tracking-wider transition-all duration-300
                            ${cat.active
                      ? 'bg-gradient-to-r from-[var(--algorand-cyan)]/20 to-[var(--electric-volt)]/20 border border-[var(--algorand-cyan)]/50 text-white'
                      : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10'}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
            <button className="ml-auto p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10
                             transition-all duration-200 group">
              <Filter className="w-5 h-5 text-white/60 group-hover:text-[var(--algorand-cyan)]" />
            </button>
          </div>

          {/* Top 3 Podium */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {/* 2nd Place */}
            <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 
                          shadow-2xl shadow-black/50 overflow-hidden mt-8">
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />

              <div className="relative text-center">
                <div className="text-5xl mb-3">{topPlayers[1].avatar}</div>
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-gray-300 to-gray-500 
                              flex items-center justify-center font-['Exo_2'] font-black text-2xl text-[var(--deep-charcoal)]">
                  2
                </div>
                <h3 className="font-['Exo_2'] font-bold text-lg text-white mb-1">{topPlayers[1].name}</h3>
                <div className="text-[var(--algorand-cyan)] font-['Rajdhani'] font-semibold text-sm">
                  {topPlayers[1].totalReps} reps
                </div>
              </div>
            </div>

            {/* 1st Place */}
            <div className="relative backdrop-blur-xl bg-gradient-to-br from-[var(--algorand-cyan)]/10 to-[var(--electric-volt)]/10 
                          border-2 border-[var(--algorand-cyan)]/50 rounded-2xl p-6 
                          shadow-2xl shadow-[var(--neon-cyan-glow)]/50 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />

              <div className="relative text-center">
                <div className="text-6xl mb-3">{topPlayers[0].avatar}</div>
                <div className="w-14 h-14 mx-auto mb-3 rounded-xl bg-gradient-to-br from-[var(--electric-volt)] to-[var(--algorand-cyan)] 
                              flex items-center justify-center font-['Exo_2'] font-black text-3xl text-[var(--deep-charcoal)]
                              shadow-lg shadow-[var(--neon-cyan-glow)]">
                  1
                </div>
                <h3 className="font-['Exo_2'] font-bold text-xl text-white mb-1">{topPlayers[0].name}</h3>
                <div className="text-[var(--electric-volt)] font-['Rajdhani'] font-semibold">
                  {topPlayers[0].totalReps} reps
                </div>
              </div>
            </div>

            {/* 3rd Place */}
            <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 
                          shadow-2xl shadow-black/50 overflow-hidden mt-8">
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />

              <div className="relative text-center">
                <div className="text-5xl mb-3">{topPlayers[2].avatar}</div>
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-amber-600 to-amber-800 
                              flex items-center justify-center font-['Exo_2'] font-black text-2xl text-[var(--deep-charcoal)]">
                  3
                </div>
                <h3 className="font-['Exo_2'] font-bold text-lg text-white mb-1">{topPlayers[2].name}</h3>
                <div className="text-[var(--algorand-cyan)] font-['Rajdhani'] font-semibold text-sm">
                  {topPlayers[2].totalReps} reps
                </div>
              </div>
            </div>
          </div>

          {/* Full Rankings */}
          <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 
                        shadow-2xl shadow-black/50 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />

            <div className="relative">
              <h2 className="font-['Exo_2'] font-bold text-xl tracking-wider text-[var(--algorand-cyan)] mb-6">
                FULL RANKINGS
              </h2>

              <div className="space-y-3">
                {topPlayers.map((player) => (
                  <div key={player.rank}
                    className="group flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5
                                hover:bg-white/10 hover:border-[var(--algorand-cyan)]/30
                                transition-all duration-200 cursor-pointer">
                    {/* Rank */}
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-['Exo_2'] font-black text-xl
                                   ${player.rank <= 3
                        ? 'bg-gradient-to-br from-[var(--electric-volt)] to-[var(--algorand-cyan)] text-[var(--deep-charcoal)]'
                        : 'bg-white/10 text-white/60'}`}>
                      {player.rank}
                    </div>

                    {/* Avatar */}
                    <div className="text-3xl">{player.avatar}</div>

                    {/* Player Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-['Exo_2'] font-bold text-lg text-white">
                          {player.name}
                        </h3>
                        <div className="px-2 py-0.5 rounded bg-white/10 border border-white/20 text-xs font-['Rajdhani'] text-white/60">
                          Lv.{player.level}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-white/60 font-['Rajdhani']">
                          {player.totalReps} reps
                        </span>
                        <span className="text-white/60 font-['Rajdhani']">
                          {player.winRate}% win rate
                        </span>
                        <span className="flex items-center gap-1 text-orange-400 font-['Rajdhani']">
                          <Zap className="w-3 h-3" />
                          {player.streak} streak
                        </span>
                      </div>
                    </div>

                    {/* Earnings */}
                    <div className="text-right">
                      <div className="font-['Exo_2'] font-bold text-lg text-[var(--algorand-cyan)]">
                        {player.earnings}
                      </div>
                      <div className="text-white/40 text-xs">Total Earnings</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-6">
          {/* Your Ranking */}
          <div className="relative backdrop-blur-xl bg-gradient-to-br from-[var(--electric-volt)]/10 to-[var(--algorand-cyan)]/10 
                        border border-[var(--electric-volt)]/30 rounded-2xl p-6 
                        shadow-2xl shadow-black/50 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />

            <div className="relative">
              <h3 className="font-['Exo_2'] font-bold tracking-wider text-[var(--electric-volt)] mb-4">
                YOUR RANKING
              </h3>

              <div className="text-center mb-6">
                <div className="font-['Exo_2'] font-black text-6xl mb-2">
                  <span className="bg-gradient-to-r from-[var(--algorand-cyan)] to-[var(--electric-volt)] bg-clip-text text-transparent">
                    #24
                  </span>
                </div>
                <div className="text-white/60 font-['Rajdhani']">out of 1,247 players</div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-white/60 text-sm font-['Rajdhani']">Total Reps</span>
                  <span className="text-white font-['Exo_2'] font-bold">1,245</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/60 text-sm font-['Rajdhani']">Win Rate</span>
                  <span className="text-[var(--electric-volt)] font-['Exo_2'] font-bold">78%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/60 text-sm font-['Rajdhani']">Earnings</span>
                  <span className="text-[var(--algorand-cyan)] font-['Exo_2'] font-bold">1,240 ALGO</span>
                </div>
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 
                        shadow-2xl shadow-black/50 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />

            <div className="relative">
              <h3 className="font-['Exo_2'] font-bold tracking-wider text-[var(--algorand-cyan)] mb-4">
                ACHIEVEMENTS
              </h3>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: "🏆", name: "Champion", unlocked: true },
                  { icon: "💯", name: "Century", unlocked: true },
                  { icon: "🔥", name: "Hot Streak", unlocked: true },
                  { icon: "⚡", name: "Speed Demon", unlocked: false },
                ].map((achievement, index) => (
                  <div key={index}
                    className={`p-3 rounded-xl border transition-all duration-200
                                 ${achievement.unlocked
                        ? 'bg-gradient-to-br from-[var(--algorand-cyan)]/10 to-[var(--electric-volt)]/10 border-[var(--algorand-cyan)]/30'
                        : 'bg-white/5 border-white/10 opacity-40'}`}>
                    <div className="text-3xl mb-2">{achievement.icon}</div>
                    <div className="text-xs font-['Rajdhani'] text-white/80">{achievement.name}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 
                        shadow-2xl shadow-black/50 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />

            <div className="relative">
              <h3 className="font-['Exo_2'] font-bold tracking-wider text-white mb-4">
                RECENT ACTIVITY
              </h3>

              <div className="space-y-3">
                {[
                  { text: "Climbed 5 ranks", time: "2h ago", icon: TrendingUp, color: "text-[var(--electric-volt)]" },
                  { text: "Won Arena #2847", time: "3h ago", icon: Trophy, color: "text-[var(--algorand-cyan)]" },
                  { text: "Unlocked achievement", time: "1d ago", icon: Award, color: "text-yellow-400" },
                ].map((activity, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                    <activity.icon className={`w-4 h-4 ${activity.color}`} />
                    <div className="flex-1">
                      <div className="text-sm text-white font-['Rajdhani']">{activity.text}</div>
                      <div className="text-xs text-white/40">{activity.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
