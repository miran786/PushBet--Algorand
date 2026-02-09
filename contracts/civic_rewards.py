from pyteal import *

def approval_program():
    is_admin = Txn.sender() == Global.creator_address()
    
    # 1. Initialization
    handle_creation = Return(Int(1))
    
    # 2. Opt-In (Users must opt-in to receive rewards?) 
    # Actually simple payment doesn't need opt-in, but App Call does if using Local State.
    # For now, just allow opt-in.
    handle_optin = Return(Int(1))
    
    # 3. Admin Payout Logic (NoOp)
    # Arg[0] = "payout"
    # Arg[1] = Receiver Address
    # Arg[2] = Amount (Int)
    
    receiver = Txn.application_args[1]
    amount = Btoi(Txn.application_args[2])
    
    payout = Seq([
        Assert(is_admin), # Only admin can trigger payout
        InnerTxnBuilder.Begin(),
        InnerTxnBuilder.SetFields({
            TxnField.type_enum: TxnType.Payment,
            TxnField.receiver: receiver,
            TxnField.amount: amount,
            TxnField.fee: Int(0) # Inner txn fee covered by outer? Or set to 0 and pool
        }),
        InnerTxnBuilder.Submit(),
        Return(Int(1))
    ])
    
    handle_noop = Cond(
        [Txn.application_args[0] == Bytes("payout"), payout],
    )

    return Cond(
        [Txn.application_id() == Int(0), handle_creation],
        [Txn.on_completion() == OnComplete.OptIn, handle_optin],
        [Txn.on_completion() == OnComplete.NoOp, handle_noop],
    )

def clear_state_program():
    return Return(Int(1))

if __name__ == "__main__":
    with open("civic_rewards.teal", "w") as f:
        compiled = compileTeal(approval_program(), mode=Mode.Application, version=6)
        f.write(compiled)
