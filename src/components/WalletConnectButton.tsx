import { PeraWalletConnect } from '@perawallet/connect';
import { useEffect, useState } from 'react';
import { FaWallet } from 'react-icons/fa';
import './WalletConnectButton.css';

const peraWallet = new PeraWalletConnect();

export const WalletConnectButton = () => {
    const [accountAddress, setAccountAddress] = useState<string | null>(null);
    const isConnected = !!accountAddress;

    useEffect(() => {
        // Reconnect to the session when the component mounts
        peraWallet.reconnectSession().then((accounts) => {
            // Setup the disconnect event listener
            peraWallet.connector?.on('disconnect', handleDisconnectWalletClick);

            if (accounts.length) {
                setAccountAddress(accounts[0]);
            }
        });
    }, []);

    const handleConnectWalletClick = () => {
        peraWallet
            .connect()
            .then((newAccounts) => {
                // Setup the disconnect event listener
                peraWallet.connector?.on('disconnect', handleDisconnectWalletClick);

                setAccountAddress(newAccounts[0]);
            })
            .catch((error) => {
                // You should handle the error here
                if (error?.data?.type !== 'CONNECT_MODAL_CLOSED') {
                    console.log(error);
                }
            });
    };

    const handleDisconnectWalletClick = () => {
        peraWallet.disconnect();
        setAccountAddress(null);
    };

    return (
        <button
            className={`wallet-btn ${isConnected ? 'connected' : ''}`}
            onClick={isConnected ? handleDisconnectWalletClick : handleConnectWalletClick}
        >
            <FaWallet className="wallet-icon" />
            {isConnected ? (
                <span>{accountAddress?.slice(0, 6)}...{accountAddress?.slice(-4)}</span>
            ) : (
                <span>Connect Wallet</span>
            )}
        </button>
    );
};
