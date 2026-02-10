import { Trophy, Users, Wallet, Medal, Shield } from "lucide-react";
import { FaGavel, FaStore } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";

export function Sidebar() {
  const location = useLocation();

  const navItems = [
    { icon: Trophy, label: "Arena", path: "/" },
    { icon: Users, label: "Hostel League", path: "/hostel-league" },
    { icon: Wallet, label: "My Wallet", path: "/wallet" },
    { icon: Medal, label: "Leaderboard", path: "/leaderboard" },
    { icon: FaGavel, label: "Validator", path: "/validator" }, // Validator Node
    { icon: FaStore, label: "Market", path: "/marketplace" }, // Marketplace
    { icon: Shield, label: "Admin", path: "/admin" },
  ];

  return (
    <div className="fixed left-0 top-0 h-screen w-20 flex flex-col items-center py-8 gap-6 z-10">
      {/* Logo */}
      <Link to="/" className="mb-8">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--algorand-cyan)] to-[var(--electric-volt)] flex items-center justify-center shadow-lg shadow-[var(--neon-cyan-glow)]">
          <span className="font-['Exo_2'] font-black text-xl text-[var(--deep-charcoal)]">PB</span>
        </div>
      </Link>

      {/* Navigation Icons */}
      <nav className="flex flex-col gap-6">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          const isAdmin = item.path === "/admin";
          return (
            <Link
              key={index}
              to={item.path}
              className={`
                group relative w-14 h-14 rounded-xl flex items-center justify-center
                transition-all duration-300 backdrop-blur-xl
                ${isActive
                  ? isAdmin
                    ? "bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/50 shadow-lg shadow-red-500/30"
                    : "bg-gradient-to-br from-[var(--algorand-cyan)]/20 to-[var(--electric-volt)]/20 border border-[var(--algorand-cyan)]/50 shadow-lg shadow-[var(--neon-cyan-glow)]"
                  : isAdmin
                    ? "bg-white/5 border border-white/10 hover:bg-red-500/10 hover:border-red-500/30"
                    : "bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[var(--algorand-cyan)]/30"
                }
              `}
            >
              <Icon
                className={`w-6 h-6 transition-colors duration-300 ${isActive
                  ? isAdmin
                    ? "text-red-400"
                    : "text-[var(--algorand-cyan)]"
                  : isAdmin
                    ? "text-white/60 group-hover:text-red-400"
                    : "text-white/60 group-hover:text-[var(--algorand-cyan)]"
                  }`}
                strokeWidth={2.5}
              />

              {/* Tooltip */}
              <div className="absolute left-20 px-3 py-2 rounded-lg bg-[var(--matte-black)] border border-[var(--algorand-cyan)]/30 
                            backdrop-blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none
                            whitespace-nowrap shadow-lg shadow-[var(--neon-cyan-glow)]/30">
                <span className="font-['Rajdhani'] font-semibold text-sm tracking-wider text-[var(--algorand-cyan)]">
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}