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
  Activity,
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  ExternalLink,
  Copy
} from "lucide-react";
import { useState, useEffect } from "react";
import algosdk from "algosdk";
import { toast } from "sonner";
import { useWallet } from "@txnlab/use-wallet-react";

// House Wallet Address (Testnet)
const HOUSE_WALLET_ADDRESS = "HZ57J3K46JIJXILONBBZOHX6BKPXEM2VVXNRFSUC35DQYIJCKQKZQ";

export function Admin() {
  const { activeAccount } = useWallet();
  const [balance, setBalance] = useState<string>("0.00");
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Stats (Mocked for now or derived)
  const stats = [
    { label: "House Balance", value: `${balance} ALGO`, icon: Wallet, color: "text-[var(--electric-volt)]" },
    // { label: "Total Staked", value: "1,245 ALGO", icon: ArrowUpRight, color: "text-[var(--algorand-cyan)]" }, // Removed per request
    // { label: "Total Payouts", value: "850 ALGO", icon: ArrowDownLeft, color: "text-white" }, // Removed per request
    // { label: "Net Profit", value: "395 ALGO", icon: Activity, color: "text-green-400" }, // Removed per request
  ];

  // Fetch House Wallet Balance
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const algodClient = new algosdk.Algodv2('', 'https://testnet-api.algonode.cloud', 443);
        const accountInfo = await algodClient.accountInformation(HOUSE_WALLET_ADDRESS).do();
        const algoBalance = algosdk.microalgosToAlgos(accountInfo.amount);
        setBalance(algoBalance.toFixed(2));
      } catch (error) {
        console.error("Failed to fetch House Wallet balance:", error);
      }
    };

    fetchBalance();
    const interval = setInterval(fetchBalance, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  // Mock Transactions (Since we don't have an indexer easily setup yet)
  useEffect(() => {
    setTransactions([
      { id: 1, type: 'stake', amount: '+50.00', sender: 'ALGO...4K9P', date: '2 mins ago', status: 'completed' },
      { id: 2, type: 'payout', amount: '-25.00', receiver: 'USER...X7Y2', date: '15 mins ago', status: 'completed' },
      { id: 3, type: 'stake', amount: '+10.00', sender: 'TEST...8J2K', date: '1 hour ago', status: 'completed' },
      { id: 4, type: 'penalty', amount: '+100.00', sender: 'FAIL...9L1M', date: '2 hours ago', status: 'completed' },
    ]);
  }, []);

  const handleWithdraw = () => {
    if (!activeAccount) {
      toast.error("Connect Admin Wallet First");
      return;
    }
    setLoading(true);
    // Simulation of withdrawal logic
    setTimeout(() => {
      toast.success(`Withdrawn 500 ALGO to ${activeAccount.address.slice(0, 6)}...`);
      setLoading(false);
    }, 2000);
  };

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
            House Wallet Management Dashboard
          </p>
        </div>
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
        {/* House Wallet Details - 2 Columns */}
        <div className="xl:col-span-2 space-y-6">
          <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 
                        shadow-2xl shadow-black/50 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--algorand-cyan)]/10 to-[var(--electric-volt)]/10 pointer-events-none" />

            <div className="relative">
              <div className="flex items-center gap-2 mb-6">
                <Wallet className="w-6 h-6 text-[var(--algorand-cyan)]" />
                <h2 className="font-['Exo_2'] font-bold text-xl tracking-wider text-white">
                  HOUSE WALLET (ESCROW)
                </h2>
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-white/5 mb-6 flex items-center justify-between">
                <code className="text-[var(--algorand-cyan)] font-mono text-sm break-all">
                  {HOUSE_WALLET_ADDRESS}
                </code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(HOUSE_WALLET_ADDRESS);
                    toast.success("Address Copied!");
                  }}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <Copy className="w-4 h-4 text-white/60" />
                </button>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleWithdraw}
                  disabled={loading}
                  className="flex-1 py-4 rounded-xl font-['Exo_2'] font-bold tracking-wider
                           bg-gradient-to-r from-[var(--algorand-cyan)] to-[var(--electric-volt)]
                           text-[var(--deep-charcoal)] shadow-lg shadow-[var(--neon-cyan-glow)]/50
                           hover:shadow-xl hover:shadow-[var(--neon-cyan-glow)] transition-all duration-300
                           disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading ? "PROCESSING..." : "WITHDRAW FUNDS TO ADMIN"}
                </button>
                <a
                  href={`https://testnet.algoexplorer.io/address/${HOUSE_WALLET_ADDRESS}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-4 rounded-xl font-['Exo_2'] font-bold tracking-wider
                           bg-white/10 border border-white/20 text-white text-center
                           hover:bg-white/20 transition-all duration-300 flex items-center justify-center gap-2">
                  VIEW ON EXPLORER <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Transaction History */}
          <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 
                        shadow-2xl shadow-black/50 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />

            <div className="relative">
              <h3 className="font-['Exo_2'] font-bold tracking-wider text-white mb-6">
                RECENT TRANSACTIONS
              </h3>

              <div className="space-y-3">
                {transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5
                                            hover:bg-white/10 hover:border-[var(--algorand-cyan)]/30
                                            transition-all duration-200">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center
                                   ${tx.type === 'stake' || tx.type === 'penalty' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {tx.type === 'stake' || tx.type === 'penalty' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                    </div>
                    <div className="flex-1">
                      <div className="font-['Rajdhani'] font-semibold text-white capitalize">
                        {tx.type}
                      </div>
                      <div className="text-white/40 text-xs font-['Rajdhani']">
                        {tx.date} • {tx.sender || tx.receiver}
                      </div>
                    </div>
                    <div className={`font-['Exo_2'] font-bold text-lg
                                   ${tx.type === 'stake' || tx.type === 'penalty' ? 'text-green-400' : 'text-white/60'}`}>
                      {tx.amount}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 
                        shadow-2xl shadow-black/50 overflow-hidden">
            <h3 className="font-['Exo_2'] font-bold text-[var(--electric-volt)] mb-4">
              SYSTEM HEALTH
            </h3>
            <div className="space-y-4">
              {['API Connection', 'Indexer Status', 'Smart Contract'].map((item, i) => (
                <div key={i} className="flex justify-between items-center text-sm">
                  <span className="text-white/60 font-['Rajdhani']">{item}</span>
                  <span className="text-green-400 font-bold">OPERATIONAL</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
