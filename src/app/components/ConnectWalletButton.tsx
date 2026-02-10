import { useState } from "react";
import { Wallet, LogOut, ChevronDown } from "lucide-react";
import { useWallet } from "@txnlab/use-wallet-react";

export function ConnectWalletButton() {
  const { wallets, activeWallet, activeAccount } = useWallet();
  const [showWalletList, setShowWalletList] = useState(false);

  const handleConnect = async (wallet: any) => {
    try {
      await wallet.connect();
      setShowWalletList(false);
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  const handleDisconnect = async () => {
    if (activeWallet) {
      await activeWallet.disconnect();
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  if (activeAccount) {
    return (
      <button
        onClick={handleDisconnect}
        className="group relative px-6 py-3 rounded-full font-['Exo_2'] font-bold tracking-widest
                   overflow-hidden transition-all duration-300 hover:scale-105 border border-[var(--algorand-cyan)]/30
                   bg-[var(--deep-charcoal)] hover:bg-[var(--algorand-cyan)]/10"
      >
        <span className="relative flex items-center gap-2 text-[var(--algorand-cyan)]">
          <Wallet className="w-5 h-5" strokeWidth={2.5} />
          {formatAddress(activeAccount.address)}
          <LogOut className="w-4 h-4 ml-2 opacity-50 group-hover:opacity-100 transition-opacity" />
        </span>
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowWalletList(!showWalletList)}
        className="group relative px-8 py-3.5 rounded-full font-['Exo_2'] font-bold tracking-widest
                   overflow-hidden transition-all duration-300 hover:scale-105"
      >
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--algorand-cyan)] to-[var(--electric-volt)]" />

        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--electric-volt)] to-[var(--algorand-cyan)] 
                      opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Glow effect */}
        <div className="absolute inset-0 rounded-full shadow-lg shadow-[var(--neon-cyan-glow)] 
                      group-hover:shadow-2xl group-hover:shadow-[var(--neon-cyan-glow)] transition-shadow duration-300" />

        {/* Border */}
        <div className="absolute inset-0 rounded-full border-2 border-transparent 
                      group-hover:border-white/20 transition-colors duration-300" />

        {/* Content */}
        <span className="relative flex items-center gap-2 text-[var(--deep-charcoal)]">
          <Wallet className="w-5 h-5" strokeWidth={2.5} />
          CONNECT WALLET
          <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showWalletList ? 'rotate-180' : ''}`} />
        </span>
      </button>

      {/* Wallet List Dropdown */}
      {showWalletList && (
        <div className="absolute top-full right-0 mt-2 w-64 rounded-xl overflow-hidden
                      bg-[var(--deep-charcoal)] border border-[var(--algorand-cyan)]/30
                      shadow-xl shadow-black/50 z-50 animate-in fade-in zoom-in-95 duration-200">
          <div className="p-3 space-y-2">
            {wallets?.map((wallet) => (
              <button
                key={wallet.id}
                onClick={() => handleConnect(wallet)}
                className="w-full flex items-center gap-3 p-3 rounded-lg
                         bg-white/5 hover:bg-white/10 transition-colors
                         border border-transparent hover:border-[var(--algorand-cyan)]/30
                         group/item"
              >
                <img
                  src={wallet.metadata.icon}
                  alt={wallet.metadata.name}
                  className="w-8 h-8 rounded-full bg-white/10 p-1"
                />
                <span className="font-['Rajdhani'] font-semibold text-white/80 group-hover/item:text-white">
                  {wallet.metadata.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
