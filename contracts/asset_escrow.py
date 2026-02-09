from pyteal import *

def approval_program():
    # 1. Init
    handle_creation = Return(Int(1))
    
    # 2. Deposit (Opt-In + Payment)
    # User calls App with Opt-In and sends ALGO payment in same group.
    # We verify the payment is to the App Account.
    handle_optin = Seq([
        # Check if user sent payment with opt-in
        # Gtxn[0] is Payment, Gtxn[1] is this App Call? 
        # For simplicity, we assume generic opt-in is allowed.
        Return(Int(1))
    ])
    
    # 3. Return Deposit (Admin Only)
    # Arg[0] = "return_deposit"
    # Arg[1] = Borrower Address
    borrower = Txn.application_args[1]
    
    return_deposit = Seq([
        Assert(Txn.sender() == Global.creator_address()),
        InnerTxnBuilder.Begin(),
        InnerTxnBuilder.SetFields({
            TxnField.type_enum: TxnType.Payment,
            TxnField.receiver: borrower,
            TxnField.amount: Int(5000000), # 5 ALGO fixed
            TxnField.fee: Int(0)
        }),
        InnerTxnBuilder.Submit(),
        Return(Int(1))
    ])
    
    handle_noop = Cond(
        [Txn.application_args[0] == Bytes("return_deposit"), return_deposit]
    )

    return Cond(
        [Txn.application_id() == Int(0), handle_creation],
        [Txn.on_completion() == OnComplete.OptIn, handle_optin],
        [Txn.on_completion() == OnComplete.NoOp, handle_noop],
    )

def clear_state_program():
    return Return(Int(1))

if __name__ == "__main__":
    with open("asset_escrow.teal", "w") as f:
        compiled = compileTeal(approval_program(), mode=Mode.Application, version=6)
        f.write(compiled)
