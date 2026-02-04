from pyteal import *

def approval_program():
    # Global state keys
    local_match_id = Bytes("match_id")
    local_admin = Bytes("admin")

    # Initialization
    on_creation = Seq([
        App.globalPut(local_admin, Txn.sender()),
        App.globalPut(local_match_id, Int(0)),
        Return(Int(1))
    ])

    # Admin payout logic
    # Args[0] = "payout"
    # Args[1] = Winner Address
    winner_addr = Txn.application_args[1]
    payout = Seq([
        Assert(Txn.sender() == App.globalGet(local_admin)),
        
        # Send total balance to winner
        # Inner transaction
        InnerTxnBuilder.Begin(),
        InnerTxnBuilder.SetFields({
            TxnField.type_enum: TxnType.Payment,
            TxnField.receiver: winner_addr,
            TxnField.amount: Balance(Global.current_application_address()) - Global.min_txn_fee(),
            TxnField.fee: Int(0) # Inner txn fee covered by outer? Or set to 0 and let pooled fees handle it if supported, 
                                 # For simplicity on Testnet, usually we might pay fee. 
                                 # Safer to just close out the account or send specific amount.
                                 # User said "payout", let's assume sending available balance.
        }),
        InnerTxnBuilder.Submit(),
        
        Return(Int(1))
    ])

    # Deposit logic (Opt-in or just NoOp call with payment?)
    # Usually users send Algo to the App Account.
    # We can accept payments in the OnCompletion.
    deposit = Seq([
        Return(Int(1))
    ])

    program = Cond(
        [Txn.application_id() == Int(0), on_creation],
        [Txn.on_completion() == OnComplete.DeleteApplication, Return(Int(0))],
        [Txn.on_completion() == OnComplete.UpdateApplication, Return(Int(0))], # Admin only in real app
        [Txn.on_completion() == OnComplete.OptIn, Return(Int(1))],
        [Txn.on_completion() == OnComplete.CloseOut, Return(Int(1))],
        [Txn.on_completion() == OnComplete.NoOp, Cond(
            [Txn.application_args[0] == Bytes("payout"), payout],
            [Txn.application_args[0] == Bytes("deposit"), deposit]
        )]
    )

    return program

def clear_state_program():
    return Return(Int(1))

if __name__ == "__main__":
    with open("contract.teal", "w") as f:
        compiled = compileTeal(approval_program(), mode=Mode.Application, version=6)
        f.write(compiled)
    
    with open("clear.teal", "w") as f:
        compiled = compileTeal(clear_state_program(), mode=Mode.Application, version=6)
        f.write(compiled)
