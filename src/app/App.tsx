import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { WalletProvider } from "@txnlab/use-wallet-react";
import { WalletManager, WalletId } from "@txnlab/use-wallet";
import { Toaster } from "sonner";

const walletManager = new WalletManager({
  wallets: [
    WalletId.DEFLY,
    WalletId.PERA,
  ],
});

export default function App() {
  return (
    <WalletProvider manager={walletManager}>
      <Toaster position="top-center" richColors />
      <RouterProvider router={router} />
    </WalletProvider>
  );
}
