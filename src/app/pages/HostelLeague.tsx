import { Users, Trophy, Clock, Flame } from "lucide-react";
import { ConnectWalletButton } from "../components/ConnectWalletButton";

export function HostelLeague() {
  const teams = [
    { 
      id: 1, 
      name: "Alpha Squad", 
      members: 12, 
      totalReps: 2450, 
      rank: 1,
      stake: "500 ALGO",
      badge: "🥇"
    },
    { 
      id: 2, 
      name: "Beta Warriors", 
      members: 10, 
      totalReps: 2100, 
      rank: 2,
      stake: "420 ALGO",
      badge: "🥈"
    },
    { 
      id: 3, 
      name: "Gamma Force", 
      members: 15, 
      totalReps: 1980, 
      rank: 3,
      stake: "380 ALGO",
      badge: "🥉"
    },
    { 
      id: 4, 
      name: "Delta Titans", 
      members: 8, 
      totalReps: 1750, 
      rank: 4,
      stake: "320 ALGO",
      badge: ""
    },
  ];

  const activeChallenges = [
    {
      title: "Weekend Warriors",
      description: "Complete 500 team reps by Sunday",
      timeLeft: "2d 14h",
      progress: 65,
      prize: "1000 ALGO"
    },
    {
      title: "Speed Demons",
      description: "20 reps in under 30 seconds - Team Best",
      timeLeft: "5d 8h",
      progress: 40,
      prize: "750 ALGO"
    },
    {
      title: "Endurance Elite",
      description: "100 reps combined in 10 minutes",
      timeLeft: "1d 2h",
      progress: 85,
      prize: "500 ALGO"
    },
  ];

  return (
    <>
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-['Exo_2'] font-black text-4xl tracking-wider mb-2">
            <span className="bg-gradient-to-r from-[var(--algorand-cyan)] to-[var(--electric-volt)] bg-clip-text text-transparent">
              HOSTEL LEAGUE
            </span>
          </h1>
          <p className="text-white/60 font-['Rajdhani'] tracking-wide">
            Compete in teams. Dominate together.
          </p>
        </div>

        <ConnectWalletButton />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Team Rankings - 2 columns */}
        <div className="xl:col-span-2 space-y-6">
          {/* Teams Grid */}
          <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 
                        shadow-2xl shadow-black/50 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />
            
            <div className="relative">
              <h2 className="font-['Exo_2'] font-bold text-xl tracking-wider text-[var(--algorand-cyan)] mb-6">
                TEAM RANKINGS
              </h2>

              <div className="space-y-4">
                {teams.map((team) => (
                  <div key={team.id} 
                       className="group relative p-6 rounded-xl bg-white/5 border border-white/10
                                hover:bg-white/10 hover:border-[var(--algorand-cyan)]/50 
                                transition-all duration-300 cursor-pointer">
                    <div className="flex items-center gap-6">
                      {/* Rank Badge */}
                      <div className={`w-16 h-16 rounded-xl flex items-center justify-center font-['Exo_2'] font-black text-2xl
                                     ${team.rank <= 3 
                                       ? 'bg-gradient-to-br from-[var(--electric-volt)] to-[var(--algorand-cyan)] text-[var(--deep-charcoal)]'
                                       : 'bg-white/10 text-white/60'}`}>
                        {team.badge || `#${team.rank}`}
                      </div>

                      {/* Team Info */}
                      <div className="flex-1">
                        <h3 className="font-['Exo_2'] font-bold text-xl text-white mb-1">
                          {team.name}
                        </h3>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1 text-white/60 font-['Rajdhani']">
                            <Users className="w-4 h-4" />
                            {team.members} members
                          </span>
                          <span className="flex items-center gap-1 text-white/60 font-['Rajdhani']">
                            <Trophy className="w-4 h-4" />
                            {team.totalReps} reps
                          </span>
                        </div>
                      </div>

                      {/* Stake */}
                      <div className="text-right">
                        <div className="text-white/60 text-xs font-['Rajdhani'] mb-1">Total Stake</div>
                        <div className="font-['Exo_2'] font-bold text-xl text-[var(--algorand-cyan)]">
                          {team.stake}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Join Team Button */}
              <button className="w-full mt-6 py-4 rounded-xl font-['Exo_2'] font-bold tracking-wider
                               bg-gradient-to-r from-[var(--algorand-cyan)]/20 to-[var(--electric-volt)]/20
                               border border-[var(--algorand-cyan)]/50 text-white
                               hover:from-[var(--algorand-cyan)]/30 hover:to-[var(--electric-volt)]/30
                               transition-all duration-300">
                JOIN OR CREATE TEAM
              </button>
            </div>
          </div>

          {/* My Team Stats */}
          <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 
                        shadow-2xl shadow-black/50 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />
            
            <div className="relative">
              <h2 className="font-['Exo_2'] font-bold text-xl tracking-wider text-[var(--electric-volt)] mb-6">
                MY TEAM: ALPHA SQUAD
              </h2>

              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-white/60 text-xs font-['Rajdhani'] mb-2">My Contribution</div>
                  <div className="font-['Exo_2'] font-black text-3xl text-[var(--electric-volt)]">
                    245
                  </div>
                  <div className="text-white/40 text-xs">reps this week</div>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-white/60 text-xs font-['Rajdhani'] mb-2">Team Rank</div>
                  <div className="font-['Exo_2'] font-black text-3xl text-[var(--algorand-cyan)]">
                    #1
                  </div>
                  <div className="text-white/40 text-xs">in league</div>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-white/60 text-xs font-['Rajdhani'] mb-2">Win Streak</div>
                  <div className="font-['Exo_2'] font-black text-3xl text-white flex items-center gap-1">
                    5 <Flame className="w-5 h-5 text-orange-500" />
                  </div>
                  <div className="text-white/40 text-xs">challenges</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Active Challenges - Right Sidebar */}
        <div className="space-y-6">
          <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 
                        shadow-2xl shadow-black/50 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />
            
            <div className="relative">
              <h2 className="font-['Exo_2'] font-bold text-lg tracking-wider text-[var(--algorand-cyan)] mb-6">
                ACTIVE CHALLENGES
              </h2>

              <div className="space-y-4">
                {activeChallenges.map((challenge, index) => (
                  <div key={index} className="p-4 rounded-xl bg-white/5 border border-white/10
                                            hover:bg-white/10 hover:border-[var(--algorand-cyan)]/30
                                            transition-all duration-300 cursor-pointer">
                    <h3 className="font-['Exo_2'] font-bold text-white mb-2">
                      {challenge.title}
                    </h3>
                    <p className="text-white/60 text-sm font-['Rajdhani'] mb-3">
                      {challenge.description}
                    </p>
                    
                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-white/60 mb-1">
                        <span>Progress</span>
                        <span>{challenge.progress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-[var(--electric-volt)] to-[var(--algorand-cyan)] rounded-full"
                          style={{ width: `${challenge.progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-white/60">
                        <Clock className="w-3 h-3" />
                        {challenge.timeLeft}
                      </div>
                      <div className="font-['Exo_2'] font-bold text-sm text-[var(--electric-volt)]">
                        {challenge.prize}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* League Info */}
          <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 
                        shadow-2xl shadow-black/50 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />
            
            <div className="relative">
              <h2 className="font-['Exo_2'] font-bold text-lg tracking-wider text-[var(--electric-volt)] mb-4">
                PRIZE POOL
              </h2>
              
              <div className="text-center p-4 rounded-xl bg-gradient-to-r from-[var(--algorand-cyan)]/10 to-[var(--electric-volt)]/10
                            border border-[var(--algorand-cyan)]/30 mb-4">
                <div className="font-['Exo_2'] font-black text-4xl bg-gradient-to-r from-[var(--algorand-cyan)] to-[var(--electric-volt)] bg-clip-text text-transparent">
                  5,000 ALGO
                </div>
                <div className="text-white/60 text-sm font-['Rajdhani'] mt-1">
                  This Week's Pool
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/60 font-['Rajdhani']">1st Place</span>
                  <span className="text-white font-['Exo_2'] font-bold">2,500 ALGO</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60 font-['Rajdhani']">2nd Place</span>
                  <span className="text-white font-['Exo_2'] font-bold">1,500 ALGO</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60 font-['Rajdhani']">3rd Place</span>
                  <span className="text-white font-['Exo_2'] font-bold">1,000 ALGO</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
