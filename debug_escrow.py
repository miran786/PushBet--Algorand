from pyteal import *

def approval_program():
    # Local State Keys
    item_key = Bytes("item_id")
    collateral_key = Bytes("collateral")
    borrow_time_key = Bytes("borrow_time")
    
    TRUST_APP_ID = Int(755292569) 
    trust_score_key = Bytes("Trust_Score")

    # Operations
    op_borrow = Bytes("borrow")
    op_return = Bytes("return")

    # Handle Creation
    handle_creation = Return(Int(1))

    # Handle OptIn
    handle_optin = Seq([
        App.localPut(Txn.sender(), item_key, Bytes("none")),
        Return(Int(1))
    ])

    # Helper: Get Trust Score
    trust_score_val = App.localGetEx(Txn.sender(), TRUST_APP_ID, trust_score_key)

    borrow = Seq([
        # Assert(App.localGet(Txn.sender(), item_key) == Bytes("none")), 
        
        # Check Trust Score
        trust_score_val,
        
        # Conditional Logic
        If(
            And(trust_score_val.hasValue(), trust_score_val.value() >= Int(50))
        ).Then(
            App.localPut(Txn.sender(), collateral_key, Int(0))
        ).Else(
            Seq([
                Assert(
                    And(
                        Global.group_size() == Int(2),
                        Gtxn[0].type_enum() == TxnType.Payment,
                        Gtxn[0].receiver() == Global.current_application_address(),
                        Gtxn[0].amount() >= Int(1000000)
                    )
                ),
                App.localPut(Txn.sender(), collateral_key, Gtxn[0].amount())
            ])
        ),
        
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
        [Txn.on_completion() == OnComplete.UpdateApplication, Return(Int(0))],
        [Txn.on_completion() == OnComplete.DeleteApplication, Return(Int(0))],
        [Txn.on_completion() == OnComplete.NoOp, handle_noop],
    )

if __name__ == "__main__":
    with open("debug_escrow.teal", "w") as f:
        compiled = compileTeal(approval_program(), mode=Mode.Application, version=6)
        f.write(compiled)
        print("Compilation Successful!")
