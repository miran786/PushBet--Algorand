
import { WalletConnectButton } from './WalletConnectButton';
import './Navbar.css';

export const Navbar = () => {
    return (
        <nav className="navbar">
            <div className="container navbar-content">
                <div className="navbar-logo">
                    <span className="text-gradient">PushBet</span>
                </div>
                <div className="navbar-links">
                    <a href="#" className="nav-link active">Home</a>
                    <a href="#" className="nav-link">Market</a>
                    <a href="#" className="nav-link">Leaderboard</a>
                </div>
                <div className="navbar-actions">
                    <WalletConnectButton />
                </div>
            </div>
        </nav>
    );
};
