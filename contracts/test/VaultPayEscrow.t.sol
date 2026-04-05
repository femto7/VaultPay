// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import {VaultPayEscrow} from "../src/VaultPayEscrow.sol";

// ─── Mock ERC20 ──────────────────────────────────────────────────────────────
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

// ─── Reentrancy Attacker ─────────────────────────────────────────────────────
// Simulates a malicious contract that tries to re-enter releaseFunds on ETH receipt.
// Uses try/catch so the outer call succeeds even if re-entry is blocked.
contract ReentrancyAttacker {
    VaultPayEscrow public escrow;
    uint256 public dealId;
    uint256 public attackAttempts;  // how many times receive() tried to re-enter
    bool public reentrancyBlocked;  // did the re-entry get caught?

    constructor(address _escrow) {
        escrow = VaultPayEscrow(_escrow);
    }

    function setDeal(uint256 _dealId) external {
        dealId = _dealId;
    }

    receive() external payable {
        if (attackAttempts < 3) {
            attackAttempts++;
            try escrow.releaseFunds(dealId) {
                // Re-entry succeeded — should NOT happen
            } catch {
                reentrancyBlocked = true;
            }
        }
    }
}

// ─── Main Test Suite ─────────────────────────────────────────────────────────
contract VaultPayEscrowTest is Test {
    using stdStorage for StdStorage;
    VaultPayEscrow public escrow;
    MockERC20 public usdc;

    address public owner       = address(this);
    address public feeRecipient = makeAddr("feeRecipient");
    address public buyer       = makeAddr("buyer");
    address public seller      = makeAddr("seller");
    address public attacker    = makeAddr("attacker");
    address public buyer2      = makeAddr("buyer2");
    address public seller2     = makeAddr("seller2");

    // Community reviewer pool — pool must be full (10) to open disputes
    address public reviewer1  = makeAddr("reviewer1");
    address public reviewer2  = makeAddr("reviewer2");
    address public reviewer3  = makeAddr("reviewer3");
    address public reviewer4  = makeAddr("reviewer4");
    address public reviewer5  = makeAddr("reviewer5");
    address public reviewer6  = makeAddr("reviewer6");
    address public reviewer7  = makeAddr("reviewer7");
    address public reviewer8  = makeAddr("reviewer8");
    address public reviewer9  = makeAddr("reviewer9");
    address public reviewer10 = makeAddr("reviewer10");

    uint256 constant DEAL_AMOUNT = 1 ether;
    uint256 constant FEE_BPS     = 50; // 0.5%

    function setUp() public {
        escrow = new VaultPayEscrow(feeRecipient, FEE_BPS);
        usdc   = new MockERC20();

        vm.deal(buyer,    100 ether);
        vm.deal(seller,    10 ether);
        vm.deal(buyer2,   100 ether);
        vm.deal(attacker,  10 ether);
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    /// @dev Seller (msg.sender) creates deal with buyer as _buyer param, then buyer funds.
    function _createAndFundETHDeal() internal returns (uint256 dealId) {
        vm.prank(seller);
        dealId = escrow.createDeal(buyer, address(0), DEAL_AMOUNT, 7, "Test Deal", "A test deal");
        uint256 fee = (DEAL_AMOUNT * FEE_BPS) / 10000;
        vm.prank(buyer);
        escrow.fundDeal{value: DEAL_AMOUNT + fee}(dealId);
    }

    function _createFundDeliverDeal() internal returns (uint256 dealId) {
        dealId = _createAndFundETHDeal();
        vm.prank(seller);
        escrow.confirmDelivery(dealId);
    }

    function _fundERC20Deal(uint256 amount) internal returns (uint256 dealId) {
        usdc.mint(buyer, amount * 2);
        vm.prank(seller);
        dealId = escrow.createDeal(buyer, address(usdc), amount, 7, "USDC Deal", "Test");
        uint256 fee = (amount * FEE_BPS) / 10000;
        vm.prank(buyer);
        usdc.approve(address(escrow), amount + fee);
        vm.prank(buyer);
        escrow.fundDeal(dealId);
    }

    /// @dev Fill the pool to exactly 10 reviewers (required to open any dispute).
    ///      Warps 7 days + 1 second after registration so reviewers are aged
    ///      relative to any deal created after this call.
    function _registerReviewers() internal {
        vm.prank(reviewer1);  escrow.registerAsReviewer();
        vm.prank(reviewer2);  escrow.registerAsReviewer();
        vm.prank(reviewer3);  escrow.registerAsReviewer();
        vm.prank(reviewer4);  escrow.registerAsReviewer();
        vm.prank(reviewer5);  escrow.registerAsReviewer();
        vm.prank(reviewer6);  escrow.registerAsReviewer();
        vm.prank(reviewer7);  escrow.registerAsReviewer();
        vm.prank(reviewer8);  escrow.registerAsReviewer();
        vm.prank(reviewer9);  escrow.registerAsReviewer();
        vm.prank(reviewer10); escrow.registerAsReviewer();
        vm.warp(block.timestamp + 7 days + 1); // satisfy MIN_REVIEWER_AGE vs deal.createdAt
    }

    /// @dev All 5 selected reviewers vote with the same value, warp past deadline, finalize.
    function _voteAllAndFinalize(uint256 dealId, uint8 vote) internal {
        (address[5] memory reviewers,,,,) = escrow.getDisputeVoting(dealId);
        for (uint256 i = 0; i < 5; i++) {
            vm.prank(reviewers[i]);
            escrow.submitVote(dealId, vote);
        }
        vm.warp(block.timestamp + 48 hours + 1);
        escrow.finalizeDispute(dealId);
    }

    // ═════════════════════════════════════════════════════════════════════════
    //  1. CREATION
    // ═════════════════════════════════════════════════════════════════════════

    function test_CreateDeal() public {
        vm.prank(seller);
        uint256 dealId = escrow.createDeal(buyer, address(0), DEAL_AMOUNT, 7, "Logo Design", "Create a logo");

        VaultPayEscrow.Deal memory deal = escrow.getDeal(dealId);
        assertEq(deal.buyer,  buyer);
        assertEq(deal.seller, seller);
        assertEq(deal.amount, DEAL_AMOUNT);
        assertEq(uint8(deal.status), uint8(VaultPayEscrow.DealStatus.Created));
        assertEq(deal.title,  "Logo Design");
    }

    function test_CreateDeal_IncrementsDealCount() public {
        vm.prank(seller);
        escrow.createDeal(buyer, address(0), DEAL_AMOUNT, 7, "Deal A", "");
        vm.prank(seller);
        escrow.createDeal(buyer, address(0), DEAL_AMOUNT, 7, "Deal B", "");
        assertEq(escrow.dealCount(), 2);
    }

    function test_CreateDeal_FeeCalculatedCorrectly() public {
        vm.prank(seller);
        uint256 dealId = escrow.createDeal(buyer, address(0), 1000 ether, 7, "Big Deal", "");
        VaultPayEscrow.Deal memory deal = escrow.getDeal(dealId);
        assertEq(deal.fee, 5 ether); // 0.5% of 1000 ETH = 5 ETH
    }

    function test_RevertCreateDeal_SelfDeal() public {
        vm.prank(seller);
        vm.expectRevert("Buyer cannot be seller");
        escrow.createDeal(seller, address(0), DEAL_AMOUNT, 7, "Bad", "Self deal");
    }

    function test_RevertCreateDeal_ZeroAmount() public {
        vm.prank(seller);
        vm.expectRevert("Amount must be > 0");
        escrow.createDeal(buyer, address(0), 0, 7, "Bad", "Zero amount");
    }

    function test_RevertCreateDeal_TooShortDelivery() public {
        vm.prank(seller);
        vm.expectRevert("Delivery too short");
        escrow.createDeal(buyer, address(0), DEAL_AMOUNT, 0, "Bad", "No time");
    }

    // ═════════════════════════════════════════════════════════════════════════
    //  2. FUNDING
    // ═════════════════════════════════════════════════════════════════════════

    function test_FundDeal_ETH() public {
        vm.prank(seller);
        uint256 dealId = escrow.createDeal(buyer, address(0), DEAL_AMOUNT, 7, "Test", "Test");
        uint256 fee = (DEAL_AMOUNT * FEE_BPS) / 10000;

        vm.prank(buyer);
        escrow.fundDeal{value: DEAL_AMOUNT + fee}(dealId);

        assertEq(address(escrow).balance, DEAL_AMOUNT + fee);
        VaultPayEscrow.Deal memory deal = escrow.getDeal(dealId);
        assertEq(uint8(deal.status), uint8(VaultPayEscrow.DealStatus.Funded));
        assertGt(deal.fundedAt, 0);
        assertGt(deal.deliveryDeadline, 0);
    }

    function test_FundDeal_ERC20() public {
        uint256 amount = 1000e6;
        uint256 dealId = _fundERC20Deal(amount);
        uint256 fee = (amount * FEE_BPS) / 10000;
        assertEq(usdc.balanceOf(address(escrow)), amount + fee);
        VaultPayEscrow.Deal memory deal = escrow.getDeal(dealId);
        assertEq(uint8(deal.status), uint8(VaultPayEscrow.DealStatus.Funded));
    }

    function test_RevertFundDeal_NotBuyer() public {
        vm.prank(seller);
        uint256 dealId = escrow.createDeal(buyer, address(0), DEAL_AMOUNT, 7, "Test", "Test");
        uint256 fee = (DEAL_AMOUNT * FEE_BPS) / 10000;

        vm.prank(attacker);
        vm.expectRevert("Not buyer");
        escrow.fundDeal{value: DEAL_AMOUNT + fee}(dealId);
    }

    function test_RevertFundDeal_WrongAmount() public {
        vm.prank(seller);
        uint256 dealId = escrow.createDeal(buyer, address(0), DEAL_AMOUNT, 7, "Test", "Test");

        vm.prank(buyer);
        vm.expectRevert("Incorrect ETH amount");
        escrow.fundDeal{value: 0.5 ether}(dealId);
    }

    function test_RevertFundDeal_AlreadyFunded() public {
        uint256 dealId = _createAndFundETHDeal();
        uint256 fee = (DEAL_AMOUNT * FEE_BPS) / 10000;

        vm.prank(buyer);
        vm.expectRevert("Deal not in Created state");
        escrow.fundDeal{value: DEAL_AMOUNT + fee}(dealId);
    }

    function test_RevertFundDeal_ETHSentForERC20Deal() public {
        uint256 amount = 1000e6;
        usdc.mint(buyer, amount * 2);
        vm.prank(seller);
        uint256 dealId = escrow.createDeal(buyer, address(usdc), amount, 7, "USDC Deal", "");

        vm.prank(buyer);
        vm.expectRevert("ETH not accepted for token deals");
        escrow.fundDeal{value: 1 ether}(dealId);
    }

    // ═════════════════════════════════════════════════════════════════════════
    //  3. HAPPY PATH
    // ═════════════════════════════════════════════════════════════════════════

    function test_HappyPath_FullFlow() public {
        uint256 dealId = _createAndFundETHDeal();

        vm.prank(seller);
        escrow.confirmDelivery(dealId);
        assertEq(uint8(escrow.getDeal(dealId).status), uint8(VaultPayEscrow.DealStatus.Delivered));

        uint256 sellerBalBefore = seller.balance;
        uint256 feeBalBefore    = feeRecipient.balance;

        vm.prank(buyer);
        escrow.releaseFunds(dealId);

        uint256 expectedFee = (DEAL_AMOUNT * FEE_BPS) / 10000;
        assertEq(uint8(escrow.getDeal(dealId).status), uint8(VaultPayEscrow.DealStatus.Released));
        assertEq(seller.balance,       sellerBalBefore + DEAL_AMOUNT);
        assertEq(feeRecipient.balance, feeBalBefore + expectedFee);
        assertEq(address(escrow).balance, 0);
    }

    function test_HappyPath_ERC20_FullFlow() public {
        uint256 amount = 1000e6;
        uint256 fee    = (amount * FEE_BPS) / 10000;
        uint256 dealId = _fundERC20Deal(amount);

        vm.prank(seller);
        escrow.confirmDelivery(dealId);

        uint256 sellerBefore = usdc.balanceOf(seller);
        vm.prank(buyer);
        escrow.releaseFunds(dealId);

        assertEq(usdc.balanceOf(seller),          sellerBefore + amount);
        assertEq(usdc.balanceOf(feeRecipient),    fee);
        assertEq(usdc.balanceOf(address(escrow)), 0);
    }

    function test_BuyerCanRelease_BeforeDelivery() public {
        uint256 dealId = _createAndFundETHDeal();
        uint256 sellerBalBefore = seller.balance;

        vm.prank(buyer);
        escrow.releaseFunds(dealId);

        assertGt(seller.balance, sellerBalBefore);
    }

    function test_AutoRelease_AfterDisputeWindow() public {
        uint256 dealId = _createFundDeliverDeal();
        vm.warp(block.timestamp + 3 days + 1);

        uint256 sellerBalBefore = seller.balance;
        vm.prank(attacker); // Anyone can trigger auto-release
        escrow.releaseFunds(dealId);

        assertGt(seller.balance, sellerBalBefore);
    }

    function test_RevertRelease_BeforeDisputeWindowByStranger() public {
        uint256 dealId = _createFundDeliverDeal();
        vm.prank(attacker);
        vm.expectRevert("Cannot release");
        escrow.releaseFunds(dealId);
    }

    function test_RevertRelease_AlreadyReleased() public {
        uint256 dealId = _createAndFundETHDeal();
        vm.prank(buyer);
        escrow.releaseFunds(dealId);

        vm.prank(buyer);
        vm.expectRevert("Cannot release");
        escrow.releaseFunds(dealId);
    }

    // ═════════════════════════════════════════════════════════════════════════
    //  4. DELIVERY
    // ═════════════════════════════════════════════════════════════════════════

    function test_RevertDelivery_NotSeller() public {
        uint256 dealId = _createAndFundETHDeal();
        vm.prank(buyer);
        vm.expectRevert("Not seller");
        escrow.confirmDelivery(dealId);
    }

    function test_RevertDelivery_NotFunded() public {
        vm.prank(seller);
        uint256 dealId = escrow.createDeal(buyer, address(0), DEAL_AMOUNT, 7, "Test", "");
        vm.prank(seller);
        vm.expectRevert("Deal not funded");
        escrow.confirmDelivery(dealId);
    }

    function test_RevertDelivery_AlreadyDelivered() public {
        uint256 dealId = _createFundDeliverDeal();
        vm.prank(seller);
        vm.expectRevert("Deal not funded");
        escrow.confirmDelivery(dealId);
    }

    function test_DisputeDeadlineSetOnDelivery() public {
        uint256 dealId = _createAndFundETHDeal();
        uint256 beforeDelivery = block.timestamp;
        vm.prank(seller);
        escrow.confirmDelivery(dealId);
        VaultPayEscrow.Deal memory deal = escrow.getDeal(dealId);
        assertEq(deal.disputeDeadline, beforeDelivery + 3 days);
    }

    // ═════════════════════════════════════════════════════════════════════════
    //  5. DISPUTES
    // ═════════════════════════════════════════════════════════════════════════

    function test_Dispute_BuyerOpens() public {
        _registerReviewers();
        uint256 dealId = _createAndFundETHDeal();
        vm.prank(buyer);
        escrow.openDispute(dealId, "Never received the work", "ipfs://evidence123");

        assertEq(uint8(escrow.getDeal(dealId).status), uint8(VaultPayEscrow.DealStatus.Disputed));
        VaultPayEscrow.Dispute memory d = escrow.getDispute(dealId);
        assertEq(d.opener, buyer);
        assertEq(d.reason, "Never received the work");
        assertFalse(d.resolved);
    }

    function test_Dispute_SellerOpens() public {
        _registerReviewers();
        uint256 dealId = _createAndFundETHDeal();
        vm.prank(seller);
        escrow.openDispute(dealId, "Buyer ghosting after delivery", "ipfs://proof456");
        assertEq(escrow.getDispute(dealId).opener, seller);
    }

    function test_Dispute_Panel_Selected() public {
        _registerReviewers();
        uint256 dealId = _createAndFundETHDeal();
        vm.prank(buyer);
        escrow.openDispute(dealId, "Issue", "");

        (address[5] memory reviewers,,, uint256 deadline, bool finalized) = escrow.getDisputeVoting(dealId);
        assertEq(deadline, block.timestamp + 48 hours);
        assertFalse(finalized);
        // All 5 selected reviewers must be from the pool
        for (uint256 i = 0; i < 5; i++) {
            assertTrue(escrow.isReviewer(reviewers[i]));
        }
    }

    function test_Dispute_ResolvedFullSeller() public {
        _registerReviewers();
        uint256 dealId = _createAndFundETHDeal();
        vm.prank(buyer);
        escrow.openDispute(dealId, "Bad quality", "");

        uint256 sellerBalBefore    = seller.balance;
        uint256 feeRecipientBefore = feeRecipient.balance;

        _voteAllAndFinalize(dealId, 100);

        assertEq(uint8(escrow.getDeal(dealId).status), uint8(VaultPayEscrow.DealStatus.Resolved));
        assertEq(seller.balance, sellerBalBefore + DEAL_AMOUNT);
        // Fee goes to voters, not feeRecipient, when voters participated
        assertEq(feeRecipient.balance, feeRecipientBefore);
        assertEq(address(escrow).balance, 0);
    }

    function test_Dispute_ResolvedFullBuyer() public {
        _registerReviewers();
        uint256 dealId = _createAndFundETHDeal();
        vm.prank(buyer);
        escrow.openDispute(dealId, "Scam", "");

        uint256 buyerBalBefore = buyer.balance;
        uint256 expectedFee    = (DEAL_AMOUNT * FEE_BPS) / 10000;

        _voteAllAndFinalize(dealId, 0);

        // result=0: sellerAmount=0, buyerRefund=DEAL_AMOUNT, feeToDistribute=0, feeReturn=fee
        assertEq(buyer.balance, buyerBalBefore + DEAL_AMOUNT + expectedFee);
        assertEq(address(escrow).balance, 0);
    }

    function test_Dispute_Resolved5050Split() public {
        _registerReviewers();
        uint256 dealId = _createAndFundETHDeal();
        vm.prank(buyer);
        escrow.openDispute(dealId, "Partial delivery", "");

        uint256 sellerBalBefore = seller.balance;
        uint256 buyerBalBefore  = buyer.balance;
        uint256 fee             = (DEAL_AMOUNT * FEE_BPS) / 10000;

        _voteAllAndFinalize(dealId, 50);

        assertEq(seller.balance, sellerBalBefore + DEAL_AMOUNT / 2);
        // buyer gets 50% amount + 50% fee returned
        assertEq(buyer.balance,  buyerBalBefore + DEAL_AMOUNT / 2 + fee / 2);
        assertEq(address(escrow).balance, 0);
    }

    function test_Dispute_MajorityWins_SellerGetsAll() public {
        // 3 votes for 100, 2 votes for 0 → seller wins
        _registerReviewers();
        uint256 dealId = _createAndFundETHDeal();
        vm.prank(buyer);
        escrow.openDispute(dealId, "Mostly delivered", "");

        (address[5] memory reviewers,,,,) = escrow.getDisputeVoting(dealId);
        vm.prank(reviewers[0]); escrow.submitVote(dealId, 100);
        vm.prank(reviewers[1]); escrow.submitVote(dealId, 100);
        vm.prank(reviewers[2]); escrow.submitVote(dealId, 100);
        vm.prank(reviewers[3]); escrow.submitVote(dealId, 0);
        vm.prank(reviewers[4]); escrow.submitVote(dealId, 0);

        vm.warp(block.timestamp + 48 hours + 1);
        escrow.finalizeDispute(dealId);

        assertEq(uint8(escrow.getDeal(dealId).status), uint8(VaultPayEscrow.DealStatus.Resolved));
        assertEq(escrow.getDispute(dealId).sellerPercent, 100);
    }

    function test_Dispute_Tie_FavoursSplit() public {
        // 2 votes 100, 2 votes 0, 1 vote 50 → 50 wins (ties resolved in favour of middle)
        _registerReviewers();
        uint256 dealId = _createAndFundETHDeal();
        vm.prank(buyer);
        escrow.openDispute(dealId, "Partial", "");

        (address[5] memory reviewers,,,,) = escrow.getDisputeVoting(dealId);
        vm.prank(reviewers[0]); escrow.submitVote(dealId, 100);
        vm.prank(reviewers[1]); escrow.submitVote(dealId, 100);
        vm.prank(reviewers[2]); escrow.submitVote(dealId, 0);
        vm.prank(reviewers[3]); escrow.submitVote(dealId, 0);
        vm.prank(reviewers[4]); escrow.submitVote(dealId, 50);

        vm.warp(block.timestamp + 48 hours + 1);
        escrow.finalizeDispute(dealId);

        assertEq(escrow.getDispute(dealId).sellerPercent, 50);
    }

    function test_Dispute_NoVotes_DefaultSplit50() public {
        _registerReviewers();
        uint256 dealId = _createAndFundETHDeal();
        vm.prank(buyer);
        escrow.openDispute(dealId, "Issue", "");

        uint256 sellerBalBefore = seller.balance;
        uint256 buyerBalBefore  = buyer.balance;
        uint256 fee             = (DEAL_AMOUNT * FEE_BPS) / 10000;

        // Nobody votes — warp and finalize
        vm.warp(block.timestamp + 48 hours + 1);
        escrow.finalizeDispute(dealId);

        // 50/50 split; fee goes to feeRecipient (no voters)
        assertEq(seller.balance,      sellerBalBefore + DEAL_AMOUNT / 2);
        assertEq(buyer.balance,       buyerBalBefore  + DEAL_AMOUNT / 2 + fee / 2);
        assertEq(feeRecipient.balance, fee / 2);
        assertEq(address(escrow).balance, 0);
    }

    function test_Dispute_FeeSharedAmongVoters() public {
        _registerReviewers();
        uint256 dealId = _createAndFundETHDeal();
        vm.prank(buyer);
        escrow.openDispute(dealId, "Issue", "");

        uint256 fee = (DEAL_AMOUNT * FEE_BPS) / 10000; // 0.005 ether

        (address[5] memory reviewers,,,,) = escrow.getDisputeVoting(dealId);
        uint256[5] memory balsBefore;
        for (uint256 i = 0; i < 5; i++) {
            balsBefore[i] = reviewers[i].balance;
            vm.prank(reviewers[i]);
            escrow.submitVote(dealId, 100); // all vote seller wins
        }
        vm.warp(block.timestamp + 48 hours + 1);
        escrow.finalizeDispute(dealId);

        uint256 perVoter  = fee / 5;
        uint256 remainder = fee - (perVoter * 5);
        for (uint256 i = 0; i < 5; i++) {
            uint256 expected = perVoter + (i == 4 ? remainder : 0);
            assertEq(reviewers[i].balance, balsBefore[i] + expected);
        }
        assertEq(address(escrow).balance, 0);
    }

    function test_RevertDispute_NotParty() public {
        uint256 dealId = _createAndFundETHDeal();
        vm.prank(attacker);
        vm.expectRevert("Not a party");
        escrow.openDispute(dealId, "I want the money", "");
    }

    function test_RevertDispute_AlreadyDisputed() public {
        _registerReviewers();
        uint256 dealId = _createAndFundETHDeal();
        vm.prank(buyer);
        escrow.openDispute(dealId, "Issue", "");

        vm.prank(seller);
        vm.expectRevert("Cannot dispute");
        escrow.openDispute(dealId, "Double dispute", "");
    }

    function test_RevertDispute_AfterWindow() public {
        uint256 dealId = _createFundDeliverDeal();
        vm.warp(block.timestamp + 3 days + 1);

        vm.prank(buyer);
        vm.expectRevert("Dispute window closed");
        escrow.openDispute(dealId, "Too late", "");
    }

    function test_RevertDispute_OnReleasedDeal() public {
        uint256 dealId = _createAndFundETHDeal();
        vm.prank(buyer);
        escrow.releaseFunds(dealId);

        vm.prank(buyer);
        vm.expectRevert("Cannot dispute");
        escrow.openDispute(dealId, "Changed my mind", "");
    }

    function test_RevertDispute_PoolNotFull() public {
        uint256 dealId = _createAndFundETHDeal();
        // Only 9 reviewers — pool must be exactly 10
        vm.prank(reviewer1);  escrow.registerAsReviewer();
        vm.prank(reviewer2);  escrow.registerAsReviewer();
        vm.prank(reviewer3);  escrow.registerAsReviewer();
        vm.prank(reviewer4);  escrow.registerAsReviewer();
        vm.prank(reviewer5);  escrow.registerAsReviewer();
        vm.prank(reviewer6);  escrow.registerAsReviewer();
        vm.prank(reviewer7);  escrow.registerAsReviewer();
        vm.prank(reviewer8);  escrow.registerAsReviewer();
        vm.prank(reviewer9);  escrow.registerAsReviewer();

        vm.prank(buyer);
        vm.expectRevert("Reviewer pool must be full");
        escrow.openDispute(dealId, "Issue", "");
    }

    function test_RevertRegister_BuyerCannotBeReviewer() public {
        // buyer has funded a deal → hasBeenParty = true → cannot register
        _createAndFundETHDeal();
        vm.prank(buyer);
        vm.expectRevert("Deal parties cannot be reviewers");
        escrow.registerAsReviewer();
    }

    function test_RevertRegister_SellerCannotBeReviewer() public {
        // seller has created a deal → hasBeenParty = true → cannot register
        vm.prank(seller);
        escrow.createDeal(buyer, address(0), DEAL_AMOUNT, 7, "Test", "");
        vm.prank(seller);
        vm.expectRevert("Deal parties cannot be reviewers");
        escrow.registerAsReviewer();
    }

    function test_ReviewerEjectedWhenBecomesSeller() public {
        // reviewer1 joins the pool, then creates a deal → auto-ejected
        vm.prank(reviewer1); escrow.registerAsReviewer();
        assertTrue(escrow.isReviewer(reviewer1));

        vm.prank(reviewer1);
        escrow.createDeal(buyer, address(0), DEAL_AMOUNT, 7, "Deal", "");

        assertFalse(escrow.isReviewer(reviewer1));
        assertTrue(escrow.hasBeenParty(reviewer1));
    }

    function test_ReviewerEjectedWhenBecomesBuyer() public {
        // reviewer1 joins the pool, then funds a deal → auto-ejected
        vm.prank(reviewer1); escrow.registerAsReviewer();
        assertTrue(escrow.isReviewer(reviewer1));

        vm.prank(seller);
        uint256 dealId = escrow.createDeal(reviewer1, address(0), DEAL_AMOUNT, 7, "Deal", "");
        uint256 fee = (DEAL_AMOUNT * FEE_BPS) / 10000;
        vm.deal(reviewer1, 10 ether);
        vm.prank(reviewer1);
        escrow.fundDeal{value: DEAL_AMOUNT + fee}(dealId);

        assertFalse(escrow.isReviewer(reviewer1));
        assertTrue(escrow.hasBeenParty(reviewer1));
    }

    function test_RevertSubmitVote_NotReviewer() public {
        _registerReviewers();
        uint256 dealId = _createAndFundETHDeal();
        vm.prank(buyer);
        escrow.openDispute(dealId, "Issue", "");

        vm.prank(attacker);
        vm.expectRevert("Not a reviewer for this deal");
        escrow.submitVote(dealId, 50);
    }

    function test_RevertSubmitVote_InvalidVote() public {
        _registerReviewers();
        uint256 dealId = _createAndFundETHDeal();
        vm.prank(buyer);
        escrow.openDispute(dealId, "Issue", "");

        (address[5] memory reviewers,,,,) = escrow.getDisputeVoting(dealId);
        vm.prank(reviewers[0]);
        vm.expectRevert("Vote must be 0, 50, or 100");
        escrow.submitVote(dealId, 80);
    }

    function test_RevertSubmitVote_AfterDeadline() public {
        _registerReviewers();
        uint256 dealId = _createAndFundETHDeal();
        vm.prank(buyer);
        escrow.openDispute(dealId, "Issue", "");

        vm.warp(block.timestamp + 48 hours + 1);

        (address[5] memory reviewers,,,,) = escrow.getDisputeVoting(dealId);
        vm.prank(reviewers[0]);
        vm.expectRevert("Voting deadline passed");
        escrow.submitVote(dealId, 50);
    }

    function test_RevertSubmitVote_AlreadyVoted() public {
        _registerReviewers();
        uint256 dealId = _createAndFundETHDeal();
        vm.prank(buyer);
        escrow.openDispute(dealId, "Issue", "");

        (address[5] memory reviewers,,,,) = escrow.getDisputeVoting(dealId);
        vm.prank(reviewers[0]);
        escrow.submitVote(dealId, 50);

        vm.prank(reviewers[0]);
        vm.expectRevert("Already voted");
        escrow.submitVote(dealId, 100);
    }

    function test_RevertFinalizeDispute_VotingOngoing() public {
        _registerReviewers();
        uint256 dealId = _createAndFundETHDeal();
        vm.prank(buyer);
        escrow.openDispute(dealId, "Issue", "");

        vm.expectRevert("Voting still ongoing");
        escrow.finalizeDispute(dealId);
    }

    function test_RevertFinalizeDispute_AfterResolution() public {
        _registerReviewers();
        uint256 dealId = _createAndFundETHDeal();
        vm.prank(buyer);
        escrow.openDispute(dealId, "Issue", "");

        vm.warp(block.timestamp + 48 hours + 1);
        escrow.finalizeDispute(dealId); // first finalize succeeds

        // Second call: status is now Resolved, not Disputed
        vm.expectRevert("Deal not disputed");
        escrow.finalizeDispute(dealId);
    }

    // ═════════════════════════════════════════════════════════════════════════
    //  5b. REVIEWER POOL
    // ═════════════════════════════════════════════════════════════════════════

    function test_RegisterReviewer() public {
        vm.prank(reviewer1);
        escrow.registerAsReviewer();

        assertTrue(escrow.isReviewer(reviewer1));
        address[] memory pool = escrow.getReviewerPool();
        assertEq(pool.length, 1);
        assertEq(pool[0], reviewer1);
    }

    function test_RemoveFromPool() public {
        vm.prank(reviewer1); escrow.registerAsReviewer();
        vm.prank(reviewer2); escrow.registerAsReviewer();

        vm.prank(reviewer1);
        escrow.removeFromPool();

        assertFalse(escrow.isReviewer(reviewer1));
        address[] memory pool = escrow.getReviewerPool();
        assertEq(pool.length, 1);
        assertEq(pool[0], reviewer2);
    }

    function test_RevertRegister_AlreadyReviewer() public {
        vm.prank(reviewer1); escrow.registerAsReviewer();
        vm.prank(reviewer1);
        vm.expectRevert("Already a reviewer");
        escrow.registerAsReviewer();
    }

    function test_RevertRegister_PoolFull() public {
        // Fill pool to max (10)
        for (uint256 i = 0; i < 10; i++) {
            address r = address(uint160(0x1000 + i));
            vm.prank(r);
            escrow.registerAsReviewer();
        }
        address extra = address(uint160(0x1010));
        vm.prank(extra);
        vm.expectRevert("Reviewer pool full");
        escrow.registerAsReviewer();
    }

    function test_RevertRemove_NotReviewer() public {
        vm.prank(attacker);
        vm.expectRevert("Not a reviewer");
        escrow.removeFromPool();
    }

    // ═════════════════════════════════════════════════════════════════════════
    //  6. TIMEOUT REFUND
    // ═════════════════════════════════════════════════════════════════════════

    function test_Refund_Timeout() public {
        uint256 dealId = _createAndFundETHDeal();
        vm.warp(block.timestamp + 14 days + 1);

        uint256 buyerBalBefore = buyer.balance;
        uint256 expectedFee    = (DEAL_AMOUNT * FEE_BPS) / 10000;

        vm.prank(buyer);
        escrow.claimRefund(dealId);

        assertEq(uint8(escrow.getDeal(dealId).status), uint8(VaultPayEscrow.DealStatus.Refunded));
        assertEq(buyer.balance, buyerBalBefore + DEAL_AMOUNT + expectedFee);
        assertEq(address(escrow).balance, 0);
    }

    function test_Refund_ERC20_Timeout() public {
        uint256 amount = 1000e6;
        uint256 fee    = (amount * FEE_BPS) / 10000;
        uint256 dealId = _fundERC20Deal(amount);
        vm.warp(block.timestamp + 14 days + 1);

        uint256 buyerBalBefore = usdc.balanceOf(buyer);
        vm.prank(buyer);
        escrow.claimRefund(dealId);

        assertEq(usdc.balanceOf(buyer), buyerBalBefore + amount + fee);
        assertEq(usdc.balanceOf(address(escrow)), 0);
    }

    function test_RevertRefund_TooEarly() public {
        uint256 dealId = _createAndFundETHDeal();
        vm.prank(buyer);
        vm.expectRevert("Deadline not reached");
        escrow.claimRefund(dealId);
    }

    function test_RevertRefund_ExactlyAtDeadline() public {
        uint256 dealId = _createAndFundETHDeal();
        VaultPayEscrow.Deal memory deal = escrow.getDeal(dealId);
        vm.warp(deal.deliveryDeadline);

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

    function test_RevertRefund_AfterDelivery() public {
        uint256 dealId = _createFundDeliverDeal();
        vm.warp(block.timestamp + 14 days + 1);

        vm.prank(buyer);
        vm.expectRevert("Not in funded state");
        escrow.claimRefund(dealId);
    }

    function test_RevertRefund_AlreadyRefunded() public {
        uint256 dealId = _createAndFundETHDeal();
        vm.warp(block.timestamp + 14 days + 1);
        vm.prank(buyer);
        escrow.claimRefund(dealId);

        vm.prank(buyer);
        vm.expectRevert("Not in funded state");
        escrow.claimRefund(dealId);
    }

    // ═════════════════════════════════════════════════════════════════════════
    //  7. CANCEL
    // ═════════════════════════════════════════════════════════════════════════

    function test_CancelDeal() public {
        vm.prank(seller);
        uint256 dealId = escrow.createDeal(buyer, address(0), DEAL_AMOUNT, 7, "Test", "Test");

        vm.prank(seller);
        escrow.cancelDeal(dealId);

        assertEq(uint8(escrow.getDeal(dealId).status), uint8(VaultPayEscrow.DealStatus.Cancelled));
    }

    function test_RevertCancel_AlreadyFunded() public {
        uint256 dealId = _createAndFundETHDeal();
        vm.prank(seller);
        vm.expectRevert("Can only cancel unfunded deals");
        escrow.cancelDeal(dealId);
    }

    function test_RevertCancel_NotSeller() public {
        vm.prank(seller);
        uint256 dealId = escrow.createDeal(buyer, address(0), DEAL_AMOUNT, 7, "Test", "");

        vm.prank(attacker);
        vm.expectRevert("Not seller");
        escrow.cancelDeal(dealId);
    }

    // ═════════════════════════════════════════════════════════════════════════
    //  8. ADMIN
    // ═════════════════════════════════════════════════════════════════════════

    function test_SetFee() public {
        escrow.setFee(100);
        assertEq(escrow.protocolFeeBps(), 100);
    }

    function test_SetFee_ToZero() public {
        escrow.setFee(0);
        assertEq(escrow.protocolFeeBps(), 0);
    }

    function test_RevertSetFee_TooHigh() public {
        vm.expectRevert("Fee too high");
        escrow.setFee(501);
    }

    function test_SetFeeRecipient() public {
        address newRecipient = makeAddr("newRecipient");
        escrow.setFeeRecipient(newRecipient);
        assertEq(escrow.feeRecipient(), newRecipient);
    }

    function test_RevertSetFeeRecipient_ZeroAddress() public {
        vm.expectRevert("Invalid recipient");
        escrow.setFeeRecipient(address(0));
    }

    function test_RevertSetFeeRecipient_NotOwner() public {
        vm.prank(attacker);
        vm.expectRevert("Not owner");
        escrow.setFeeRecipient(makeAddr("x"));
    }

    // ═════════════════════════════════════════════════════════════════════════
    //  9. CONSTRUCTOR VALIDATION
    // ═════════════════════════════════════════════════════════════════════════

    function test_RevertConstructor_ZeroFeeRecipient() public {
        vm.expectRevert("Invalid fee recipient");
        new VaultPayEscrow(address(0), FEE_BPS);
    }

    function test_RevertConstructor_FeeTooHigh() public {
        vm.expectRevert("Fee too high");
        new VaultPayEscrow(feeRecipient, 501);
    }

    // ═════════════════════════════════════════════════════════════════════════
    //  10. EDGE CASES — MATH & FEE
    // ═════════════════════════════════════════════════════════════════════════

    function test_ZeroFee_FullAmountToSeller() public {
        VaultPayEscrow zeroFeeEscrow = new VaultPayEscrow(feeRecipient, 0);
        vm.prank(seller);
        uint256 dealId = zeroFeeEscrow.createDeal(buyer, address(0), DEAL_AMOUNT, 7, "Free", "");
        vm.prank(buyer);
        zeroFeeEscrow.fundDeal{value: DEAL_AMOUNT}(dealId);
        vm.prank(seller);
        zeroFeeEscrow.confirmDelivery(dealId);

        uint256 sellerBalBefore = seller.balance;
        vm.prank(buyer);
        zeroFeeEscrow.releaseFunds(dealId);

        assertEq(seller.balance, sellerBalBefore + DEAL_AMOUNT);
        assertEq(feeRecipient.balance, 0);
    }

    function test_MaxFee_5Percent() public {
        VaultPayEscrow maxFeeEscrow = new VaultPayEscrow(feeRecipient, 500);
        vm.prank(seller);
        uint256 dealId = maxFeeEscrow.createDeal(buyer, address(0), 100 ether, 7, "Big", "");
        uint256 fee = 5 ether;
        vm.deal(buyer, 200 ether);
        vm.prank(buyer);
        maxFeeEscrow.fundDeal{value: 105 ether}(dealId);

        VaultPayEscrow.Deal memory deal = maxFeeEscrow.getDeal(dealId);
        assertEq(deal.fee, fee);
    }

    function test_VerySmallAmount_1Wei() public {
        vm.prank(seller);
        uint256 dealId = escrow.createDeal(buyer, address(0), 1, 7, "Tiny", "");
        vm.prank(buyer);
        escrow.fundDeal{value: 1}(dealId);
        VaultPayEscrow.Deal memory deal = escrow.getDeal(dealId);
        assertEq(uint8(deal.status), uint8(VaultPayEscrow.DealStatus.Funded));
    }

    function test_NoFundsLeftInContract_AfterAllSettlements() public {
        uint256 fee = (DEAL_AMOUNT * FEE_BPS) / 10000;

        // Register reviewers first and warp 7 days so they are aged for any deal created after
        _registerReviewers();

        // Deal 1: normal release
        vm.prank(seller);
        uint256 d1 = escrow.createDeal(buyer, address(0), DEAL_AMOUNT, 7, "D1", "");
        vm.prank(buyer);
        escrow.fundDeal{value: DEAL_AMOUNT + fee}(d1);

        // Deal 2: community dispute resolved 50/50
        vm.prank(seller2);
        uint256 d2 = escrow.createDeal(buyer2, address(0), DEAL_AMOUNT, 7, "D2", "");
        vm.prank(buyer2);
        escrow.fundDeal{value: DEAL_AMOUNT + fee}(d2);

        // Deal 3: timeout refund
        vm.prank(seller);
        uint256 d3 = escrow.createDeal(buyer, address(0), DEAL_AMOUNT, 7, "D3", "");
        vm.prank(buyer);
        escrow.fundDeal{value: DEAL_AMOUNT + fee}(d3);

        // Settle d1
        vm.prank(buyer);
        escrow.releaseFunds(d1);

        // Settle d2 via community vote
        vm.prank(buyer2);
        escrow.openDispute(d2, "Partial", "");
        _voteAllAndFinalize(d2, 50);

        // Settle d3: warp past d3's delivery deadline
        vm.warp(block.timestamp + 14 days + 1);
        vm.prank(buyer);
        escrow.claimRefund(d3);

        assertEq(address(escrow).balance, 0);
    }

    // ═════════════════════════════════════════════════════════════════════════
    //  11. SECURITY — REENTRANCY
    // ═════════════════════════════════════════════════════════════════════════

    function test_ReentrancyGuard_OnRelease() public {
        ReentrancyAttacker maliciousSeller = new ReentrancyAttacker(address(escrow));

        // maliciousSeller is msg.sender → deal.seller; buyer is deal.buyer
        vm.prank(address(maliciousSeller));
        uint256 dealId = escrow.createDeal(buyer, address(0), DEAL_AMOUNT, 7, "Trap", "");
        maliciousSeller.setDeal(dealId);

        uint256 fee = (DEAL_AMOUNT * FEE_BPS) / 10000;
        vm.prank(buyer);
        escrow.fundDeal{value: DEAL_AMOUNT + fee}(dealId);

        vm.prank(buyer);
        escrow.releaseFunds(dealId);

        // Re-entry was attempted but blocked by ReentrancyGuard
        assertEq(maliciousSeller.attackAttempts(), 1);
        assertTrue(maliciousSeller.reentrancyBlocked());
        assertEq(address(escrow).balance, 0);
    }

    function test_ReentrancyGuard_OnRefund() public {
        ReentrancyAttacker maliciousBuyer = new ReentrancyAttacker(address(escrow));
        vm.deal(address(maliciousBuyer), 100 ether);

        // seller creates deal with maliciousBuyer as the buyer
        vm.prank(seller);
        uint256 dealId = escrow.createDeal(address(maliciousBuyer), address(0), DEAL_AMOUNT, 7, "Trap2", "");
        maliciousBuyer.setDeal(dealId);

        uint256 fee = (DEAL_AMOUNT * FEE_BPS) / 10000;
        vm.prank(address(maliciousBuyer));
        escrow.fundDeal{value: DEAL_AMOUNT + fee}(dealId);

        vm.warp(block.timestamp + 14 days + 1);
        vm.prank(address(maliciousBuyer));
        escrow.claimRefund(dealId);

        // Re-entry was attempted but blocked by ReentrancyGuard
        assertEq(maliciousBuyer.attackAttempts(), 1);
        assertTrue(maliciousBuyer.reentrancyBlocked());
        assertEq(address(escrow).balance, 0);
    }

    // ═════════════════════════════════════════════════════════════════════════
    //  12. MULTIPLE CONCURRENT DEALS
    // ═════════════════════════════════════════════════════════════════════════

    function test_MultipleConcurrentDeals_IndependentState() public {
        _registerReviewers();
        uint256 dealA = _createAndFundETHDeal();

        uint256 fee = (DEAL_AMOUNT * FEE_BPS) / 10000;
        vm.prank(seller);
        uint256 dealB = escrow.createDeal(buyer, address(0), DEAL_AMOUNT, 7, "Deal B", "");
        vm.prank(buyer);
        escrow.fundDeal{value: DEAL_AMOUNT + fee}(dealB);

        // Dispute A, release B independently
        vm.prank(buyer);
        escrow.openDispute(dealA, "Issue with A", "");

        vm.prank(buyer);
        escrow.releaseFunds(dealB);

        assertEq(uint8(escrow.getDeal(dealA).status), uint8(VaultPayEscrow.DealStatus.Disputed));
        assertEq(uint8(escrow.getDeal(dealB).status), uint8(VaultPayEscrow.DealStatus.Released));
    }

    function test_MultipleBuyers_MultipleSellers() public {
        uint256 fee = (DEAL_AMOUNT * FEE_BPS) / 10000;

        vm.prank(seller);
        uint256 d1 = escrow.createDeal(buyer, address(0), DEAL_AMOUNT, 7, "D1", "");
        vm.prank(buyer);
        escrow.fundDeal{value: DEAL_AMOUNT + fee}(d1);

        vm.prank(seller2);
        uint256 d2 = escrow.createDeal(buyer2, address(0), DEAL_AMOUNT, 7, "D2", "");
        vm.prank(buyer2);
        escrow.fundDeal{value: DEAL_AMOUNT + fee}(d2);

        // buyer2 cannot release deal d1
        vm.prank(buyer2);
        vm.expectRevert("Cannot release");
        escrow.releaseFunds(d1);
    }

    // ═════════════════════════════════════════════════════════════════════════
    //  13. EVENTS
    // ═════════════════════════════════════════════════════════════════════════

    function test_Event_DealCreated() public {
        vm.prank(seller);
        vm.expectEmit(true, true, true, true);
        emit VaultPayEscrow.DealCreated(0, buyer, seller, DEAL_AMOUNT);
        escrow.createDeal(buyer, address(0), DEAL_AMOUNT, 7, "Test", "");
    }

    function test_Event_DealFunded() public {
        vm.prank(seller);
        escrow.createDeal(buyer, address(0), DEAL_AMOUNT, 7, "Test", "");
        uint256 fee = (DEAL_AMOUNT * FEE_BPS) / 10000;

        vm.prank(buyer);
        vm.expectEmit(true, false, false, true);
        emit VaultPayEscrow.DealFunded(0, DEAL_AMOUNT + fee);
        escrow.fundDeal{value: DEAL_AMOUNT + fee}(0);
    }

    function test_Event_DisputeOpened() public {
        _registerReviewers();
        uint256 dealId = _createAndFundETHDeal();

        vm.prank(buyer);
        vm.expectEmit(true, true, false, true);
        emit VaultPayEscrow.DisputeOpened(dealId, buyer, "Issue");
        escrow.openDispute(dealId, "Issue", "");
    }

    function test_Event_DealRefunded() public {
        uint256 dealId = _createAndFundETHDeal();
        vm.warp(block.timestamp + 14 days + 1);
        uint256 fee = (DEAL_AMOUNT * FEE_BPS) / 10000;

        vm.prank(buyer);
        vm.expectEmit(true, false, false, true);
        emit VaultPayEscrow.DealRefunded(dealId, DEAL_AMOUNT + fee);
        escrow.claimRefund(dealId);
    }

    // ═════════════════════════════════════════════════════════════════════════
    //  14. REVIEWER DISPUTE CYCLE — AUTO-EJECT AFTER 10 SELECTIONS
    // ═════════════════════════════════════════════════════════════════════════

    /// @dev Open a dispute, have all 5 reviewers vote, finalize. Returns the panel.
    function _runFullDispute(address _buyer, address _seller, uint8 vote)
        internal returns (address[5] memory panel)
    {
        uint256 fee = (DEAL_AMOUNT * FEE_BPS) / 10000;
        vm.prank(_seller);
        uint256 dealId = escrow.createDeal(_buyer, address(0), DEAL_AMOUNT, 7, "D", "");
        vm.prank(_buyer);
        escrow.fundDeal{value: DEAL_AMOUNT + fee}(dealId);

        vm.prank(_buyer);
        escrow.openDispute(dealId, "issue", "");

        (panel,,,,) = escrow.getDisputeVoting(dealId);
        for (uint256 i = 0; i < 5; i++) {
            vm.prank(panel[i]);
            escrow.submitVote(dealId, vote);
        }
        vm.warp(block.timestamp + 48 hours + 1);
        escrow.finalizeDispute(dealId);
    }

    function test_ReviewerDisputeCount_IncrementsOnSelection() public {
        _registerReviewers();
        uint256 dealId = _createAndFundETHDeal();
        vm.prank(buyer);
        escrow.openDispute(dealId, "issue", "");

        (address[5] memory panel,,,,) = escrow.getDisputeVoting(dealId);
        for (uint256 i = 0; i < 5; i++) {
            assertEq(escrow.reviewerDisputeCount(panel[i]), 1);
        }
    }

    function test_ReviewerDisputeCount_ResetsOnVoluntaryReRegister() public {
        _registerReviewers(); // pool = 10, generation = 1

        address[1] memory buyerArr  = [address(uint160(0xBB01))];
        address[1] memory sellerArr = [address(uint160(0xAA01))];
        vm.deal(buyerArr[0], 10 ether); vm.deal(sellerArr[0], 1 ether);

        address[5] memory panel = _runFullDispute(buyerArr[0], sellerArr[0], 100);

        // Voluntary leave → ejectedAtGeneration NOT set → can re-register freely
        address r = panel[0];
        vm.prank(r); escrow.removeFromPool();
        assertFalse(escrow.isReviewer(r));
        assertEq(escrow.ejectedAtGeneration(r), 0); // not auto-ejected

        vm.prank(r); escrow.registerAsReviewer();
        assertEq(escrow.reviewerDisputeCount(r), 0);
        assertTrue(escrow.isReviewer(r));
    }

    /// @dev Set reviewerDisputeCount to 9 for all 10 reviewers using stdstore,
    ///      then run one dispute — all 5 selected will hit 10 and be auto-ejected.
    function _presetCountsTo9() internal {
        address[10] memory rs = [reviewer1, reviewer2, reviewer3, reviewer4, reviewer5,
                                  reviewer6, reviewer7, reviewer8, reviewer9, reviewer10];
        for (uint256 i = 0; i < 10; i++) {
            stdstore.target(address(escrow))
                .sig("reviewerDisputeCount(address)")
                .with_key(rs[i])
                .checked_write(uint256(9));
        }
    }

    function test_ReviewerAutoEjected_After10Disputes() public {
        _registerReviewers(); // generation = 1

        _presetCountsTo9(); // all reviewers at count = 9

        // One more dispute → 5 selected → all hit 10 → ejected
        address b = address(uint160(0xB001)); address s = address(uint160(0xA001));
        vm.deal(b, 10 ether); vm.deal(s, 1 ether);
        _runFullDispute(b, s, 100);

        // All 5 selected reviewers ejected; rest still in pool
        uint256 remaining = escrow.getReviewerPool().length;
        assertEq(remaining, 5); // 5 ejected, 5 remain

        // Verify the 5 ejected have ejectedAtGeneration = 1
        uint256 ejectedCount = 0;
        address[10] memory rs = [reviewer1, reviewer2, reviewer3, reviewer4, reviewer5,
                                  reviewer6, reviewer7, reviewer8, reviewer9, reviewer10];
        for (uint256 i = 0; i < 10; i++) {
            if (!escrow.isReviewer(rs[i])) {
                ejectedCount++;
                assertEq(escrow.ejectedAtGeneration(rs[i]), 1);
            }
        }
        assertEq(ejectedCount, 5);
    }

    function test_RevertReRegister_MustWaitForNewPoolCycle() public {
        _registerReviewers(); // generation = 1
        _presetCountsTo9();

        // Trigger ejection for the 5 selected
        address b = address(uint160(0xC001)); address s = address(uint160(0xA002));
        vm.deal(b, 10 ether); vm.deal(s, 1 ether);
        _runFullDispute(b, s, 100);

        // Find one ejected reviewer
        address ejected;
        address[10] memory rs = [reviewer1, reviewer2, reviewer3, reviewer4, reviewer5,
                                  reviewer6, reviewer7, reviewer8, reviewer9, reviewer10];
        for (uint256 i = 0; i < 10; i++) {
            if (!escrow.isReviewer(rs[i])) { ejected = rs[i]; break; }
        }
        assertTrue(ejected != address(0));

        // Cannot re-register immediately — poolGeneration (1) == ejectedAtGeneration (1)
        vm.prank(ejected);
        vm.expectRevert("Wait for new pool cycle");
        escrow.registerAsReviewer();
    }

    function test_ReviewerCanReRegisterAfterNewCycle() public {
        _registerReviewers(); // generation = 1
        _presetCountsTo9();

        address b = address(uint160(0xC002)); address s = address(uint160(0xA003));
        vm.deal(b, 10 ether); vm.deal(s, 1 ether);
        _runFullDispute(b, s, 100); // ejects 5, pool has 5 left

        // Find ejected reviewer
        address ejected;
        address[10] memory rs = [reviewer1, reviewer2, reviewer3, reviewer4, reviewer5,
                                  reviewer6, reviewer7, reviewer8, reviewer9, reviewer10];
        for (uint256 i = 0; i < 10; i++) {
            if (!escrow.isReviewer(rs[i])) { ejected = rs[i]; break; }
        }

        // Fill the 5 empty spots with new reviewers → pool reaches 10 → generation advances to 2
        for (uint256 i = 0; i < 5; i++) {
            address nr = address(uint160(0x5000 + i));
            vm.prank(nr);
            escrow.registerAsReviewer();
        }
        assertEq(escrow.poolGeneration(), 2);

        // One reviewer voluntarily leaves → spot opens
        vm.prank(address(uint160(0x5000)));
        escrow.removeFromPool();

        // Ejected reviewer can now re-register (gen 2 > ejectedAtGeneration 1)
        vm.prank(ejected);
        escrow.registerAsReviewer();
        assertTrue(escrow.isReviewer(ejected));
        assertEq(escrow.reviewerDisputeCount(ejected), 0);
    }

    function test_AutoEject_DoesNotEjectReviewersBelow10() public {
        _registerReviewers(); // pool = 10

        // Set counts to 8 — one dispute will bring them to 9 max (5 selected)
        address[10] memory rs = [reviewer1, reviewer2, reviewer3, reviewer4, reviewer5,
                                  reviewer6, reviewer7, reviewer8, reviewer9, reviewer10];
        for (uint256 i = 0; i < 10; i++) {
            stdstore.target(address(escrow))
                .sig("reviewerDisputeCount(address)")
                .with_key(rs[i])
                .checked_write(uint256(8));
        }

        address b = address(uint160(0xE001)); address s = address(uint160(0xF001));
        vm.deal(b, 10 ether); vm.deal(s, 1 ether);
        _runFullDispute(b, s, 100); // selected reviewers go to 9, not ejected

        // All still in pool
        assertEq(escrow.getReviewerPool().length, 10);
        assertTrue(escrow.isReviewer(reviewer1));
    }

    function test_AutoEject_NewReviewerCanJoin() public {
        _registerReviewers(); // generation = 1
        _presetCountsTo9();

        address b = address(uint160(0x2001)); address s = address(uint160(0x3001));
        vm.deal(b, 10 ether); vm.deal(s, 1 ether);
        _runFullDispute(b, s, 100); // 5 ejected, pool = 5

        assertEq(escrow.getReviewerPool().length, 5);

        // New reviewer with no deal history can join immediately
        address newReviewer = makeAddr("newReviewer");
        vm.prank(newReviewer);
        escrow.registerAsReviewer();

        assertTrue(escrow.isReviewer(newReviewer));
        assertEq(escrow.reviewerDisputeCount(newReviewer), 0);
        assertEq(escrow.getReviewerPool().length, 6);
    }

    // ═════════════════════════════════════════════════════════════════════════
    //  15. SYBIL PROTECTION — MIN_REVIEWER_AGE (7 days)
    // ═════════════════════════════════════════════════════════════════════════

    /// @dev Pool is full but all reviewers registered AFTER the deal was created.
    ///      None are aged → must revert with "Not enough seasoned reviewers".
    function test_RevertDispute_ReviewersNotSeasoned() public {
        // Create & fund deal first
        uint256 dealId = _createAndFundETHDeal();

        // Register reviewers AFTER deal creation — they are not aged relative to deal.createdAt
        vm.prank(reviewer1);  escrow.registerAsReviewer();
        vm.prank(reviewer2);  escrow.registerAsReviewer();
        vm.prank(reviewer3);  escrow.registerAsReviewer();
        vm.prank(reviewer4);  escrow.registerAsReviewer();
        vm.prank(reviewer5);  escrow.registerAsReviewer();
        vm.prank(reviewer6);  escrow.registerAsReviewer();
        vm.prank(reviewer7);  escrow.registerAsReviewer();
        vm.prank(reviewer8);  escrow.registerAsReviewer();
        vm.prank(reviewer9);  escrow.registerAsReviewer();
        vm.prank(reviewer10); escrow.registerAsReviewer();
        // Even warping 7 days doesn't help — check uses deal.createdAt as the cutoff
        vm.warp(block.timestamp + 7 days + 1);

        vm.prank(buyer);
        vm.expectRevert("Not enough seasoned reviewers");
        escrow.openDispute(dealId, "Issue", "");
    }

    /// @dev Sybil attack: attacker registers 3 fake reviewer accounts AFTER creating a deal.
    ///      Even after waiting 7 days (wall clock), dispute was opened before registration + 7 days
    ///      relative to deal.createdAt → Sybil accounts cannot be selected for that deal's panel.
    function test_Sybil_RegistrationAfterDeal_NotEligible() public {
        // Legitimate reviewers registered and aged (8 of them)
        address[8] memory legit = [
            makeAddr("legit1"), makeAddr("legit2"), makeAddr("legit3"), makeAddr("legit4"),
            makeAddr("legit5"), makeAddr("legit6"), makeAddr("legit7"), makeAddr("legit8")
        ];
        for (uint256 i = 0; i < 8; i++) {
            vm.prank(legit[i]); escrow.registerAsReviewer();
        }
        vm.warp(block.timestamp + 7 days + 1); // legit reviewers aged

        // Attacker creates a deal
        address sybilBuyer  = makeAddr("sybilBuyer");
        address sybilSeller = makeAddr("sybilSeller");
        vm.deal(sybilBuyer, 10 ether); vm.deal(sybilSeller, 1 ether);
        vm.prank(sybilSeller);
        uint256 dealId = escrow.createDeal(sybilBuyer, address(0), DEAL_AMOUNT, 7, "Sybil", "");
        uint256 fee = (DEAL_AMOUNT * FEE_BPS) / 10000;
        vm.prank(sybilBuyer);
        escrow.fundDeal{value: DEAL_AMOUNT + fee}(dealId);

        // Attacker registers 2 Sybil accounts AFTER deal creation → not aged for this deal
        address sybil1 = makeAddr("sybil1");
        address sybil2 = makeAddr("sybil2");
        vm.prank(sybil1); escrow.registerAsReviewer();
        vm.prank(sybil2); escrow.registerAsReviewer();
        // pool is now 10 (8 legit + 2 sybil)

        // Even warping 7 days from Sybil registration: sybils are not aged vs deal.createdAt
        vm.warp(block.timestamp + 7 days + 1);

        // Opening dispute must succeed (8 aged legit reviewers ≥ PANEL_SIZE=5)
        vm.prank(sybilBuyer);
        escrow.openDispute(dealId, "Issue", "");

        // Verify selected panel contains only legit reviewers (none are sybil)
        (address[5] memory panel,,,,) = escrow.getDisputeVoting(dealId);
        for (uint256 i = 0; i < 5; i++) {
            assertTrue(panel[i] != sybil1 && panel[i] != sybil2,
                "Sybil reviewer was selected - age check failed");
        }
    }
}
