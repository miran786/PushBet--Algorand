import { Outlet } from "react-router";
import { Sidebar } from "./Sidebar";

export function Layout() {
  return (
    <div className="dark min-h-screen bg-[var(--deep-charcoal)] font-['Rajdhani'] overflow-hidden">
      {/* Gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-[var(--deep-charcoal)] via-[var(--matte-black)] to-[var(--deep-charcoal)]" />
      
      {/* Cyber grid background */}
      <div className="fixed inset-0 cyber-grid opacity-30" />
      
      {/* Ambient glow effects */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-[var(--algorand-cyan)] opacity-10 blur-[120px] rounded-full animate-pulse" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-[var(--electric-volt)] opacity-10 blur-[120px] rounded-full animate-pulse" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--algorand-cyan)] opacity-5 blur-[150px] rounded-full" />

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="relative ml-20 p-8 min-h-screen">
        <Outlet />
      </div>

      {/* Custom animations */}
      <style>{`
        @keyframes scan {
          0% { top: 0%; }
          100% { top: 100%; }
        }
        
        @keyframes glow-pulse {
          0%, 100% { 
            box-shadow: 0 0 20px var(--neon-cyan-glow),
                        0 0 40px var(--neon-cyan-glow),
                        0 0 60px var(--neon-cyan-glow);
          }
          50% { 
            box-shadow: 0 0 30px var(--neon-cyan-glow),
                        0 0 60px var(--neon-cyan-glow),
                        0 0 90px var(--neon-cyan-glow);
          }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes grid-move {
          0% { background-position: 0 0; }
          100% { background-position: 50px 50px; }
        }
        
        /* Grid background pattern */
        .cyber-grid {
          background-image: 
            linear-gradient(rgba(0, 212, 255, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 212, 255, 0.05) 1px, transparent 1px);
          background-size: 50px 50px;
          animation: grid-move 20s linear infinite;
        }
        
        /* Glitch effect */
        @keyframes glitch {
          0% { transform: translate(0); }
          20% { transform: translate(-2px, 2px); }
          40% { transform: translate(-2px, -2px); }
          60% { transform: translate(2px, 2px); }
          80% { transform: translate(2px, -2px); }
          100% { transform: translate(0); }
        }
      `}</style>
    </div>
  );
}
