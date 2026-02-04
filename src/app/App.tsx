import { RouterProvider } from "react-router";
import { router } from "./routes";
import { WalletProvider } from "@txnlab/use-wallet-react";
import { WalletManager, WalletId } from "@txnlab/use-wallet";

const walletManager = new WalletManager({
  wallets: [
    WalletId.DEFLY,
    WalletId.PERA,
  ],
});

export default function App() {
  return (
    <WalletProvider manager={walletManager}>
      <RouterProvider router={router} />
    </WalletProvider>
  );
}
