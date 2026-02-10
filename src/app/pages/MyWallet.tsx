import { useState, useEffect } from "react";
import { ArrowUpRight, ArrowDownLeft, Wallet, Copy, ExternalLink, TrendingUp, TrendingDown } from "lucide-react";
import { ConnectWalletButton } from "../components/ConnectWalletButton";
import { useWallet } from "@txnlab/use-wallet-react";
import algosdk from "algosdk";
import { toast } from "sonner";

export function MyWallet() {
  const { activeAccount } = useWallet();
  const [balance, setBalance] = useState<string>("0.00");
  const [trustScore, setTrustScore] = useState<number>(50);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBalance = async () => {
      if (!activeAccount) return;

      try {
        setLoading(true);
        const algodClient = new algosdk.Algodv2('', 'https://testnet-api.algonode.cloud', 443);
        const accountInfo = await algodClient.accountInformation(activeAccount.address).do();
        // Ensure amount is a valid non-negative number
        const amount = Math.max(0, Number(accountInfo.amount) || 0);
        const algoBalance = algosdk.microalgosToAlgos(amount);
        setBalance(algoBalance.toFixed(2));

        // Fetch Trust Score
        const trustRes = await fetch(`http://localhost:8000/api/gamification/trust/score?walletAddress=${activeAccount.address}`);
        const trustData = await trustRes.json();
        setTrustScore(trustData.trustScore || 50);

      } catch (error) {
        console.error("Failed to fetch balance/trust:", error);
        toast.error("Failed to update wallet info");
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
  }, [activeAccount]);

  const transactions = [
    {
      id: 1,
      type: "win",
      amount: "+125.50",
      description: "Arena Challenge #2847",
      date: "2h ago",
      status: "completed"
    },
    // ... (Keep existing mock transactions or replace if needed, user asked for "balance and all part", assuming balance is key)
    {
      id: 2,
      type: "stake",
      amount: "-50.00",
      description: "Arena Entry Stake",
      date: "2h ago",
      status: "completed"
    },
    {
      id: 3,
      type: "win",
      amount: "+89.20",
      description: "Hostel League Reward",
      date: "5h ago",
      status: "completed"
    },
    {
      id: 4,
      type: "deposit",
      amount: "+500.00",
      description: "Wallet Deposit",
      date: "1d ago",
      status: "completed"
    },
  ];

  const stats = [
    { label: "Total Earnings", value: "1,245.80", change: "+12.5%", up: true },
    { label: "Trust Score (SBT)", value: trustScore.toString(), change: "+15 pts", up: true },
    { label: "Total Stakes", value: "850.00", change: "-8.1%", up: false },
  ];

  return (
    <>
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-['Exo_2'] font-black text-4xl tracking-wider mb-2">
            <span className="bg-gradient-to-r from-[var(--algorand-cyan)] to-[var(--electric-volt)] bg-clip-text text-transparent">
              MY WALLET
            </span>
          </h1>
          <p className="text-white/60 font-['Rajdhani'] tracking-wide">
            Manage your balance and transactions
          </p>
        </div>

        <ConnectWalletButton />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Wallet Section - 2 columns */}
        <div className="xl:col-span-2 space-y-6">
          {/* Balance Card */}
          <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 
                        shadow-2xl shadow-black/50 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--algorand-cyan)]/10 to-[var(--electric-volt)]/10 pointer-events-none" />

            <div className="relative">
              <div className="flex items-start justify-between mb-8">
                <div>
                  <div className="text-white/60 text-sm font-['Rajdhani'] mb-2 tracking-wide">Available Balance</div>
                  <div className="font-['Exo_2'] font-black text-6xl tracking-tight">
                    <span className="bg-gradient-to-r from-[var(--algorand-cyan)] to-[var(--electric-volt)] bg-clip-text text-transparent">
                      {activeAccount ? balance : '---'}
                    </span>
                    <span className="text-2xl text-white/60 ml-2">ALGO</span>
                  </div>
                  <div className="mt-2 text-[var(--electric-volt)] text-sm font-['Rajdhani'] flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    +15.2% this week
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10
                                   transition-all duration-200 group">
                    <Copy className="w-5 h-5 text-white/60 group-hover:text-[var(--algorand-cyan)]" />
                  </button>
                  <button className="p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10
                                   transition-all duration-200 group">
                    <ExternalLink className="w-5 h-5 text-white/60 group-hover:text-[var(--algorand-cyan)]" />
                  </button>
                </div>
              </div>

              <div className="flex gap-4">
                <button className="flex-1 py-4 rounded-xl font-['Exo_2'] font-bold tracking-wider
                                 bg-gradient-to-r from-[var(--algorand-cyan)] to-[var(--electric-volt)]
                                 text-[var(--deep-charcoal)] shadow-lg shadow-[var(--neon-cyan-glow)]/50
                                 hover:shadow-xl hover:shadow-[var(--neon-cyan-glow)] transition-all duration-300">
                  DEPOSIT
                </button>
                <button className="flex-1 py-4 rounded-xl font-['Exo_2'] font-bold tracking-wider
                                 bg-white/10 border border-white/20 text-white
                                 hover:bg-white/20 transition-all duration-300">
                  WITHDRAW
                </button>
              </div>
            </div>
          </div>

          {/* Transaction History */}
          <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 
                        shadow-2xl shadow-black/50 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />

            <div className="relative">
              <h2 className="font-['Exo_2'] font-bold text-xl tracking-wider text-[var(--algorand-cyan)] mb-6">
                TRANSACTION HISTORY
              </h2>

              <div className="space-y-3">
                {transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5
                                            hover:bg-white/10 hover:border-[var(--algorand-cyan)]/30
                                            transition-all duration-200 cursor-pointer">
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center
                                   ${tx.type === 'win' ? 'bg-[var(--electric-volt)]/20 border border-[var(--electric-volt)]/50' :
                        tx.type === 'loss' ? 'bg-red-500/20 border border-red-500/50' :
                          tx.type === 'deposit' ? 'bg-[var(--algorand-cyan)]/20 border border-[var(--algorand-cyan)]/50' :
                            'bg-white/10 border border-white/20'}`}>
                      {tx.type === 'win' && <ArrowDownLeft className="w-5 h-5 text-[var(--electric-volt)]" />}
                      {tx.type === 'loss' && <ArrowUpRight className="w-5 h-5 text-red-500" />}
                      {tx.type === 'stake' && <ArrowUpRight className="w-5 h-5 text-white/60" />}
                      {tx.type === 'deposit' && <ArrowDownLeft className="w-5 h-5 text-[var(--algorand-cyan)]" />}
                    </div>

                    {/* Details */}
                    <div className="flex-1">
                      <div className="font-['Rajdhani'] font-semibold text-white mb-1">
                        {tx.description}
                      </div>
                      <div className="text-white/40 text-xs font-['Rajdhani']">
                        {tx.date}
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="text-right">
                      <div className={`font-['Exo_2'] font-bold text-lg
                                     ${tx.amount.startsWith('+') ? 'text-[var(--electric-volt)]' : 'text-white/60'}`}>
                        {tx.amount} ALGO
                      </div>
                      <div className="text-white/40 text-xs capitalize">
                        {tx.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button className="w-full mt-4 py-3 rounded-xl font-['Rajdhani'] font-semibold
                               bg-white/5 border border-white/10 text-white/80
                               hover:bg-white/10 hover:border-[var(--algorand-cyan)]/30
                               transition-all duration-200">
                Load More Transactions
              </button>
            </div>
          </div>
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-6">
          {/* Wallet Address */}
          <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 
                        shadow-2xl shadow-black/50 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />

            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <Wallet className="w-5 h-5 text-[var(--algorand-cyan)]" />
                <h3 className="font-['Exo_2'] font-bold tracking-wider text-[var(--algorand-cyan)]">
                  WALLET ADDRESS
                </h3>
              </div>

              <div className="p-3 rounded-lg bg-white/5 border border-white/10 mb-3">
                <div className="font-['Rajdhani'] text-sm text-white/80 break-all">
                  {activeAccount ? activeAccount.address : 'Wallet not connected'}
                </div>
              </div>

              <button className="w-full py-2 rounded-lg bg-white/5 border border-white/10
                               hover:bg-white/10 hover:border-[var(--algorand-cyan)]/30
                               font-['Rajdhani'] font-semibold text-sm text-white/80
                               transition-all duration-200 flex items-center justify-center gap-2">
                <Copy className="w-4 h-4" />
                Copy Address
              </button>
            </div>
          </div>

          {/* Performance Stats */}
          <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 
                        shadow-2xl shadow-black/50 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />

            <div className="relative">
              <h3 className="font-['Exo_2'] font-bold tracking-wider text-[var(--electric-volt)] mb-4">
                PERFORMANCE
              </h3>

              <div className="space-y-4">
                {stats.map((stat, index) => (
                  <div key={index} className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-white/60 text-xs font-['Rajdhani'] mb-2">{stat.label}</div>
                    <div className="flex items-end justify-between">
                      <div className="font-['Exo_2'] font-black text-2xl text-white">
                        {stat.value}
                      </div>
                      <div className={`flex items-center gap-1 text-sm font-['Rajdhani']
                                     ${stat.up ? 'text-[var(--electric-volt)]' : 'text-red-400'}`}>
                        {stat.up ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        {stat.change}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 
                        shadow-2xl shadow-black/50 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />

            <div className="relative">
              <h3 className="font-['Exo_2'] font-bold tracking-wider text-white mb-4">
                QUICK ACTIONS
              </h3>

              <div className="space-y-2">
                <button className="w-full py-3 rounded-lg bg-white/5 border border-white/10
                                 hover:bg-white/10 hover:border-[var(--algorand-cyan)]/30
                                 font-['Rajdhani'] font-semibold text-sm text-white/80
                                 transition-all duration-200 text-left px-4">
                  Export Transactions
                </button>
                <button className="w-full py-3 rounded-lg bg-white/5 border border-white/10
                                 hover:bg-white/10 hover:border-[var(--algorand-cyan)]/30
                                 font-['Rajdhani'] font-semibold text-sm text-white/80
                                 transition-all duration-200 text-left px-4">
                  View on Explorer
                </button>
                <button className="w-full py-3 rounded-lg bg-white/5 border border-white/10
                                 hover:bg-white/10 hover:border-[var(--algorand-cyan)]/30
                                 font-['Rajdhani'] font-semibold text-sm text-white/80
                                 transition-all duration-200 text-left px-4">
                  Account Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
