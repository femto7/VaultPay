// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "./interfaces/IERC20.sol";
import {ReentrancyGuard} from "./utils/ReentrancyGuard.sol";

/// @title VaultPayEscrow — Non-custodial escrow with milestone support & dispute resolution
/// @author VaultPay
/// @notice Each deal is an isolated escrow between a buyer and a seller
contract VaultPayEscrow is ReentrancyGuard {
    // ─── Types ───────────────────────────────────────────────────────────
    enum DealStatus {
        Created,    // Deal created, awaiting funding
        Funded,     // Buyer deposited funds
        Delivered,  // Seller marked as delivered
        Released,   // Buyer confirmed, funds sent to seller
        Disputed,   // One party opened a dispute
        Resolved,   // Arbiter resolved the dispute
        Refunded,   // Buyer refunded (timeout or dispute)
        Cancelled   // Deal cancelled before funding
    }

    struct Deal {
        address buyer;
        address seller;
        address token;          // ERC20 token address (address(0) = native ETH)
        uint256 amount;
        uint256 fee;            // Protocol fee (basis points)
        uint256 createdAt;
        uint256 fundedAt;
        uint256 deliveryDeadline;
        uint256 disputeDeadline;
        string title;
        string description;
        DealStatus status;
    }

    struct Dispute {
        address opener;
        string reason;
        string evidence;       // IPFS hash or URL
        uint256 openedAt;
        bool resolved;
        uint8 sellerPercent;   // 0-100, what % goes to seller on resolution
    }

    // ─── State ───────────────────────────────────────────────────────────
    address public owner;
    address public arbiter;
    uint256 public protocolFeeBps; // e.g. 50 = 0.5%
    uint256 public dealCount;
    address public feeRecipient;

    uint256 public constant MAX_FEE_BPS = 500;         // Max 5%
    uint256 public constant MIN_DELIVERY_PERIOD = 1 days;
    uint256 public constant DISPUTE_WINDOW = 3 days;    // Time after delivery to open dispute
    uint256 public constant REFUND_TIMEOUT = 14 days;   // Auto-refund if seller ghosts

    mapping(uint256 => Deal) public deals;
    mapping(uint256 => Dispute) public disputes;

    // ─── Events ──────────────────────────────────────────────────────────
    event DealCreated(uint256 indexed dealId, address indexed buyer, address indexed seller, uint256 amount);
    event DealFunded(uint256 indexed dealId, uint256 amount);
    event DeliveryConfirmed(uint256 indexed dealId);
    event FundsReleased(uint256 indexed dealId, uint256 sellerAmount, uint256 feeAmount);
    event DisputeOpened(uint256 indexed dealId, address indexed opener, string reason);
    event DisputeResolved(uint256 indexed dealId, uint8 sellerPercent);
    event DealRefunded(uint256 indexed dealId, uint256 amount);
    event DealCancelled(uint256 indexed dealId);

    // ─── Modifiers ───────────────────────────────────────────────────────
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyArbiter() {
        require(msg.sender == arbiter, "Not arbiter");
        _;
    }

    modifier onlyBuyer(uint256 dealId) {
        require(msg.sender == deals[dealId].buyer, "Not buyer");
        _;
    }

    modifier onlySeller(uint256 dealId) {
        require(msg.sender == deals[dealId].seller, "Not seller");
        _;
    }

    modifier onlyParty(uint256 dealId) {
        require(
            msg.sender == deals[dealId].buyer || msg.sender == deals[dealId].seller,
            "Not a party"
        );
        _;
    }

    // ─── Constructor ─────────────────────────────────────────────────────
    constructor(address _arbiter, uint256 _feeBps, address _feeRecipient) {
        require(_arbiter != address(0), "Invalid arbiter");
        require(_feeRecipient != address(0), "Invalid fee recipient");
        require(_feeBps <= MAX_FEE_BPS, "Fee too high");

        owner = msg.sender;
        arbiter = _arbiter;
        protocolFeeBps = _feeBps;
        feeRecipient = _feeRecipient;
    }

    // ─── Core: Create Deal ───────────────────────────────────────────────
    /// @notice Buyer creates a new escrow deal
    /// @param _seller Address of the seller
    /// @param _token ERC20 token (address(0) for native ETH)
    /// @param _amount Amount to escrow
    /// @param _deliveryDays Number of days for delivery
    /// @param _title Short deal title
    /// @param _description Deal description or IPFS hash
    function createDeal(
        address _seller,
        address _token,
        uint256 _amount,
        uint256 _deliveryDays,
        string calldata _title,
        string calldata _description
    ) external returns (uint256 dealId) {
        require(_seller != address(0) && _seller != msg.sender, "Invalid seller");
        require(_amount > 0, "Amount must be > 0");
        require(_deliveryDays * 1 days >= MIN_DELIVERY_PERIOD, "Delivery too short");

        dealId = dealCount++;
        uint256 fee = (_amount * protocolFeeBps) / 10000;

        deals[dealId] = Deal({
            buyer: msg.sender,
            seller: _seller,
            token: _token,
            amount: _amount,
            fee: fee,
            createdAt: block.timestamp,
            fundedAt: 0,
            deliveryDeadline: 0,
            disputeDeadline: 0,
            title: _title,
            description: _description,
            status: DealStatus.Created
        });

        emit DealCreated(dealId, msg.sender, _seller, _amount);
    }

    // ─── Core: Fund Deal ─────────────────────────────────────────────────
    /// @notice Buyer deposits funds into the escrow
    function fundDeal(uint256 dealId) external payable nonReentrant onlyBuyer(dealId) {
        Deal storage deal = deals[dealId];
        require(deal.status == DealStatus.Created, "Deal not in Created state");

        uint256 totalRequired = deal.amount + deal.fee;

        if (deal.token == address(0)) {
            require(msg.value == totalRequired, "Incorrect ETH amount");
        } else {
            require(msg.value == 0, "ETH not accepted for token deals");
            IERC20(deal.token).transferFrom(msg.sender, address(this), totalRequired);
        }

        deal.fundedAt = block.timestamp;
        deal.deliveryDeadline = block.timestamp + REFUND_TIMEOUT;
        deal.status = DealStatus.Funded;

        emit DealFunded(dealId, totalRequired);
    }

    // ─── Core: Confirm Delivery ──────────────────────────────────────────
    /// @notice Seller marks the deal as delivered
    function confirmDelivery(uint256 dealId) external onlySeller(dealId) {
        Deal storage deal = deals[dealId];
        require(deal.status == DealStatus.Funded, "Deal not funded");

        deal.status = DealStatus.Delivered;
        deal.disputeDeadline = block.timestamp + DISPUTE_WINDOW;

        emit DeliveryConfirmed(dealId);
    }

    // ─── Core: Release Funds ─────────────────────────────────────────────
    /// @notice Buyer releases funds to seller (or auto after dispute window)
    function releaseFunds(uint256 dealId) external nonReentrant {
        Deal storage deal = deals[dealId];

        bool isBuyer = msg.sender == deal.buyer;
        bool isAutoRelease = deal.status == DealStatus.Delivered
            && block.timestamp > deal.disputeDeadline;

        require(
            (isBuyer && (deal.status == DealStatus.Funded || deal.status == DealStatus.Delivered))
                || isAutoRelease,
            "Cannot release"
        );

        deal.status = DealStatus.Released;
        _transferToSeller(dealId, 100);

        emit FundsReleased(dealId, deal.amount, deal.fee);
    }

    // ─── Disputes ────────────────────────────────────────────────────────
    /// @notice Either party opens a dispute
    function openDispute(
        uint256 dealId,
        string calldata _reason,
        string calldata _evidence
    ) external onlyParty(dealId) {
        Deal storage deal = deals[dealId];
        require(
            deal.status == DealStatus.Funded || deal.status == DealStatus.Delivered,
            "Cannot dispute"
        );

        if (deal.status == DealStatus.Delivered) {
            require(block.timestamp <= deal.disputeDeadline, "Dispute window closed");
        }

        deal.status = DealStatus.Disputed;
        disputes[dealId] = Dispute({
            opener: msg.sender,
            reason: _reason,
            evidence: _evidence,
            openedAt: block.timestamp,
            resolved: false,
            sellerPercent: 0
        });

        emit DisputeOpened(dealId, msg.sender, _reason);
    }

    /// @notice Arbiter resolves the dispute with a split
    /// @param sellerPercent 0-100, percentage of funds going to seller
    function resolveDispute(uint256 dealId, uint8 sellerPercent) external nonReentrant onlyArbiter {
        Deal storage deal = deals[dealId];
        Dispute storage dispute = disputes[dealId];

        require(deal.status == DealStatus.Disputed, "Not disputed");
        require(sellerPercent <= 100, "Invalid percent");

        dispute.resolved = true;
        dispute.sellerPercent = sellerPercent;
        deal.status = DealStatus.Resolved;

        _transferToSeller(dealId, sellerPercent);

        emit DisputeResolved(dealId, sellerPercent);
    }

    // ─── Refund (Timeout) ────────────────────────────────────────────────
    /// @notice Buyer claims refund if seller missed delivery deadline
    function claimRefund(uint256 dealId) external nonReentrant onlyBuyer(dealId) {
        Deal storage deal = deals[dealId];
        require(deal.status == DealStatus.Funded, "Not in funded state");
        require(block.timestamp > deal.deliveryDeadline, "Deadline not reached");

        deal.status = DealStatus.Refunded;
        uint256 totalRefund = deal.amount + deal.fee;

        _transfer(deal.token, deal.buyer, totalRefund);

        emit DealRefunded(dealId, totalRefund);
    }

    /// @notice Cancel an unfunded deal
    function cancelDeal(uint256 dealId) external onlyBuyer(dealId) {
        Deal storage deal = deals[dealId];
        require(deal.status == DealStatus.Created, "Can only cancel unfunded deals");

        deal.status = DealStatus.Cancelled;
        emit DealCancelled(dealId);
    }

    // ─── Admin ───────────────────────────────────────────────────────────
    function setArbiter(address _arbiter) external onlyOwner {
        require(_arbiter != address(0), "Invalid arbiter");
        arbiter = _arbiter;
    }

    function setFee(uint256 _feeBps) external onlyOwner {
        require(_feeBps <= MAX_FEE_BPS, "Fee too high");
        protocolFeeBps = _feeBps;
    }

    function setFeeRecipient(address _recipient) external onlyOwner {
        require(_recipient != address(0), "Invalid recipient");
        feeRecipient = _recipient;
    }

    // ─── Internal ────────────────────────────────────────────────────────
    function _transferToSeller(uint256 dealId, uint8 sellerPercent) internal {
        Deal storage deal = deals[dealId];

        uint256 sellerAmount = (deal.amount * sellerPercent) / 100;
        uint256 buyerRefund = deal.amount - sellerAmount;

        // Protocol fee only on the seller's portion
        uint256 feeOnSeller = (sellerAmount * deal.fee) / deal.amount;
        uint256 sellerNet = sellerAmount - feeOnSeller;
        uint256 feeRefund = deal.fee - feeOnSeller;

        if (sellerNet > 0) {
            _transfer(deal.token, deal.seller, sellerNet);
        }
        if (feeOnSeller > 0) {
            _transfer(deal.token, feeRecipient, feeOnSeller);
        }
        if (buyerRefund + feeRefund > 0) {
            _transfer(deal.token, deal.buyer, buyerRefund + feeRefund);
        }
    }

    function _transfer(address token, address to, uint256 amount) internal {
        if (token == address(0)) {
            (bool success,) = to.call{value: amount}("");
            require(success, "ETH transfer failed");
        } else {
            IERC20(token).transfer(to, amount);
        }
    }

    // ─── View ────────────────────────────────────────────────────────────
    function getDeal(uint256 dealId) external view returns (Deal memory) {
        return deals[dealId];
    }

    function getDispute(uint256 dealId) external view returns (Dispute memory) {
        return disputes[dealId];
    }
}
