import { useWallet } from "@txnlab/use-wallet-react";

export default function AlgoWallet() {
    const { wallets, activeAccount } = useWallet();

    const isConnected = !!activeAccount;

    const handleConnect = async (walletId: string) => {
        try {
            const wallet = wallets?.find((w) => w.id === walletId);
            await wallet?.connect();
        } catch (error) {
            console.error("Connect error:", error);
        }
    };

    const handleDisconnect = async () => {
        try {
            const wallet = wallets?.find(w => w.isActive);
            wallet?.disconnect();
        } catch (error) {
            console.error("Disconnect error:", error);
        }
    };

    return (
        <div className="flex gap-4 items-center">
            {isConnected ? (
                <div className="flex items-center gap-2">
                    <span className="text-neon-cyan font-mono text-sm border border-neon-cyan/30 px-3 py-1 rounded bg-black/50">
                        {activeAccount?.address.slice(0, 6)}...{activeAccount?.address.slice(-4)}
                    </span>
                    <button
                        onClick={handleDisconnect}
                        className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/50 rounded transition-all uppercase tracking-wider text-xs font-bold font-['Rajdhani']"
                    >
                        Disconnect
                    </button>
                </div>
            ) : (
                <div className="flex gap-2">
                    {wallets?.map((wallet) => (
                        <button
                            key={wallet.id}
                            onClick={() => handleConnect(wallet.id)}
                            className="px-4 py-2 bg-[var(--algorand-cyan)]/10 hover:bg-[var(--algorand-cyan)]/20 text-[var(--algorand-cyan)] border border-[var(--algorand-cyan)] rounded shadow-[0_0_15px_rgba(0,212,255,0.3)] transition-all uppercase tracking-wider text-xs font-bold font-['Rajdhani'] flex items-center gap-2"
                        >
                            <img src={wallet.metadata.icon} alt={wallet.metadata.name} className="w-4 h-4" />
                            {wallet.metadata.name}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
