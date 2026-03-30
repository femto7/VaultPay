// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import {VaultPayEscrow} from "../src/VaultPayEscrow.sol";

contract MockERC20 {
    string public name = "Mock USDC";
    string public symbol = "USDC";
    uint8 public decimals = 6;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    function mint(address to, uint256 amount) external {
        balanceOf[to] += amount;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        return true;
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        allowance[from][msg.sender] -= amount;
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        return true;
    }
}

contract VaultPayEscrowTest is Test {
    VaultPayEscrow public escrow;
    MockERC20 public usdc;

    address public owner = address(this);
    address public arbiter = makeAddr("arbiter");
    address public feeRecipient = makeAddr("feeRecipient");
    address public buyer = makeAddr("buyer");
    address public seller = makeAddr("seller");
    address public attacker = makeAddr("attacker");

    uint256 constant DEAL_AMOUNT = 1 ether;
    uint256 constant FEE_BPS = 50; // 0.5%

    function setUp() public {
        escrow = new VaultPayEscrow(arbiter, FEE_BPS, feeRecipient);
        usdc = new MockERC20();

        vm.deal(buyer, 100 ether);
        vm.deal(seller, 10 ether);
        vm.deal(attacker, 10 ether);
    }

    // ─── Helper ──────────────────────────────────────────────────────────
    function _createAndFundETHDeal() internal returns (uint256 dealId) {
        vm.prank(buyer);
        dealId = escrow.createDeal(seller, address(0), DEAL_AMOUNT, 7, "Test Deal", "A test deal");

        uint256 fee = (DEAL_AMOUNT * FEE_BPS) / 10000;
        vm.prank(buyer);
        escrow.fundDeal{value: DEAL_AMOUNT + fee}(dealId);
    }

    // ═══════════════════════════════════════════════════════════════════
    //  CREATION TESTS
    // ═══════════════════════════════════════════════════════════════════

    function test_CreateDeal() public {
        vm.prank(buyer);
        uint256 dealId = escrow.createDeal(seller, address(0), DEAL_AMOUNT, 7, "Logo Design", "Create a logo");

        VaultPayEscrow.Deal memory deal = escrow.getDeal(dealId);
        assertEq(deal.buyer, buyer);
        assertEq(deal.seller, seller);
        assertEq(deal.amount, DEAL_AMOUNT);
        assertEq(uint8(deal.status), uint8(VaultPayEscrow.DealStatus.Created));
        assertEq(deal.title, "Logo Design");
    }

    function test_RevertCreateDeal_SelfDeal() public {
        vm.prank(buyer);
        vm.expectRevert("Invalid seller");
        escrow.createDeal(buyer, address(0), DEAL_AMOUNT, 7, "Bad", "Self deal");
    }

    function test_RevertCreateDeal_ZeroAmount() public {
        vm.prank(buyer);
        vm.expectRevert("Amount must be > 0");
        escrow.createDeal(seller, address(0), 0, 7, "Bad", "Zero amount");
    }

    function test_RevertCreateDeal_TooShortDelivery() public {
        vm.prank(buyer);
        vm.expectRevert("Delivery too short");
        escrow.createDeal(seller, address(0), DEAL_AMOUNT, 0, "Bad", "No time");
    }

    // ═══════════════════════════════════════════════════════════════════
    //  FUNDING TESTS
    // ═══════════════════════════════════════════════════════════════════

    function test_FundDeal_ETH() public {
        vm.prank(buyer);
        uint256 dealId = escrow.createDeal(seller, address(0), DEAL_AMOUNT, 7, "Test", "Test");

        uint256 fee = (DEAL_AMOUNT * FEE_BPS) / 10000;
        uint256 balanceBefore = address(escrow).balance;

        vm.prank(buyer);
        escrow.fundDeal{value: DEAL_AMOUNT + fee}(dealId);

        assertEq(address(escrow).balance, balanceBefore + DEAL_AMOUNT + fee);
        VaultPayEscrow.Deal memory deal = escrow.getDeal(dealId);
        assertEq(uint8(deal.status), uint8(VaultPayEscrow.DealStatus.Funded));
    }

    function test_FundDeal_ERC20() public {
        uint256 amount = 1000e6; // 1000 USDC
        usdc.mint(buyer, 2000e6);

        vm.prank(buyer);
        uint256 dealId = escrow.createDeal(seller, address(usdc), amount, 7, "USDC Deal", "Test");

        uint256 fee = (amount * FEE_BPS) / 10000;
        vm.prank(buyer);
        usdc.approve(address(escrow), amount + fee);

        vm.prank(buyer);
        escrow.fundDeal(dealId);

        assertEq(usdc.balanceOf(address(escrow)), amount + fee);
    }

    function test_RevertFundDeal_NotBuyer() public {
        vm.prank(buyer);
        uint256 dealId = escrow.createDeal(seller, address(0), DEAL_AMOUNT, 7, "Test", "Test");

        uint256 fee = (DEAL_AMOUNT * FEE_BPS) / 10000;
        vm.prank(attacker);
        vm.expectRevert("Not buyer");
        escrow.fundDeal{value: DEAL_AMOUNT + fee}(dealId);
    }

    function test_RevertFundDeal_WrongAmount() public {
        vm.prank(buyer);
        uint256 dealId = escrow.createDeal(seller, address(0), DEAL_AMOUNT, 7, "Test", "Test");

        vm.prank(buyer);
        vm.expectRevert("Incorrect ETH amount");
        escrow.fundDeal{value: 0.5 ether}(dealId);
    }

    // ═══════════════════════════════════════════════════════════════════
    //  HAPPY PATH: CREATE → FUND → DELIVER → RELEASE
    // ═══════════════════════════════════════════════════════════════════

    function test_HappyPath_FullFlow() public {
        uint256 dealId = _createAndFundETHDeal();

        // Seller delivers
        vm.prank(seller);
        escrow.confirmDelivery(dealId);
        VaultPayEscrow.Deal memory deal = escrow.getDeal(dealId);
        assertEq(uint8(deal.status), uint8(VaultPayEscrow.DealStatus.Delivered));

        // Buyer releases
        uint256 sellerBalBefore = seller.balance;
        uint256 feeBalBefore = feeRecipient.balance;

        vm.prank(buyer);
        escrow.releaseFunds(dealId);

        deal = escrow.getDeal(dealId);
        assertEq(uint8(deal.status), uint8(VaultPayEscrow.DealStatus.Released));

        uint256 expectedFee = (DEAL_AMOUNT * FEE_BPS) / 10000;
        assertEq(seller.balance, sellerBalBefore + DEAL_AMOUNT - expectedFee);
        assertEq(feeRecipient.balance, feeBalBefore + expectedFee);
    }

    function test_AutoRelease_AfterDisputeWindow() public {
        uint256 dealId = _createAndFundETHDeal();

        vm.prank(seller);
        escrow.confirmDelivery(dealId);

        // Warp past dispute window
        vm.warp(block.timestamp + 3 days + 1);

        // Anyone can trigger auto-release
        uint256 sellerBalBefore = seller.balance;
        vm.prank(attacker); // Even non-party can trigger
        escrow.releaseFunds(dealId);

        assertGt(seller.balance, sellerBalBefore);
    }

    // ═══════════════════════════════════════════════════════════════════
    //  DISPUTE FLOW
    // ═══════════════════════════════════════════════════════════════════

    function test_Dispute_BuyerOpens() public {
        uint256 dealId = _createAndFundETHDeal();

        vm.prank(buyer);
        escrow.openDispute(dealId, "Never received the work", "ipfs://evidence123");

        VaultPayEscrow.Deal memory deal = escrow.getDeal(dealId);
        assertEq(uint8(deal.status), uint8(VaultPayEscrow.DealStatus.Disputed));

        VaultPayEscrow.Dispute memory dispute = escrow.getDispute(dealId);
        assertEq(dispute.opener, buyer);
        assertEq(dispute.reason, "Never received the work");
    }

    function test_Dispute_SellerOpens() public {
        uint256 dealId = _createAndFundETHDeal();

        vm.prank(seller);
        escrow.openDispute(dealId, "Buyer ghosting after delivery", "ipfs://proof456");

        VaultPayEscrow.Dispute memory dispute = escrow.getDispute(dealId);
        assertEq(dispute.opener, seller);
    }

    function test_Dispute_ResolvedFullSeller() public {
        uint256 dealId = _createAndFundETHDeal();

        vm.prank(buyer);
        escrow.openDispute(dealId, "Bad quality", "");

        uint256 sellerBalBefore = seller.balance;

        vm.prank(arbiter);
        escrow.resolveDispute(dealId, 100); // 100% to seller

        VaultPayEscrow.Deal memory deal = escrow.getDeal(dealId);
        assertEq(uint8(deal.status), uint8(VaultPayEscrow.DealStatus.Resolved));

        uint256 expectedFee = (DEAL_AMOUNT * FEE_BPS) / 10000;
        assertEq(seller.balance, sellerBalBefore + DEAL_AMOUNT - expectedFee);
    }

    function test_Dispute_ResolvedFullBuyer() public {
        uint256 dealId = _createAndFundETHDeal();

        vm.prank(buyer);
        escrow.openDispute(dealId, "Scam", "");

        uint256 buyerBalBefore = buyer.balance;

        vm.prank(arbiter);
        escrow.resolveDispute(dealId, 0); // 0% to seller = full refund

        // Buyer gets full amount + fee back
        uint256 expectedFee = (DEAL_AMOUNT * FEE_BPS) / 10000;
        assertEq(buyer.balance, buyerBalBefore + DEAL_AMOUNT + expectedFee);
    }

    function test_Dispute_Resolved5050Split() public {
        uint256 dealId = _createAndFundETHDeal();

        vm.prank(buyer);
        escrow.openDispute(dealId, "Partial delivery", "");

        uint256 sellerBalBefore = seller.balance;
        uint256 buyerBalBefore = buyer.balance;

        vm.prank(arbiter);
        escrow.resolveDispute(dealId, 50); // 50/50 split

        uint256 expectedSellerGross = DEAL_AMOUNT / 2;
        uint256 expectedFeeOnSeller = (expectedSellerGross * (DEAL_AMOUNT * FEE_BPS / 10000)) / DEAL_AMOUNT;
        uint256 expectedSellerNet = expectedSellerGross - expectedFeeOnSeller;

        assertEq(seller.balance, sellerBalBefore + expectedSellerNet);
        assertGt(buyer.balance, buyerBalBefore); // Buyer gets refund portion + unused fee
    }

    function test_RevertDispute_NotParty() public {
        uint256 dealId = _createAndFundETHDeal();

        vm.prank(attacker);
        vm.expectRevert("Not a party");
        escrow.openDispute(dealId, "I want the money", "");
    }

    function test_RevertResolve_NotArbiter() public {
        uint256 dealId = _createAndFundETHDeal();

        vm.prank(buyer);
        escrow.openDispute(dealId, "Issue", "");

        vm.prank(buyer);
        vm.expectRevert("Not arbiter");
        escrow.resolveDispute(dealId, 50);
    }

    function test_RevertDispute_AfterWindow() public {
        uint256 dealId = _createAndFundETHDeal();

        vm.prank(seller);
        escrow.confirmDelivery(dealId);

        // Warp past dispute window
        vm.warp(block.timestamp + 3 days + 1);

        vm.prank(buyer);
        vm.expectRevert("Dispute window closed");
        escrow.openDispute(dealId, "Too late", "");
    }

    // ═══════════════════════════════════════════════════════════════════
    //  TIMEOUT REFUND
    // ═══════════════════════════════════════════════════════════════════

    function test_Refund_Timeout() public {
        uint256 dealId = _createAndFundETHDeal();

        // Warp past delivery deadline (14 days)
        vm.warp(block.timestamp + 14 days + 1);

        uint256 buyerBalBefore = buyer.balance;
        uint256 expectedFee = (DEAL_AMOUNT * FEE_BPS) / 10000;

        vm.prank(buyer);
        escrow.claimRefund(dealId);

        VaultPayEscrow.Deal memory deal = escrow.getDeal(dealId);
        assertEq(uint8(deal.status), uint8(VaultPayEscrow.DealStatus.Refunded));
        assertEq(buyer.balance, buyerBalBefore + DEAL_AMOUNT + expectedFee);
    }

    function test_RevertRefund_TooEarly() public {
        uint256 dealId = _createAndFundETHDeal();

        vm.prank(buyer);
        vm.expectRevert("Deadline not reached");
        escrow.claimRefund(dealId);
    }

    function test_RevertRefund_NotBuyer() public {
        uint256 dealId = _createAndFundETHDeal();
        vm.warp(block.timestamp + 14 days + 1);

        vm.prank(attacker);
        vm.expectRevert("Not buyer");
        escrow.claimRefund(dealId);
    }

    // ═══════════════════════════════════════════════════════════════════
    //  CANCEL
    // ═══════════════════════════════════════════════════════════════════

    function test_CancelDeal() public {
        vm.prank(buyer);
        uint256 dealId = escrow.createDeal(seller, address(0), DEAL_AMOUNT, 7, "Test", "Test");

        vm.prank(buyer);
        escrow.cancelDeal(dealId);

        VaultPayEscrow.Deal memory deal = escrow.getDeal(dealId);
        assertEq(uint8(deal.status), uint8(VaultPayEscrow.DealStatus.Cancelled));
    }

    function test_RevertCancel_AlreadyFunded() public {
        uint256 dealId = _createAndFundETHDeal();

        vm.prank(buyer);
        vm.expectRevert("Can only cancel unfunded deals");
        escrow.cancelDeal(dealId);
    }

    // ═══════════════════════════════════════════════════════════════════
    //  ADMIN
    // ═══════════════════════════════════════════════════════════════════

    function test_SetArbiter() public {
        address newArbiter = makeAddr("newArbiter");
        escrow.setArbiter(newArbiter);
        assertEq(escrow.arbiter(), newArbiter);
    }

    function test_SetFee() public {
        escrow.setFee(100); // 1%
        assertEq(escrow.protocolFeeBps(), 100);
    }

    function test_RevertSetFee_TooHigh() public {
        vm.expectRevert("Fee too high");
        escrow.setFee(501);
    }
}
