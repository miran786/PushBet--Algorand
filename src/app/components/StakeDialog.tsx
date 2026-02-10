// @ts-nocheck
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Coins, TrendingUp, Loader2 } from "lucide-react";
import { useWallet } from "@txnlab/use-wallet-react";
import algosdk from "algosdk";
import { toast } from "sonner";

interface StakeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StakeDialog({ open, onOpenChange }: StakeDialogProps) {
  const { activeAccount, signTransactions } = useWallet();
  const [stakeAmount, setStakeAmount] = useState("1");
  const [repTarget, setRepTarget] = useState("20");
  const [isStaking, setIsStaking] = useState(false);

  const handleStake = async () => {
    if (!activeAccount) {
      toast.error("Please connect your wallet first");
      return;
    }

    setIsStaking(true);
    try {
      const algodToken = '';
      const algodServer = 'https://testnet-api.algonode.cloud';
      const algodPort = 443;
      const algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);

      const params = await algodClient.getTransactionParams().do();
      const amountMicroAlgos = algosdk.algosToMicroalgos(parseFloat(stakeAmount));

      const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        sender: activeAccount.address,
        receiver: activeAccount.address, // Self-transaction for demo
        amount: amountMicroAlgos,
        suggestedParams: params,
        note: new TextEncoder().encode(`PushBet Stake: ${stakeAmount} ALGO | Target: ${repTarget} Reps`),
      });

      const encodedTxn = algosdk.encodeUnsignedTransaction(txn);
      const signedTxns = await signTransactions([encodedTxn]);

      const response = await algodClient.sendRawTransaction(signedTxns).do();
      console.log("Raw Transaction Response:", JSON.stringify(response));

      let txId: string | null = null;
      if (response && typeof response === 'object') {
        txId = (response as any).txId || (response as any).txid || (response as any).id;
      } else if (typeof response === 'string') {
        txId = response;
      }

      console.log("Extracted Transaction ID:", txId);

      if (!txId) {
        throw new Error(`Transaction ID not found in response. Received: ${JSON.stringify(response)}`);
      }

      toast.info("Transaction sent. Waiting for confirmation...");
      await algosdk.waitForConfirmation(algodClient, txId, 4);

      toast.success(`Stake Confirmed! Target: ${repTarget} Reps`);
      onOpenChange(false);
    } catch (error: any) {
      console.error("Staking failed:", error);
      let errorMessage = "Failed to place stake. Please try again.";
      if (error && error.message && error.message.includes("overspend")) {
        errorMessage = "Insufficient funds. Remember to keep ALGOs for transaction fees.";
      } else if (error && error.message) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    } finally {
      setIsStaking(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[var(--matte-black)] border-2 border-[var(--algorand-cyan)]/30 text-white max-w-lg
                               backdrop-blur-xl shadow-2xl shadow-[var(--neon-cyan-glow)]/50">
        <DialogHeader>
          <DialogTitle className="font-['Exo_2'] font-black text-3xl tracking-wider">
            <span className="bg-gradient-to-r from-[var(--algorand-cyan)] to-[var(--electric-volt)] bg-clip-text text-transparent">
              PLACE YOUR STAKE
            </span>
          </DialogTitle>
          <DialogDescription className="font-['Rajdhani'] text-white/60 text-base">
            Set your stake amount and rep target to enter the challenge
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Stake Amount */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 font-['Rajdhani'] font-semibold text-sm tracking-wider text-[var(--algorand-cyan)]">
              <Coins className="w-4 h-4" />
              STAKE AMOUNT
            </label>
            <div className="relative">
              <input
                type="number"
                value={stakeAmount}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "" || (parseFloat(val) >= 0 && !val.includes("-"))) {
                    setStakeAmount(val);
                  }
                }}
                min="0"
                className="w-full px-4 py-4 rounded-xl bg-white/5 border-2 border-white/10 
                         focus:border-[var(--algorand-cyan)]/50 outline-none
                         font-['Exo_2'] font-bold text-2xl tracking-tight text-white
                         transition-all duration-300 pr-20"
                placeholder="1"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 font-['Exo_2'] font-bold text-lg text-[var(--algorand-cyan)]">
                ALGO
              </div>
            </div>
            <div className="flex gap-2">
              {["1", "2", "5", "10"].map((amount) => (
                <button
                  key={amount}
                  onClick={() => setStakeAmount(amount)}
                  className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10
                           hover:bg-[var(--algorand-cyan)]/20 hover:border-[var(--algorand-cyan)]/50
                           font-['Rajdhani'] font-semibold text-sm transition-all duration-200"
                >
                  {amount}
                </button>
              ))}
            </div>
          </div>

          {/* Rep Target */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 font-['Rajdhani'] font-semibold text-sm tracking-wider text-[var(--electric-volt)]">
              <TrendingUp className="w-4 h-4" />
              REP TARGET
            </label>
            <div className="relative">
              <input
                type="number"
                value={repTarget}
                onChange={(e) => setRepTarget(e.target.value)}
                className="w-full px-4 py-4 rounded-xl bg-white/5 border-2 border-white/10 
                         focus:border-[var(--electric-volt)]/50 outline-none
                         font-['Exo_2'] font-bold text-2xl tracking-tight text-white
                         transition-all duration-300 pr-20"
                placeholder="20"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 font-['Exo_2'] font-bold text-lg text-[var(--electric-volt)]">
                REPS
              </div>
            </div>
            <div className="flex gap-2">
              {["10", "20", "30", "50"].map((reps) => (
                <button
                  key={reps}
                  onClick={() => setRepTarget(reps)}
                  className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10
                           hover:bg-[var(--electric-volt)]/20 hover:border-[var(--electric-volt)]/50
                           font-['Rajdhani'] font-semibold text-sm transition-all duration-200"
                >
                  {reps}
                </button>
              ))}
            </div>
          </div>

          {/* Potential Win */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-[var(--algorand-cyan)]/10 to-[var(--electric-volt)]/10
                        border border-[var(--algorand-cyan)]/30">
            <div className="flex justify-between items-center">
              <span className="font-['Rajdhani'] text-white/80">Potential Win:</span>
              <span className="font-['Exo_2'] font-black text-2xl bg-gradient-to-r from-[var(--algorand-cyan)] to-[var(--electric-volt)] bg-clip-text text-transparent">
                {(parseFloat(stakeAmount || "0") * 1.8).toFixed(1)} ALGO
              </span>
            </div>
          </div>

          {/* Confirm Button */}
          <button
            onClick={handleStake}
            disabled={isStaking}
            className="w-full py-4 rounded-xl font-['Exo_2'] font-bold tracking-widest
                     bg-gradient-to-r from-[var(--algorand-cyan)] to-[var(--electric-volt)]
                     text-[var(--deep-charcoal)] shadow-lg shadow-[var(--neon-cyan-glow)]
                     hover:shadow-xl hover:shadow-[var(--neon-cyan-glow)] transition-all duration-300
                     hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 flex justify-center items-center gap-2"
          >
            {isStaking ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                CONFIRMING...
              </>
            ) : (
              "CONFIRM STAKE"
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
