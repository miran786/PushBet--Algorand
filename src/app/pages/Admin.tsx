import { useState } from "react";
import { 
  PlayCircle, 
  PauseCircle, 
  RotateCcw, 
  Plus, 
  Settings, 
  Shield,
  Users,
  Trophy,
  DollarSign,
  Activity
} from "lucide-react";
import { ConnectWalletButton } from "../components/ConnectWalletButton";

export function Admin() {
  const [activeGames, setActiveGames] = useState([
    { id: 1, name: "Arena Challenge #2847", status: "active", players: 24, stake: "1,200 ALGO" },
    { id: 2, name: "Weekend Warriors", status: "active", players: 18, stake: "900 ALGO" },
    { id: 3, name: "Speed Demons Challenge", status: "paused", players: 12, stake: "600 ALGO" },
  ]);

  const stats = [
    { label: "Active Games", value: "12", icon: Activity, color: "text-[var(--electric-volt)]" },
    { label: "Total Players", value: "247", icon: Users, color: "text-[var(--algorand-cyan)]" },
    { label: "Prize Pool", value: "15,400", icon: DollarSign, color: "text-white" },
    { label: "Completed", value: "89", icon: Trophy, color: "text-yellow-400" },
  ];

  return (
    <>
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-[var(--algorand-cyan)]" />
            <h1 className="font-['Exo_2'] font-black text-4xl tracking-wider">
              <span className="bg-gradient-to-r from-[var(--algorand-cyan)] to-[var(--electric-volt)] bg-clip-text text-transparent">
                ADMIN PANEL
              </span>
            </h1>
          </div>
          <p className="text-white/60 font-['Rajdhani'] tracking-wide">
            Game management and control center
          </p>
        </div>

        <ConnectWalletButton />
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => (
          <div key={index} 
               className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-6 
                        shadow-2xl shadow-black/50 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />
            
            <div className="relative flex items-center justify-between">
              <div>
                <div className="text-white/60 text-xs font-['Rajdhani'] mb-2 tracking-wide uppercase">
                  {stat.label}
                </div>
                <div className={`font-['Exo_2'] font-black text-3xl ${stat.color}`}>
                  {stat.value}
                </div>
              </div>
              <stat.icon className={`w-10 h-10 ${stat.color} opacity-30`} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Game Management - 2 columns */}
        <div className="xl:col-span-2 space-y-6">
          {/* Quick Actions */}
          <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 
                        shadow-2xl shadow-black/50 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />
            
            <div className="relative">
              <h2 className="font-['Exo_2'] font-bold text-xl tracking-wider text-[var(--algorand-cyan)] mb-6">
                QUICK ACTIONS
              </h2>

              <div className="grid grid-cols-3 gap-4">
                <button 
                  onClick={() => {
                    // Create game logic
                    alert("Create Game functionality");
                  }}
                  className="group relative p-8 rounded-xl bg-gradient-to-br from-[var(--algorand-cyan)]/10 to-[var(--electric-volt)]/10
                           border-2 border-[var(--algorand-cyan)]/30 hover:border-[var(--algorand-cyan)]/60
                           transition-all duration-300 hover:scale-105 cursor-pointer
                           shadow-lg hover:shadow-[var(--neon-cyan-glow)]/50">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />
                  
                  <div className="relative text-center">
                    <Plus className="w-12 h-12 mx-auto mb-4 text-[var(--algorand-cyan)]" strokeWidth={2.5} />
                    <h3 className="font-['Exo_2'] font-bold text-lg text-white mb-2">
                      CREATE GAME
                    </h3>
                    <p className="text-white/60 text-sm font-['Rajdhani']">
                      Start a new challenge
                    </p>
                  </div>
                </button>

                <button 
                  onClick={() => {
                    // Activate all logic
                    alert("Activate All Games functionality");
                  }}
                  className="group relative p-8 rounded-xl bg-gradient-to-br from-[var(--electric-volt)]/10 to-[var(--algorand-cyan)]/10
                           border-2 border-[var(--electric-volt)]/30 hover:border-[var(--electric-volt)]/60
                           transition-all duration-300 hover:scale-105 cursor-pointer
                           shadow-lg hover:shadow-[var(--neon-green-glow)]/50">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />
                  
                  <div className="relative text-center">
                    <PlayCircle className="w-12 h-12 mx-auto mb-4 text-[var(--electric-volt)]" strokeWidth={2.5} />
                    <h3 className="font-['Exo_2'] font-bold text-lg text-white mb-2">
                      ACTIVATE ALL
                    </h3>
                    <p className="text-white/60 text-sm font-['Rajdhani']">
                      Resume all paused
                    </p>
                  </div>
                </button>

                <button 
                  onClick={() => {
                    if (confirm("Are you sure you want to reset all games? This action cannot be undone.")) {
                      alert("Reset All Games functionality");
                    }
                  }}
                  className="group relative p-8 rounded-xl bg-gradient-to-br from-red-500/10 to-orange-500/10
                           border-2 border-red-500/30 hover:border-red-500/60
                           transition-all duration-300 hover:scale-105 cursor-pointer
                           shadow-lg hover:shadow-red-500/50">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />
                  
                  <div className="relative text-center">
                    <RotateCcw className="w-12 h-12 mx-auto mb-4 text-red-400" strokeWidth={2.5} />
                    <h3 className="font-['Exo_2'] font-bold text-lg text-white mb-2">
                      RESET ALL
                    </h3>
                    <p className="text-white/60 text-sm font-['Rajdhani']">
                      Clear all games
                    </p>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Active Games Management */}
          <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 
                        shadow-2xl shadow-black/50 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />
            
            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-['Exo_2'] font-bold text-xl tracking-wider text-[var(--electric-volt)]">
                  ACTIVE GAMES
                </h2>
                <button className="px-4 py-2 rounded-lg bg-white/5 border border-white/10
                                 hover:bg-white/10 hover:border-[var(--algorand-cyan)]/30
                                 font-['Rajdhani'] font-semibold text-sm text-white/80
                                 transition-all duration-200 flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Filter
                </button>
              </div>

              <div className="space-y-4">
                {activeGames.map((game) => (
                  <div key={game.id} 
                       className="p-5 rounded-xl bg-white/5 border border-white/10
                                hover:bg-white/10 transition-all duration-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-['Exo_2'] font-bold text-lg text-white mb-1">
                          {game.name}
                        </h3>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1 text-white/60 font-['Rajdhani']">
                            <Users className="w-4 h-4" />
                            {game.players} players
                          </span>
                          <span className="text-[var(--algorand-cyan)] font-['Rajdhani']">
                            {game.stake}
                          </span>
                          <span className={`px-2 py-1 rounded-lg text-xs font-['Rajdhani'] font-semibold
                                         ${game.status === 'active' 
                                           ? 'bg-[var(--electric-volt)]/20 text-[var(--electric-volt)] border border-[var(--electric-volt)]/50' 
                                           : 'bg-orange-500/20 text-orange-400 border border-orange-500/50'}`}>
                            {game.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {game.status === 'active' ? (
                        <button 
                          onClick={() => {
                            const updated = activeGames.map(g => 
                              g.id === game.id ? { ...g, status: 'paused' } : g
                            );
                            setActiveGames(updated);
                          }}
                          className="flex-1 py-2 px-4 rounded-lg bg-white/5 border border-white/10
                                   hover:bg-orange-500/20 hover:border-orange-500/50
                                   font-['Rajdhani'] font-semibold text-sm text-white
                                   transition-all duration-200 flex items-center justify-center gap-2">
                          <PauseCircle className="w-4 h-4" />
                          Pause Game
                        </button>
                      ) : (
                        <button 
                          onClick={() => {
                            const updated = activeGames.map(g => 
                              g.id === game.id ? { ...g, status: 'active' } : g
                            );
                            setActiveGames(updated);
                          }}
                          className="flex-1 py-2 px-4 rounded-lg bg-white/5 border border-white/10
                                   hover:bg-[var(--electric-volt)]/20 hover:border-[var(--electric-volt)]/50
                                   font-['Rajdhani'] font-semibold text-sm text-white
                                   transition-all duration-200 flex items-center justify-center gap-2">
                          <PlayCircle className="w-4 h-4" />
                          Activate Game
                        </button>
                      )}
                      
                      <button 
                        onClick={() => {
                          if (confirm(`Reset ${game.name}?`)) {
                            alert(`Resetting game: ${game.name}`);
                          }
                        }}
                        className="flex-1 py-2 px-4 rounded-lg bg-white/5 border border-white/10
                                 hover:bg-red-500/20 hover:border-red-500/50
                                 font-['Rajdhani'] font-semibold text-sm text-white
                                 transition-all duration-200 flex items-center justify-center gap-2">
                        <RotateCcw className="w-4 h-4" />
                        Reset Game
                      </button>

                      <button className="py-2 px-4 rounded-lg bg-white/5 border border-white/10
                                       hover:bg-white/10 hover:border-[var(--algorand-cyan)]/30
                                       font-['Rajdhani'] font-semibold text-sm text-white
                                       transition-all duration-200 flex items-center justify-center gap-2">
                        <Settings className="w-4 h-4" />
                        Settings
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* System Controls Sidebar */}
        <div className="space-y-6">
          {/* System Status */}
          <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 
                        shadow-2xl shadow-black/50 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />
            
            <div className="relative">
              <h3 className="font-['Exo_2'] font-bold tracking-wider text-[var(--algorand-cyan)] mb-4">
                SYSTEM STATUS
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-white/60 text-sm font-['Rajdhani']">Platform Status</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[var(--electric-volt)] animate-pulse" />
                    <span className="text-[var(--electric-volt)] text-sm font-['Rajdhani'] font-semibold">Online</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/60 text-sm font-['Rajdhani']">Network</span>
                  <span className="text-white text-sm font-['Rajdhani'] font-semibold">Algorand</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/60 text-sm font-['Rajdhani']">Smart Contracts</span>
                  <span className="text-[var(--electric-volt)] text-sm font-['Rajdhani'] font-semibold">Active</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/60 text-sm font-['Rajdhani']">API Status</span>
                  <span className="text-[var(--electric-volt)] text-sm font-['Rajdhani'] font-semibold">Healthy</span>
                </div>
              </div>
            </div>
          </div>

          {/* Create Game Form */}
          <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 
                        shadow-2xl shadow-black/50 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />
            
            <div className="relative">
              <h3 className="font-['Exo_2'] font-bold tracking-wider text-[var(--electric-volt)] mb-4">
                CREATE NEW GAME
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="text-white/60 text-xs font-['Rajdhani'] mb-2 block">Game Name</label>
                  <input 
                    type="text"
                    placeholder="Enter game name"
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10
                             focus:border-[var(--algorand-cyan)]/50 outline-none
                             font-['Rajdhani'] text-sm text-white"
                  />
                </div>

                <div>
                  <label className="text-white/60 text-xs font-['Rajdhani'] mb-2 block">Min Stake (ALGO)</label>
                  <input 
                    type="number"
                    placeholder="50"
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10
                             focus:border-[var(--algorand-cyan)]/50 outline-none
                             font-['Rajdhani'] text-sm text-white"
                  />
                </div>

                <div>
                  <label className="text-white/60 text-xs font-['Rajdhani'] mb-2 block">Rep Target</label>
                  <input 
                    type="number"
                    placeholder="20"
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10
                             focus:border-[var(--algorand-cyan)]/50 outline-none
                             font-['Rajdhani'] text-sm text-white"
                  />
                </div>

                <div>
                  <label className="text-white/60 text-xs font-['Rajdhani'] mb-2 block">Duration (minutes)</label>
                  <input 
                    type="number"
                    placeholder="5"
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10
                             focus:border-[var(--algorand-cyan)]/50 outline-none
                             font-['Rajdhani'] text-sm text-white"
                  />
                </div>

                <button 
                  onClick={() => alert("Game created successfully!")}
                  className="w-full py-3 rounded-lg font-['Exo_2'] font-bold tracking-wider
                           bg-gradient-to-r from-[var(--algorand-cyan)] to-[var(--electric-volt)]
                           text-[var(--deep-charcoal)] shadow-lg shadow-[var(--neon-cyan-glow)]/50
                           hover:shadow-xl hover:shadow-[var(--neon-cyan-glow)] transition-all duration-300">
                  CREATE GAME
                </button>
              </div>
            </div>
          </div>

          {/* Emergency Controls */}
          <div className="relative backdrop-blur-xl bg-red-500/10 border border-red-500/30 rounded-2xl p-6 
                        shadow-2xl shadow-black/50 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />
            
            <div className="relative">
              <h3 className="font-['Exo_2'] font-bold tracking-wider text-red-400 mb-4">
                ⚠️ EMERGENCY
              </h3>

              <button 
                onClick={() => {
                  if (confirm("Emergency shutdown will pause ALL games immediately. Continue?")) {
                    alert("Emergency shutdown activated");
                  }
                }}
                className="w-full py-3 rounded-lg font-['Exo_2'] font-bold tracking-wider
                         bg-red-500/20 border-2 border-red-500/50 text-red-400
                         hover:bg-red-500/30 hover:border-red-500/70
                         transition-all duration-300">
                EMERGENCY SHUTDOWN
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
