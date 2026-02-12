---
phase: 2
plan: 2.3
wave: 1
---

# Plan 2.3: Verify Asset Lending Flow

## Objective
Verify the Asset Lending Smart Contract functionality on Algorand Testnet. This ensures that Lenders can list items and Borrowers can borrow them with optional collateral, and return them successfully.

## Context
- `.gsd/SPEC.md`
- `contracts/asset_escrow.teal`
- `scripts/deploy_asset_lending.cjs`

## Tasks

<task type="auto">
  <name>Create Verification Script</name>
  <files>scripts/test_asset_lending_flow.cjs</files>
  <action>
    Create a new script `scripts/test_asset_lending_flow.cjs` based on `deploy_asset_lending.cjs` and `full_test_cycle.cjs`.
    The script should:
    1. Deploy `asset_escrow.teal`.
    2. Opt-in User 1 (Lender) and User 2 (Borrower) - *Note: Might need 2 accounts, or simulate 1 account acting as both for simplicity if contract allows.*
    3. Lender "registers" an item (Local State update).
    4. Borrower "borrows" the item (Payment Transaction + App Call).
    5. Borrower "returns" the item (App Call).
    
    *Constraint*: If using 1 account is too complex for state logic, simplify to basic flow: Deploy -> Opt-In -> Set Local State (List) -> Set Local State (Borrow) -> Check State.
  </action>
  <verify>node scripts/test_asset_lending_flow.cjs --dry-run</verify>
  <done>Script exists and is valid syntax.</done>
</task>

<task type="auto">
  <name>Execute Verification</name>
  <files>scripts/test_asset_lending_flow.cjs</files>
  <action>
    Run the verification script on Testnet.
    Capture the App ID and transaction IDs.
  </action>
  <verify>node scripts/test_asset_lending_flow.cjs</verify>
  <done>Script completes with "ALL TESTS PASSED" or similar success message.</done>
</task>

<task type="checkpoint:human-verify">
  <name>Verify UI Flow (Browser)</name>
  <files>src/components/AssetArena.tsx</files>
  <action>
    1. Start the dev server: `npm run dev`
    2. Open the app in the browser: `http://localhost:5173` (or configured port).
    3. Navigate to "Asset Arena".
    4. Connect Wallet (Testnet).
    5. Test "Register Item" (Lender).
    6. Test "Borrow Item" (Borrower).
    7. Test "Return Item".
    
    *Note*: Ensure the UI updates correctly after each transaction (Local State reflection).
  </action>
  <verify>Manual check of UI states and toast notifications.</verify>
  <done>UI flows complete without errors and state updates appear correct.</done>
</task>

## Success Criteria
- [ ] Asset Lending contract deployed and method calls verified.
- [ ] `scripts/test_asset_lending_flow.cjs` exists for future regression testing.
- [ ] UI verification completed in browser.
