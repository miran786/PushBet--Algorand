from pyteal import *

def approval_program():
    # Constants
    # Box layout: [Seller (32 bytes)][Price (8 bytes)]
    BOX_SIZE = Int(32 + 8)

    # Operations
    op_list = Bytes("list")
    op_buy = Bytes("buy")
    op_delist = Bytes("delist")

    # Helper: Get Box Name (Asset ID as 8-byte uint64)
    def get_box_name(asset_id):
        return Itob(asset_id)

    # 1. List Item
    # Args: [list, asset_id, price]
    # Group: [AssetTransfer(Axfer) to App, AppCall]
    asset_id_arg = Btoi(Txn.application_args[1])
    price_arg = Btoi(Txn.application_args[2])
    box_name = get_box_name(asset_id_arg)

    list_item = Seq([
        # Verify Group Size
        Assert(Global.group_size() == Int(2)),
        
        # Verify Payment of Box MBR (Minimum Balance Requirement) handled by frontend/wallet 
        # (Sender must cover MBR in a separate txn or contract must have funds)
        # For this demo, we assume contract is funded or sender sends extra algo.
        # Strict mode: Check Gtxn[0] is Payment to App >= MBR.

        # Verify Asset Transfer
        Assert(Gtxn[0].type_enum() == TxnType.AssetTransfer),
        Assert(Gtxn[0].xfer_asset() == asset_id_arg),
        Assert(Gtxn[0].asset_receiver() == Global.current_application_address()),
        Assert(Gtxn[0].asset_amount() == Int(1)),
        Assert(Gtxn[0].sender() == Txn.sender()),

        # Check if Box exists (Prevent overwrite)
        Assert(App.box_length(box_name).hasValue() == Int(0)),

        # Create Box and Store [Seller, Price]
        App.box_put(box_name, Concat(Txn.sender(), Itob(price_arg))),
        
        Approve()
    ])

    # 2. Buy Item
    # Args: [buy, asset_id]
    # Group: [Payment to Seller, AppCall]
    buy_asset_id = Btoi(Txn.application_args[1])
    buy_box_name = get_box_name(buy_asset_id)
    
    # Read Box
    box_data = App.box_get(buy_box_name)
    seller_addr = Extract(box_data.value(), Int(0), Int(32))
    price_val = Btoi(Extract(box_data.value(), Int(32), Int(8)))

    buy_item = Seq([
        # Verify Box Exists
        Assert(box_data.hasValue()),

        # Verify Payment
        Assert(Global.group_size() == Int(2)),
        Assert(Gtxn[0].type_enum() == TxnType.Payment),
        Assert(Gtxn[0].receiver() == seller_addr),
        Assert(Gtxn[0].amount() == price_val),
        Assert(Gtxn[0].sender() == Txn.sender()),

        # Inner Transaction: Send Asset to Buyer
        InnerTxnBuilder.Begin(),
        InnerTxnBuilder.SetFields({
            TxnField.type_enum: TxnType.AssetTransfer,
            TxnField.xfer_asset: buy_asset_id,
            TxnField.asset_receiver: Txn.sender(),
            TxnField.asset_amount: Int(1),
            TxnField.fee: Int(0) # Inner fee covered by outer txn fee pooling
        }),
        InnerTxnBuilder.Submit(),

        # Delete Box (Free up MBR)
        # In production, MBR refund logic needed here
        App.box_delete(buy_box_name),
        
        Approve()
    ])

    # 3. Delist Item
    # Args: [delist, asset_id]
    delist_asset_id = Btoi(Txn.application_args[1])
    delist_box_name = get_box_name(delist_asset_id)
    
    delist_data = App.box_get(delist_box_name)
    delist_seller = Extract(delist_data.value(), Int(0), Int(32))

    delist_item = Seq([
        Assert(delist_data.hasValue()),
        
        # Only Original Seller can delist
        Assert(delist_seller == Txn.sender()),

        # Return Asset
        InnerTxnBuilder.Begin(),
        InnerTxnBuilder.SetFields({
            TxnField.type_enum: TxnType.AssetTransfer,
            TxnField.xfer_asset: delist_asset_id,
            TxnField.asset_receiver: Txn.sender(),
            TxnField.asset_amount: Int(1),
            TxnField.fee: Int(0)
        }),
        InnerTxnBuilder.Submit(),

        # Delete Box
        App.box_delete(delist_box_name),
        
        Approve()
    ])

    handle_noop = Cond(
        [Txn.application_args[0] == op_list, list_item],
        [Txn.application_args[0] == op_buy, buy_item],
        [Txn.application_args[0] == op_delist, delist_item]
    )

    return Cond(
        [Txn.application_id() == Int(0), Approve()],
        [Txn.on_completion() == OnComplete.NoOp, handle_noop],
        [Txn.on_completion() == OnComplete.OptIn, Approve()],
        [Txn.on_completion() == OnComplete.CloseOut, Approve()],
        [Txn.on_completion() == OnComplete.UpdateApplication, Approve()], # Admin only in prod
        [Txn.on_completion() == OnComplete.DeleteApplication, Approve()], # Admin only in prod
    )

def clear_state_program():
    return Approve()

if __name__ == "__main__":
    with open("marketplace_contract.teal", "w") as f:
        compiled = compileTeal(approval_program(), mode=Mode.Application, version=8) # Version 8 for Boxes
        f.write(compiled)
