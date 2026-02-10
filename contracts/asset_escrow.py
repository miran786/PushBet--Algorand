from pyteal import *

def approval_program():
    # Local State Keys
    item_key = Bytes("item_id")
    collateral_key = Bytes("collateral")
    borrow_time_key = Bytes("borrow_time")

    # Operations
    op_borrow = Bytes("borrow")
    op_return = Bytes("return")

    # Handle Creation
    handle_creation = Return(Int(1))

    # Handle OptIn (Initialize Local State)
    handle_optin = Seq([
        App.localPut(Txn.sender(), item_key, Bytes("none")),
        App.localPut(Txn.sender(), collateral_key, Int(0)),
        App.localPut(Txn.sender(), borrow_time_key, Int(0)),
        Return(Int(1))
    ])

    # Borrow Item
    # Group: [Payment (Optional), AppCall]
    # Arg[1]: Item ID
    # Note: Payment receiver must be App Address
    
    borrow_payment = Gtxn[0]
    borrow_amount = If(
        And(
            Global.group_size() == Int(2),
            borrow_payment.type_enum() == TxnType.Payment,
            borrow_payment.receiver() == Global.current_application_address()
        ),
        borrow_payment.amount(),
        Int(0)
    )

    borrow = Seq([
        Assert(App.localGet(Txn.sender(), item_key) == Bytes("none")), # Ensure not already borrowing
        
        # Record Borrow
        App.localPut(Txn.sender(), item_key, Txn.application_args[1]),
        App.localPut(Txn.sender(), collateral_key, borrow_amount),
        App.localPut(Txn.sender(), borrow_time_key, Global.latest_timestamp()),
        
        Return(Int(1))
    ])

    # Return Item (Admin/Lender Action)
    # Arg[1]: Borrower Address
    borrower = Txn.application_args[1]
    
    confirm_return = Seq([
        # Only Creator (Lender) can confirm return to release collateral
        Assert(Txn.sender() == Global.creator_address()),
        
        # Check Borrower State
        Assert(App.localGet(borrower, item_key) != Bytes("none")),
        
        # Refund Collateral if > 0
        If(App.localGet(borrower, collateral_key) > Int(0)).Then(
            Seq([
                InnerTxnBuilder.Begin(),
                InnerTxnBuilder.SetFields({
                    TxnField.type_enum: TxnType.Payment,
                    TxnField.receiver: borrower,
                    TxnField.amount: App.localGet(borrower, collateral_key),
                    TxnField.fee: Int(0) # Inner txn fee
                }),
                InnerTxnBuilder.Submit(),
            ])
        ),

        # Clear Borrower State
        App.localPut(borrower, item_key, Bytes("none")),
        App.localPut(borrower, collateral_key, Int(0)),
        App.localPut(borrower, borrow_time_key, Int(0)),
        
        Return(Int(1))
    ])

    handle_noop = Cond(
        [Txn.application_args[0] == op_borrow, borrow],
        [Txn.application_args[0] == op_return, confirm_return]
    )

    return Cond(
        [Txn.application_id() == Int(0), handle_creation],
        [Txn.on_completion() == OnComplete.OptIn, handle_optin],
        [Txn.on_completion() == OnComplete.CloseOut, Approve()],
        [Txn.on_completion() == OnComplete.UpdateApplication, Return(Int(1))],
        [Txn.on_completion() == OnComplete.DeleteApplication, Return(Int(1))],
        [Txn.on_completion() == OnComplete.NoOp, handle_noop],
    )

def clear_state_program():
    return Return(Int(1))

if __name__ == "__main__":
    with open("asset_escrow.teal", "w") as f:
        compiled = compileTeal(approval_program(), mode=Mode.Application, version=6)
        f.write(compiled)
