// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "./interfaces/IERC20.sol";
import {ReentrancyGuard} from "./utils/ReentrancyGuard.sol";

/// @title VaultPayEscrow — Non-custodial escrow with community reviewer dispute resolution
/// @author VaultPay
/// @notice Each deal is an isolated escrow between a buyer and a seller.
///         Disputes are resolved by a randomly selected panel of 5 community reviewers.
contract VaultPayEscrow is ReentrancyGuard {
    // ─── Types ───────────────────────────────────────────────────────────
    enum DealStatus {
        Created,    // Deal created, awaiting funding
        Funded,     // Buyer deposited funds
        Delivered,  // Seller marked as delivered
        Released,   // Buyer confirmed, funds sent to seller
        Disputed,   // One party opened a dispute
        Resolved,   // Dispute resolved by reviewer vote
        Refunded,   // Buyer refunded (timeout or dispute)
        Cancelled   // Deal cancelled before funding
    }

    struct Deal {
        address buyer;
        address seller;
        address token;           // ERC20 token address (address(0) = native ETH)
        uint256 amount;
        uint256 fee;             // Protocol fee amount (pre-computed at deal creation)
        uint256 deliveryDays;    // Delivery window in days (set at creation)
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
        string evidence;         // IPFS hash or URL
        uint256 openedAt;
        bool resolved;
        uint8 sellerPercent;     // 0-100, what % goes to seller on resolution
    }

    struct DisputeVoting {
        address[5] reviewers;
        uint8[5] votes;          // 0, 50, or 100
        bool[5] hasVoted;
        uint256 deadline;
        bool finalized;
    }

    // ─── State ───────────────────────────────────────────────────────────
    address public owner;
    uint256 public protocolFeeBps;
    uint256 public dealCount;
    address public feeRecipient;

    uint256 public constant MAX_FEE_BPS         = 500;      // Max 5%
    uint256 public constant MIN_DELIVERY_PERIOD = 1 days;
    uint256 public constant DISPUTE_WINDOW      = 3 days;   // Time after delivery to open dispute
    uint256 public constant REFUND_TIMEOUT      = 14 days;  // Auto-refund if seller ghosts
    uint256 public constant VOTING_PERIOD       = 48 hours; // Reviewer voting window
    uint256 public constant MAX_REVIEWERS       = 10;
    uint256 public constant PANEL_SIZE          = 5;        // Reviewers selected per dispute

    mapping(uint256 => Deal) public deals;
    mapping(uint256 => Dispute) public disputes;
    mapping(uint256 => DisputeVoting) public disputeVotings;

    address[] public reviewerPool;
    mapping(address => bool) public isReviewer;

    // ─── Events ──────────────────────────────────────────────────────────
    event DealCreated(uint256 indexed dealId, address indexed buyer, address indexed seller, uint256 amount);
    event DealFunded(uint256 indexed dealId, uint256 amount);
    event DeliveryConfirmed(uint256 indexed dealId);
    event FundsReleased(uint256 indexed dealId, uint256 sellerAmount, uint256 feeAmount);
    event DisputeOpened(uint256 indexed dealId, address indexed opener, string reason);
    event DisputeResolved(uint256 indexed dealId, uint8 sellerPercent);
    event DealRefunded(uint256 indexed dealId, uint256 amount);
    event DealCancelled(uint256 indexed dealId);
    event ReviewerRegistered(address indexed reviewer);
    event ReviewerRemoved(address indexed reviewer);
    event VoteSubmitted(uint256 indexed dealId, address indexed reviewer, uint8 sellerPercent);
    event DisputeFinalized(uint256 indexed dealId, uint8 sellerPercent, uint256 voterCount);

    // ─── Modifiers ───────────────────────────────────────────────────────
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
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
    /// @param _feeRecipient Address that receives protocol fees when no reviewers voted
    /// @param _feeBps Protocol fee in basis points (e.g. 50 = 0.5%)
    constructor(address _feeRecipient, uint256 _feeBps) {
        require(_feeRecipient != address(0), "Invalid fee recipient");
        require(_feeBps <= MAX_FEE_BPS, "Fee too high");

        owner = msg.sender;
        feeRecipient = _feeRecipient;
        protocolFeeBps = _feeBps;
    }

    // ─── Reviewer Pool ───────────────────────────────────────────────────

    /// @notice Anyone can join the reviewer pool (max 10 reviewers)
    function registerAsReviewer() external {
        require(!isReviewer[msg.sender], "Already a reviewer");
        require(reviewerPool.length < MAX_REVIEWERS, "Reviewer pool full");

        isReviewer[msg.sender] = true;
        reviewerPool.push(msg.sender);

        emit ReviewerRegistered(msg.sender);
    }

    /// @notice A reviewer can voluntarily leave the pool
    function removeFromPool() external {
        require(isReviewer[msg.sender], "Not a reviewer");

        isReviewer[msg.sender] = false;

        // Swap-and-pop to remove the reviewer from the array
        uint256 len = reviewerPool.length;
        for (uint256 i = 0; i < len; i++) {
            if (reviewerPool[i] == msg.sender) {
                reviewerPool[i] = reviewerPool[len - 1];
                reviewerPool.pop();
                break;
            }
        }

        emit ReviewerRemoved(msg.sender);
    }

    // ─── Core: Create Deal ───────────────────────────────────────────────
    /// @notice Seller creates a new escrow deal
    /// @param _buyer Address of the buyer (address(0) = open listing, anyone can fund)
    /// @param _token ERC20 token address (address(0) for native ETH)
    /// @param _amount Amount to escrow (excluding fee)
    /// @param _deliveryDays Number of days for delivery
    /// @param _title Short deal title
    /// @param _description Deal description or IPFS hash
    function createDeal(
        address _buyer,
        address _token,
        uint256 _amount,
        uint256 _deliveryDays,
        string calldata _title,
        string calldata _description
    ) external returns (uint256 dealId) {
        require(_buyer != msg.sender, "Buyer cannot be seller");
        require(_amount > 0, "Amount must be > 0");
        require(_deliveryDays * 1 days >= MIN_DELIVERY_PERIOD, "Delivery too short");

        dealId = dealCount++;
        uint256 fee = (_amount * protocolFeeBps) / 10000;

        deals[dealId] = Deal({
            buyer: _buyer,
            seller: msg.sender,
            token: _token,
            amount: _amount,
            fee: fee,
            deliveryDays: _deliveryDays,
            createdAt: block.timestamp,
            fundedAt: 0,
            deliveryDeadline: 0,
            disputeDeadline: 0,
            title: _title,
            description: _description,
            status: DealStatus.Created
        });

        emit DealCreated(dealId, _buyer, msg.sender, _amount);
    }

    // ─── Core: Fund Deal ─────────────────────────────────────────────────
    /// @notice Buyer deposits funds (amount + fee) into the escrow
    function fundDeal(uint256 dealId) external payable nonReentrant {
        Deal storage deal = deals[dealId];
        require(deal.status == DealStatus.Created, "Deal not in Created state");
        require(msg.sender != deal.seller, "Seller cannot fund");

        // Open listing: first funder becomes the buyer
        if (deal.buyer == address(0)) {
            deal.buyer = msg.sender;
        } else {
            require(msg.sender == deal.buyer, "Not buyer");
        }

        uint256 totalRequired = deal.amount + deal.fee;

        if (deal.token == address(0)) {
            require(msg.value == totalRequired, "Incorrect ETH amount");
        } else {
            require(msg.value == 0, "ETH not accepted for token deals");
            IERC20(deal.token).transferFrom(msg.sender, address(this), totalRequired);
        }

        deal.fundedAt = block.timestamp;
        deal.deliveryDeadline = block.timestamp + deal.deliveryDays * 1 days;
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
    /// @notice Buyer releases funds to seller, or auto-release after dispute window
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

    /// @notice Either party opens a dispute; selects 5 random reviewers from the pool
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
        require(reviewerPool.length >= PANEL_SIZE, "Not enough reviewers in pool");

        deal.status = DealStatus.Disputed;
        disputes[dealId] = Dispute({
            opener: msg.sender,
            reason: _reason,
            evidence: _evidence,
            openedAt: block.timestamp,
            resolved: false,
            sellerPercent: 0
        });

        // Select 5 unique reviewers pseudo-randomly
        DisputeVoting storage voting = disputeVotings[dealId];
        voting.deadline = block.timestamp + VOTING_PERIOD;
        voting.finalized = false;

        uint256 poolLen = reviewerPool.length;
        uint256 selected = 0;
        uint256 nonce = 0;

        while (selected < PANEL_SIZE) {
            bytes32 seed = keccak256(
                abi.encodePacked(block.timestamp, block.prevrandao, dealId, msg.sender, nonce)
            );
            uint256 idx = uint256(seed) % poolLen;
            address candidate = reviewerPool[idx];

            // Ensure uniqueness within the panel
            bool alreadyPicked = false;
            for (uint256 k = 0; k < selected; k++) {
                if (voting.reviewers[k] == candidate) {
                    alreadyPicked = true;
                    break;
                }
            }

            if (!alreadyPicked) {
                voting.reviewers[selected] = candidate;
                selected++;
            }
            nonce++;
        }

        emit DisputeOpened(dealId, msg.sender, _reason);
    }

    /// @notice A selected reviewer submits their vote on how to split the escrowed funds
    /// @param dealId The deal under dispute
    /// @param sellerPercent Must be 0, 50, or 100
    function submitVote(uint256 dealId, uint8 sellerPercent) external {
        require(
            sellerPercent == 0 || sellerPercent == 50 || sellerPercent == 100,
            "Vote must be 0, 50, or 100"
        );

        Deal storage deal = deals[dealId];
        require(deal.status == DealStatus.Disputed, "Deal not disputed");

        DisputeVoting storage voting = disputeVotings[dealId];
        require(block.timestamp < voting.deadline, "Voting deadline passed");
        require(!voting.finalized, "Already finalized");

        // Find caller's position in the panel
        int256 voterIdx = -1;
        for (uint256 i = 0; i < PANEL_SIZE; i++) {
            if (voting.reviewers[i] == msg.sender) {
                voterIdx = int256(i);
                break;
            }
        }
        require(voterIdx >= 0, "Not a reviewer for this deal");

        uint256 idx = uint256(voterIdx);
        require(!voting.hasVoted[idx], "Already voted");

        voting.hasVoted[idx] = true;
        voting.votes[idx] = sellerPercent;

        emit VoteSubmitted(dealId, msg.sender, sellerPercent);
    }

    /// @notice Anyone can finalize a dispute after the voting deadline has passed
    function finalizeDispute(uint256 dealId) external nonReentrant {
        Deal storage deal = deals[dealId];
        require(deal.status == DealStatus.Disputed, "Deal not disputed");

        DisputeVoting storage voting = disputeVotings[dealId];
        require(block.timestamp >= voting.deadline, "Voting still ongoing");
        require(!voting.finalized, "Already finalized");

        // Tally votes in an isolated scope to avoid stack-too-deep
        uint8 result;
        address[5] memory actualVoters;
        uint256 actualVoterCount;
        {
            uint256 votes0;
            uint256 votes50;
            uint256 votes100;

            for (uint256 i = 0; i < PANEL_SIZE; i++) {
                if (voting.hasVoted[i]) {
                    actualVoters[actualVoterCount] = voting.reviewers[i];
                    actualVoterCount++;
                    uint8 v = voting.votes[i];
                    if (v == 0)        votes0++;
                    else if (v == 50)  votes50++;
                    else               votes100++;
                }
            }

            if (actualVoterCount == 0) {
                result = 50;
            } else if (votes50 >= votes0 && votes50 >= votes100) {
                result = 50;
            } else if (votes0 > votes100) {
                result = 0;
            } else if (votes100 > votes0) {
                result = 100;
            } else {
                result = 50; // exact tie between 0 and 100 → split
            }
        }

        // Mark as finalized before external calls (CEI pattern)
        voting.finalized = true;
        disputes[dealId].resolved = true;
        disputes[dealId].sellerPercent = result;
        deal.status = DealStatus.Resolved;

        // Distribute payouts via helper to keep this function's stack shallow
        _distributeDisputePayouts(dealId, result, actualVoters, actualVoterCount);

        emit DisputeFinalized(dealId, result, actualVoterCount);
        emit DisputeResolved(dealId, result);
    }

    /// @dev Computes and transfers all payouts after a dispute is finalized.
    function _distributeDisputePayouts(
        uint256 dealId,
        uint8 result,
        address[5] memory actualVoters,
        uint256 actualVoterCount
    ) internal {
        Deal storage deal = deals[dealId];

        uint256 sellerAmount    = (deal.amount * result) / 100;
        uint256 buyerRefund     = deal.amount - sellerAmount;
        uint256 feeToDistribute = (deal.fee * result) / 100;
        uint256 feeReturn       = deal.fee - feeToDistribute;

        if (sellerAmount > 0) {
            _transfer(deal.token, deal.seller, sellerAmount);
        }
        if (buyerRefund + feeReturn > 0) {
            _transfer(deal.token, deal.buyer, buyerRefund + feeReturn);
        }
        if (feeToDistribute > 0) {
            if (actualVoterCount == 0) {
                _transfer(deal.token, feeRecipient, feeToDistribute);
            } else {
                uint256 perVoter  = feeToDistribute / actualVoterCount;
                uint256 remainder = feeToDistribute - (perVoter * actualVoterCount);
                for (uint256 i = 0; i < actualVoterCount; i++) {
                    uint256 payout = (i == actualVoterCount - 1)
                        ? perVoter + remainder
                        : perVoter;
                    if (payout > 0) {
                        _transfer(deal.token, actualVoters[i], payout);
                    }
                }
            }
        }
    }

    // ─── Refund (Timeout) ────────────────────────────────────────────────
    /// @notice Buyer claims refund if seller missed the delivery deadline
    function claimRefund(uint256 dealId) external nonReentrant onlyBuyer(dealId) {
        Deal storage deal = deals[dealId];
        require(deal.status == DealStatus.Funded, "Not in funded state");
        require(block.timestamp > deal.deliveryDeadline, "Deadline not reached");

        deal.status = DealStatus.Refunded;
        uint256 totalRefund = deal.amount + deal.fee;

        _transfer(deal.token, deal.buyer, totalRefund);

        emit DealRefunded(dealId, totalRefund);
    }

    /// @notice Cancel an unfunded deal — only seller can cancel before funding
    function cancelDeal(uint256 dealId) external onlySeller(dealId) {
        Deal storage deal = deals[dealId];
        require(deal.status == DealStatus.Created, "Can only cancel unfunded deals");

        deal.status = DealStatus.Cancelled;
        emit DealCancelled(dealId);
    }

    // ─── Admin ───────────────────────────────────────────────────────────
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

        uint256 sellerGross    = (deal.amount * sellerPercent) / 100;
        uint256 buyerRefund    = deal.amount - sellerGross;
        uint256 feeToProtocol  = (deal.fee * sellerPercent) / 100;
        uint256 feeReturn      = deal.fee - feeToProtocol;

        if (sellerGross > 0) {
            _transfer(deal.token, deal.seller, sellerGross);
        }
        if (feeToProtocol > 0) {
            _transfer(deal.token, feeRecipient, feeToProtocol);
        }
        if (buyerRefund + feeReturn > 0) {
            _transfer(deal.token, deal.buyer, buyerRefund + feeReturn);
        }
    }

    function _transfer(address token, address to, uint256 amount) internal {
        if (token == address(0)) {
            (bool ok, ) = payable(to).call{value: amount}("");
            require(ok, "ETH transfer failed");
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

    function getDisputeVoting(uint256 dealId) external view returns (
        address[5] memory reviewers,
        bool[5] memory hasVoted,
        uint8[5] memory votes,
        uint256 deadline,
        bool finalized
    ) {
        DisputeVoting storage v = disputeVotings[dealId];
        return (v.reviewers, v.hasVoted, v.votes, v.deadline, v.finalized);
    }

    function getReviewerPool() external view returns (address[] memory) {
        return reviewerPool;
    }
}
