from pyteal import *

def approval_program():
    # Local State keys
    Bytes("trips")
    
    handle_creation = Return(Int(1))
    handle_optin = Return(Int(1))
    
    # Check-in
    # Arg[0] = "checkin"
    # Arg[1] = Lat (Bytes/String)
    # Arg[2] = Lng (Bytes/String)
    # Arg[3] = Timestamp
    
    checkin = Seq([
        # Increment trip count in Local State
        App.localPut(Txn.sender(), Bytes("trips"), App.localGet(Txn.sender(), Bytes("trips")) + Int(1)),
        App.localPut(Txn.sender(), Bytes("last_lat"), Txn.application_args[1]),
        App.localPut(Txn.sender(), Bytes("last_lng"), Txn.application_args[2]),
        Return(Int(1))
    ])
    
    handle_noop = Cond(
        [Txn.application_args[0] == Bytes("checkin"), checkin]
    )

    return Cond(
        [Txn.application_id() == Int(0), handle_creation],
        [Txn.on_completion() == OnComplete.OptIn, handle_optin],
        [Txn.on_completion() == OnComplete.NoOp, handle_noop],
    )

def clear_state_program():
    return Return(Int(1))

if __name__ == "__main__":
    with open("commute_checkin.teal", "w") as f:
        compiled = compileTeal(approval_program(), mode=Mode.Application, version=6)
        f.write(compiled)
