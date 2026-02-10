from pyteal import *

def approval_program():
    # Local State Keys
    trust_score_key = Bytes("Trust_Score")
    fitness_level_key = Bytes("Fitness_Level")
    eco_points_key = Bytes("Eco_Points")

    # Arguments
    op_optin = Bytes("opt_in")
    op_add_trust = Bytes("add_trust")
    op_slash_trust = Bytes("slash_trust")
    op_add_fitness = Bytes("add_fitness")
    op_add_eco = Bytes("add_eco")

    # Global State Keys (For Whitelisting Contracts - Demo Simplification: Admin Only)
    # Ideally we'd have a whitelist, but for now we'll check if sender is Creator or hardcoded placeholders
    # In a full deployment, we would have a method `authorize_contract(app_id)`
    
    # Initialization
    handle_creation = Return(Int(1))

    # Opt-In (Initialize Local State)
    handle_optin = Seq([
        App.localPut(Txn.sender(), trust_score_key, Int(0)),
        App.localPut(Txn.sender(), fitness_level_key, Int(0)),
        App.localPut(Txn.sender(), eco_points_key, Int(0)),
        Return(Int(1))
    ])

    # Dynamic Scoring Logic
    # Args: [method, address, amount]
    target_addr = Txn.application_args[1]
    amount = Btoi(Txn.application_args[2])

    # Helper to get current score, add amount, cap at 100
    current_trust = App.localGet(target_addr, trust_score_key)
    new_trust = If(current_trust + amount > Int(100), Int(100), current_trust + amount)
    
    # Helper to slash trust, floor at 0
    slashed_trust = If(current_trust < amount, Int(0), current_trust - amount)

    # Add Trust (Only callable by Lending Contract)
    # For DEMO: We will allow the Creator (Admin) to call this. 
    # In production, we'd check `Txn.sender() == Global.current_application_address()` of the calling contract (via inner txn)
    add_trust = Seq([
        # Authorize: Only Admin or Whitelisted Contracts
        Assert(Txn.sender() == Global.creator_address()), 
        
        App.localPut(target_addr, trust_score_key, new_trust),
        Return(Int(1))
    ])

    slash_trust = Seq([
        Assert(Txn.sender() == Global.creator_address()),
        App.localPut(target_addr, trust_score_key, slashed_trust),
        Return(Int(1))
    ])

    add_fitness = Seq([
        Assert(Txn.sender() == Global.creator_address()),
        App.localPut(target_addr, fitness_level_key, App.localGet(target_addr, fitness_level_key) + amount),
        Return(Int(1))
    ])

    add_eco = Seq([
        Assert(Txn.sender() == Global.creator_address()),
        App.localPut(target_addr, eco_points_key, App.localGet(target_addr, eco_points_key) + amount),
        Return(Int(1))
    ])

    handle_noop = Cond(
        [Txn.application_args[0] == op_add_trust, add_trust],
        [Txn.application_args[0] == op_slash_trust, slash_trust],
        [Txn.application_args[0] == op_add_fitness, add_fitness],
        [Txn.application_args[0] == op_add_eco, add_eco]
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
    with open("trust_score.teal", "w") as f:
        # Upgrade to Version 8
        compiled = compileTeal(approval_program(), mode=Mode.Application, version=8)
        f.write(compiled)
