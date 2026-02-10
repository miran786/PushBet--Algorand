from pyteal import *

def approval_program():
    # Local State Variables
    # "role": bytes "rider" or "driver"
    # "trip_active": int 0 or 1
    # "matched_with": bytes (address of counterpart)
    # "collateral": int (amount locked)

    role_key = Bytes("role")
    trip_active_key = Bytes("trip_active")
    matched_with_key = Bytes("matched_with")
    collateral_key = Bytes("collateral")

    # Operations
    op_register_driver = Bytes("register_driver")
    op_register_rider = Bytes("register_rider")
    op_start_trip = Bytes("start_trip") # Rider deposits collateral
    op_end_trip = Bytes("end_trip")     # Rider confirms arrival, pays Driver
    op_cancel_trip = Bytes("cancel_trip") # Refund if no driver found

    # Handle Creation
    handle_creation = Return(Int(1))

    # Handle OptIn (Initialize Local State)
    handle_optin = Seq([
        App.localPut(Txn.sender(), role_key, Bytes("none")),
        App.localPut(Txn.sender(), trip_active_key, Int(0)),
        App.localPut(Txn.sender(), collateral_key, Int(0)),
        Return(Int(1))
    ])

    # Register as Driver
    register_driver = Seq([
        App.localPut(Txn.sender(), role_key, Bytes("driver")),
        Return(Int(1))
    ])

    # Register as Rider
    register_rider = Seq([
        App.localPut(Txn.sender(), role_key, Bytes("rider")),
        Return(Int(1))
    ])

    # Start Trip (Rider Action)
    # Rider must send payment transaction to Escrow (App Account)
    # Group Size = 2: [Payment, AppCall]
    start_trip = Seq([
        Assert(Global.group_size() == Int(2)),
        Assert(Gtxn[0].type_enum() == TxnType.Payment),
        Assert(Gtxn[0].receiver() == Global.current_application_address()),
        Assert(Gtxn[0].amount() > Int(0)),
        Assert(App.localGet(Txn.sender(), role_key) == Bytes("rider")),
        
        # Lock Collateral
        App.localPut(Txn.sender(), trip_active_key, Int(1)),
        App.localPut(Txn.sender(), collateral_key, Gtxn[0].amount()),
        Return(Int(1))
    ])

    # End Trip (Rider Action)
    # Pay Driver from Escrow
    # Arg[1] = Driver Address
    driver_addr = Txn.application_args[1]
    
    end_trip = Seq([
        Assert(App.localGet(Txn.sender(), trip_active_key) == Int(1)),
        Assert(App.localGet(Txn.sender(), collateral_key) > Int(0)),
        
        # Payment to Driver (Inner Txn)
        InnerTxnBuilder.Begin(),
        InnerTxnBuilder.SetFields({
            TxnField.type_enum: TxnType.Payment,
            TxnField.receiver: driver_addr,
            TxnField.amount: App.localGet(Txn.sender(), collateral_key),
            TxnField.fee: Int(0) # Inner txn fee covered by outer txn pooling or set to 0
        }),
        InnerTxnBuilder.Submit(),

        # Reset State
        App.localPut(Txn.sender(), trip_active_key, Int(0)),
        App.localPut(Txn.sender(), collateral_key, Int(0)),
        Return(Int(1))
    ])

    # Cancel Trip (Rider Action - Refund)
    cancel_trip = Seq([
        Assert(App.localGet(Txn.sender(), trip_active_key) == Int(1)),
        
        # Refund Rider
        InnerTxnBuilder.Begin(),
        InnerTxnBuilder.SetFields({
            TxnField.type_enum: TxnType.Payment,
            TxnField.receiver: Txn.sender(),
            TxnField.amount: App.localGet(Txn.sender(), collateral_key),
            TxnField.fee: Int(0)
        }),
        InnerTxnBuilder.Submit(),

        # Reset State
        App.localPut(Txn.sender(), trip_active_key, Int(0)),
        App.localPut(Txn.sender(), collateral_key, Int(0)),
        Return(Int(1))
    ])

    handle_noop = Cond(
        [Txn.application_args[0] == op_register_driver, register_driver],
        [Txn.application_args[0] == op_register_rider, register_rider],
        [Txn.application_args[0] == op_start_trip, start_trip],
        [Txn.application_args[0] == op_end_trip, end_trip],
        [Txn.application_args[0] == op_cancel_trip, cancel_trip]
    )

    return Cond(
        [Txn.application_id() == Int(0), handle_creation],
        [Txn.on_completion() == OnComplete.OptIn, handle_optin],
        [Txn.on_completion() == OnComplete.CloseOut, Approve()],
        [Txn.on_completion() == OnComplete.UpdateApplication, Return(Int(1))], # Allow updates for dev
        [Txn.on_completion() == OnComplete.DeleteApplication, Return(Int(1))], # Allow delete for dev
        [Txn.on_completion() == OnComplete.NoOp, handle_noop],
    )

def clear_state_program():
    return Return(Int(1))

if __name__ == "__main__":
    with open("commute_checkin.teal", "w") as f:
        compiled = compileTeal(approval_program(), mode=Mode.Application, version=6)
        f.write(compiled)
