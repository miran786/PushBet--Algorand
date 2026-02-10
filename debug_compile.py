from pyteal import *
from contracts.marketplace_contract import approval_program

try:
    print("Compiling...")
    compiled = compileTeal(approval_program(), mode=Mode.Application, version=8)
    print("Success!")
    print(compiled)
except Exception as e:
    print("Error:", e)
    import traceback
    traceback.print_exc()
