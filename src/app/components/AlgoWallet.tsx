import { PeraWalletConnect } from "@perawallet/connect";
import { useEffect, useState } from "react";

const peraWallet = new PeraWalletConnect();

export default function AlgoWallet() {
    const [accountAddress, setAccountAddress] = useState<string | null>(null);
    const isConnectedToPeraWallet = !!accountAddress;

    useEffect(() => {
        // Reconnect to the session when the component is mounted
        peraWallet.reconnectSession().then((accounts) => {
            peraWallet.connector?.on("disconnect", handleDisconnectWalletClick);

            if (accounts.length) {
                setAccountAddress(accounts[0]);
            }
        });
    }, []);

    function handleConnectWalletClick() {
        peraWallet
            .connect()
            .then((newAccounts) => {
                peraWallet.connector?.on("disconnect", handleDisconnectWalletClick);
                setAccountAddress(newAccounts[0]);
            })
            .catch((error) => {
                console.error("Wallet Connect Error:", error);
                if (error?.data?.type !== "CONNECT_MODAL_CLOSED") {
                    console.log(error);
                }
            });
    }

    function handleDisconnectWalletClick() {
        peraWallet.disconnect();
        setAccountAddress(null);
    }

    return (
        <div className="flex gap-4 items-center">
            {isConnectedToPeraWallet ? (
                <div className="flex items-center gap-2">
                    <span className="text-neon-cyan font-mono text-sm border border-neon-cyan/30 px-3 py-1 rounded bg-black/50">
                        {accountAddress.slice(0, 6)}...{accountAddress.slice(-4)}
                    </span>
                    <button
                        onClick={handleDisconnectWalletClick}
                        className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/50 rounded transition-all uppercase tracking-wider text-xs font-bold font-['Rajdhani']"
                    >
                        Disconnect
                    </button>
                </div>
            ) : (
                <button
                    onClick={handleConnectWalletClick}
                    className="px-6 py-2 bg-[var(--algorand-cyan)]/10 hover:bg-[var(--algorand-cyan)]/20 text-[var(--algorand-cyan)] border border-[var(--algorand-cyan)] rounded shadow-[0_0_15px_rgba(0,212,255,0.3)] hover:shadow-[0_0_25px_rgba(0,212,255,0.5)] transition-all uppercase tracking-wider text-sm font-bold font-['Rajdhani']"
                >
                    Connect Pera
                </button>
            )}
        </div>
    );
}
