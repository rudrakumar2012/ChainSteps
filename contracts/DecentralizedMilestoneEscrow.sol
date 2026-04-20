// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title DecentralizedMilestoneEscrow
/// @notice Trustless escrow for service contracts with milestone-based payments
contract DecentralizedMilestoneEscrow is ReentrancyGuard {
    enum State { Created, Active, Disputed, Completed, Cancelled }

    struct Milestone {
        string description;
        uint256 amount;
        bool isCompleted;
        bool isApproved;
        uint256 completedAt;
        uint256 approvalTimeout;
    }

    struct Escrow {
        address client;
        address freelancer;
        Milestone[] milestones;
        State state;
        uint256 currentMilestone;
        uint256 disputeTimeout;
        address arbitrator;
        uint256 totalAmount;
        uint256 disputeRaisedAt;
        address disputeRaiser;
        uint256 disputeBond;
    }

    uint256 public constant DISPUTE_TIMEOUT = 7 days;
    uint256 public constant MAX_MILESTONES = 50;
    uint256 public constant RESOLUTION_DELAY = 1 days;
    uint256 public constant DISPUTE_BOND = 0.001 ether;
    uint256 public constant MAX_DISPUTE_DURATION = 30 days;

    Escrow[] public escrows;
    mapping(uint256 => address) public escrowCreators;

    event EscrowCreated(uint256 indexed escrowId, address client, address freelancer);
    event EscrowCancelled(uint256 indexed escrowId);
    event MilestoneAdded(uint256 indexed escrowId, uint256 milestoneId, string description, uint256 amount);
    event MilestoneFunded(uint256 indexed escrowId, uint256 totalAmount);
    event MilestoneCompleted(uint256 indexed escrowId, uint256 milestoneId);
    event MilestoneApproved(uint256 indexed escrowId, uint256 milestoneId);
    event MilestoneDisputed(uint256 indexed escrowId, uint256 milestoneId);
    event MilestoneClaimed(uint256 indexed escrowId, uint256 milestoneId);
    event DisputeResolved(uint256 indexed escrowId, uint256 clientPercent, uint256 clientShare, uint256 freelancerShare);
    event DisputeExpired(uint256 indexed escrowId, uint256 milestoneId, uint256 freelancerPayout);
    event FundsWithdrawn(uint256 indexed escrowId, uint256 amount);

    modifier onlyClient(uint256 _escrowId) {
        require(msg.sender == escrows[_escrowId].client, "Only client can call");
        _;
    }

    modifier onlyFreelancer(uint256 _escrowId) {
        require(msg.sender == escrows[_escrowId].freelancer, "Only freelancer can call");
        _;
    }

    modifier inState(uint256 _escrowId, State _state) {
        require(escrows[_escrowId].state == _state, "Invalid state");
        _;
    }

    /// @notice Create a new escrow
    function createEscrow(address _freelancer, address _arbitrator) external returns (uint256) {
        require(_freelancer != msg.sender, "Client cannot be freelancer");
        require(_arbitrator != address(0), "Arbitrator is required");
        require(_arbitrator != msg.sender, "Client cannot be arbitrator");
        require(_arbitrator != _freelancer, "Freelancer cannot be arbitrator");

        Escrow storage escrow = escrows.push();
        escrow.client = msg.sender;
        escrow.freelancer = _freelancer;
        escrow.state = State.Created;
        escrow.arbitrator = _arbitrator;
        escrow.disputeTimeout = DISPUTE_TIMEOUT;

        uint256 escrowId = escrows.length - 1;
        escrowCreators[escrowId] = msg.sender;

        emit EscrowCreated(escrowId, msg.sender, _freelancer);
        return escrowId;
    }

    /// @notice Cancel escrow before funding (only client, only before milestones funded)
    function cancelEscrow(uint256 _escrowId) external onlyClient(_escrowId) inState(_escrowId, State.Created) {
        Escrow storage escrow = escrows[_escrowId];
        // Reset fields individually — `delete` on struct with dynamic array corrupts storage
        escrow.client = address(0);
        escrow.freelancer = address(0);
        escrow.state = State.Cancelled;
        escrow.currentMilestone = 0;
        escrow.disputeTimeout = 0;
        escrow.arbitrator = address(0);
        escrow.totalAmount = 0;
        escrow.disputeRaisedAt = 0;
        escrow.disputeRaiser = address(0);
        escrow.disputeBond = 0;
        delete escrow.milestones;

        escrowCreators[_escrowId] = address(0);
        emit EscrowCancelled(_escrowId);
    }

    /// @notice Add a milestone to an escrow
    function addMilestone(
        uint256 _escrowId,
        string calldata _description,
        uint256 _amount
    ) external onlyClient(_escrowId) inState(_escrowId, State.Created) {
        require(_amount > 0, "Milestone amount must be > 0");
        Escrow storage escrow = escrows[_escrowId];
        require(escrow.milestones.length < MAX_MILESTONES, "Max milestones reached");
        escrow.milestones.push(Milestone({
            description: _description,
            amount: _amount,
            isCompleted: false,
            isApproved: false,
            completedAt: 0,
            approvalTimeout: 0
        }));

        emit MilestoneAdded(_escrowId, escrow.milestones.length - 1, _description, _amount);
    }

    /// @notice Fund the escrow with total amount
    function fundEscrow(uint256 _escrowId) external payable onlyClient(_escrowId) inState(_escrowId, State.Created) {
        Escrow storage escrow = escrows[_escrowId];
        require(escrow.milestones.length > 0, "No milestones");
        uint256 total = 0;
        for (uint256 i = 0; i < escrow.milestones.length; i++) {
            total += escrow.milestones[i].amount;
        }
        require(msg.value >= total, "Insufficient funds");
        escrow.totalAmount = total;
        escrow.state = State.Active;
        emit MilestoneFunded(_escrowId, total);

        // Refund excess ETH
        if (msg.value > total) {
            (bool sent, ) = payable(msg.sender).call{value: msg.value - total}("");
            require(sent, "Refund failed");
        }
    }

    /// @notice Mark current milestone as complete by freelancer
    function completeMilestone(uint256 _escrowId) external onlyFreelancer(_escrowId) inState(_escrowId, State.Active) {
        Escrow storage escrow = escrows[_escrowId];
        require(escrow.currentMilestone < escrow.milestones.length, "No more milestones");
        Milestone storage milestone = escrow.milestones[escrow.currentMilestone];
        require(!milestone.isCompleted, "Already completed");

        milestone.isCompleted = true;
        milestone.completedAt = block.timestamp;
        milestone.approvalTimeout = block.timestamp + DISPUTE_TIMEOUT;
        emit MilestoneCompleted(_escrowId, escrow.currentMilestone);
    }

    /// @notice Approve milestone and release funds
    function approveMilestone(uint256 _escrowId) external onlyClient(_escrowId) inState(_escrowId, State.Active) nonReentrant {
        Escrow storage escrow = escrows[_escrowId];
        require(escrow.currentMilestone < escrow.milestones.length, "No more milestones");
        Milestone storage milestone = escrow.milestones[escrow.currentMilestone];
        require(milestone.isCompleted, "Not completed");
        require(!milestone.isApproved, "Already approved");

        milestone.isApproved = true;
        escrow.currentMilestone++;

        (bool sent, ) = payable(escrow.freelancer).call{value: milestone.amount}("");
        require(sent, "Transfer failed");
        emit MilestoneApproved(_escrowId, escrow.currentMilestone - 1);
        emit FundsWithdrawn(_escrowId, milestone.amount);

        if (escrow.currentMilestone >= escrow.milestones.length) {
            escrow.state = State.Completed;
        }
    }

    /// @notice Claim milestone after timeout (auto-approval for freelancer)
    function claimMilestone(uint256 _escrowId) external onlyFreelancer(_escrowId) inState(_escrowId, State.Active) nonReentrant {
        Escrow storage escrow = escrows[_escrowId];
        require(escrow.currentMilestone < escrow.milestones.length, "No more milestones");
        Milestone storage milestone = escrow.milestones[escrow.currentMilestone];
        require(milestone.isCompleted, "Not completed");
        require(!milestone.isApproved, "Already approved");
        require(block.timestamp >= milestone.approvalTimeout, "Timeout not expired");

        milestone.isApproved = true;
        escrow.currentMilestone++;

        (bool sent, ) = payable(escrow.freelancer).call{value: milestone.amount}("");
        require(sent, "Transfer failed");
        emit MilestoneClaimed(_escrowId, escrow.currentMilestone - 1);
        emit FundsWithdrawn(_escrowId, milestone.amount);

        if (escrow.currentMilestone >= escrow.milestones.length) {
            escrow.state = State.Completed;
        }
    }

    /// @notice Raise a dispute (client or freelancer, requires bond)
    function raiseDispute(uint256 _escrowId) external payable inState(_escrowId, State.Active) {
        Escrow storage escrow = escrows[_escrowId];
        require(
            msg.sender == escrow.client || msg.sender == escrow.freelancer,
            "Only client or freelancer"
        );
        require(escrow.currentMilestone < escrow.milestones.length, "No more milestones");
        require(escrow.milestones[escrow.currentMilestone].isCompleted, "Not completed");
        require(msg.value >= DISPUTE_BOND, "Insufficient dispute bond");

        escrow.state = State.Disputed;
        escrow.disputeRaisedAt = block.timestamp;
        escrow.disputeRaiser = msg.sender;
        escrow.disputeBond = msg.value;
        emit MilestoneDisputed(_escrowId, escrow.currentMilestone);
    }

    /// @notice Resolve dispute and move funds (arbitrator only, after 24h delay)
    function resolveDispute(uint256 _escrowId, uint256 _clientPercent) external inState(_escrowId, State.Disputed) nonReentrant {
        Escrow storage escrow = escrows[_escrowId];
        require(msg.sender == escrow.arbitrator, "Only arbitrator");
        require(_clientPercent <= 100, "Invalid percentage");
        require(
            block.timestamp >= escrow.disputeRaisedAt + RESOLUTION_DELAY,
            "Resolution delay not elapsed"
        );

        Milestone storage milestone = escrow.milestones[escrow.currentMilestone];
        uint256 clientShare = (milestone.amount * _clientPercent) / 100;
        uint256 freelancerShare = milestone.amount - clientShare;

        milestone.isApproved = true;
        escrow.currentMilestone++;
        escrow.state = State.Active;

        if (clientShare > 0) {
            (bool sentClient, ) = payable(escrow.client).call{value: clientShare}("");
            require(sentClient, "Client transfer failed");
        }
        if (freelancerShare > 0) {
            (bool sentFreelancer, ) = payable(escrow.freelancer).call{value: freelancerShare}("");
            require(sentFreelancer, "Freelancer transfer failed");
        }

        // Distribute bond: freelancer wins at clientPercent <= 50, client wins above 50
        if (escrow.disputeBond > 0) {
            address bondRecipient = _clientPercent > 50 ? escrow.client : escrow.freelancer;
            (bool sentBond, ) = payable(bondRecipient).call{value: escrow.disputeBond}("");
            require(sentBond, "Bond transfer failed");
        }

        emit DisputeResolved(_escrowId, _clientPercent, clientShare, freelancerShare);
        emit FundsWithdrawn(_escrowId, clientShare);
        emit FundsWithdrawn(_escrowId, freelancerShare);

        if (escrow.currentMilestone >= escrow.milestones.length) {
            escrow.state = State.Completed;
        }

        escrow.disputeRaisedAt = 0;
        escrow.disputeRaiser = address(0);
        escrow.disputeBond = 0;
    }

    /// @notice Expire a dispute after max duration, releasing funds to the freelancer
    function expireDispute(uint256 _escrowId) external inState(_escrowId, State.Disputed) nonReentrant {
        Escrow storage escrow = escrows[_escrowId];
        require(
            block.timestamp >= escrow.disputeRaisedAt + MAX_DISPUTE_DURATION,
            "Dispute not expired"
        );

        Milestone storage milestone = escrow.milestones[escrow.currentMilestone];
        require(!milestone.isApproved, "Already approved");

        milestone.isApproved = true;
        escrow.currentMilestone++;

        (bool sentFreelancer, ) = payable(escrow.freelancer).call{value: milestone.amount}("");
        require(sentFreelancer, "Freelancer transfer failed");

        if (escrow.disputeBond > 0) {
            (bool sentBond, ) = payable(escrow.freelancer).call{value: escrow.disputeBond}("");
            require(sentBond, "Bond transfer failed");
        }

        escrow.state = escrow.currentMilestone >= escrow.milestones.length ? State.Completed : State.Active;

        emit DisputeExpired(_escrowId, escrow.currentMilestone - 1, milestone.amount);
        emit FundsWithdrawn(_escrowId, milestone.amount);

        escrow.disputeRaisedAt = 0;
        escrow.disputeRaiser = address(0);
        escrow.disputeBond = 0;
    }

    /// @notice Get escrow details
    function getEscrow(uint256 _escrowId) external view returns (
        address client,
        address freelancer,
        State state,
        uint256 currentMilestone,
        uint256 milestoneCount,
        uint256 totalAmount,
        address arbitrator,
        uint256 disputeTimeout,
        uint256 disputeRaisedAt,
        address disputeRaiser,
        uint256 disputeBond
    ) {
        Escrow storage escrow = escrows[_escrowId];
        return (
            escrow.client,
            escrow.freelancer,
            escrow.state,
            escrow.currentMilestone,
            escrow.milestones.length,
            escrow.totalAmount,
            escrow.arbitrator,
            escrow.disputeTimeout,
            escrow.disputeRaisedAt,
            escrow.disputeRaiser,
            escrow.disputeBond
        );
    }

    /// @notice Get milestone details
    function getMilestone(uint256 _escrowId, uint256 _milestoneId) external view returns (
        string memory description,
        uint256 amount,
        bool isCompleted,
        bool isApproved,
        uint256 completedAt,
        uint256 approvalTimeout
    ) {
        Escrow storage escrow = escrows[_escrowId];
        Milestone storage milestone = escrow.milestones[_milestoneId];
        return (
            milestone.description,
            milestone.amount,
            milestone.isCompleted,
            milestone.isApproved,
            milestone.completedAt,
            milestone.approvalTimeout
        );
    }

    /// @notice Get remaining time before auto-approval
    function getApprovalTimeout(uint256 _escrowId) external view returns (uint256) {
        Escrow storage escrow = escrows[_escrowId];
        if (escrow.currentMilestone >= escrow.milestones.length) {
            return 0;
        }
        Milestone storage milestone = escrow.milestones[escrow.currentMilestone];
        if (milestone.approvalTimeout > block.timestamp) {
            return milestone.approvalTimeout - block.timestamp;
        }
        return 0;
    }
}
