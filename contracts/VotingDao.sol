// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Importing EnumerableSet from OpenZeppelin to manage a set of unique values
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

contract VotingDao {
    using EnumerableSet for EnumerableSet.UintSet; // Use EnumerableSet for managing proposal IDs

    // Struct to represent a Proposal
    struct Proposal {
        uint256 id;                // Unique identifier for the proposal
        string description;        // Description of the proposal
        uint256 expirationTime;    // Time when voting ends (timestamp)
        uint256 votesFor;          // Count of votes in favor
        uint256 votesAgainst;      // Count of votes against
        bool active;               // Indicates if the proposal is active
    }

    // Proposal ID counter to generate unique IDs for proposals
    uint256 private _proposalIdCounter;

    // Mapping to store proposals by their ID
    mapping(uint256 => Proposal) private proposals;

    // Mapping to track if a user has voted on a specific proposal
    mapping(uint256 => mapping(address => bool)) private hasVoted;

    // Set to store all proposal IDs for easy retrieval
    EnumerableSet.UintSet private proposalIds;

    // Events to log important actions in the contract
    event ProposalCreated(uint256 indexed proposalId, address indexed creator, string description, uint256 expirationTime);
    event VoteCast(address indexed voter, uint256 indexed proposalId, bool voteFor);

    // Function to create a new proposal (any user can create)
    function createProposal(string calldata description, uint256 durationInSeconds) external {
        require(durationInSeconds > 0, "Invalid expiration time"); // Ensure the duration is valid

        _proposalIdCounter++; // Increment the proposal ID counter to get a new ID
        uint256 newProposalId = _proposalIdCounter; // Store the new proposal ID

        // Create and store the new proposal in the mapping
        proposals[newProposalId] = Proposal({
            id: newProposalId,
            description: description,
            expirationTime: block.timestamp + durationInSeconds, // Set expiration time based on current time and duration
            votesFor: 0,         // Initialize votes for as 0
            votesAgainst: 0,     // Initialize votes against as 0
            active: true         // Set the proposal as active
        });

        proposalIds.add(newProposalId); // Add the new proposal ID to the set

        emit ProposalCreated(newProposalId, msg.sender, description, proposals[newProposalId].expirationTime); // Emit event for proposal creation
    }

    // Function to vote on a proposal (true = for, false = against)
    function vote(uint256 proposalId, bool voteFor) external {
        Proposal storage proposal = proposals[proposalId]; // Retrieve the specified proposal

        require(proposal.active, "Proposal is not active");                   // Check if the proposal is active
        require(block.timestamp <= proposal.expirationTime, "Voting period has expired");  // Check if voting is still open
        require(!hasVoted[proposalId][msg.sender], "Already voted");          // Ensure that the user hasn't voted already

        hasVoted[proposalId][msg.sender] = true;  // Mark the user as having voted

        // Update vote counts based on whether the user voted for or against the proposal
        if (voteFor) {
            proposal.votesFor++;                    // Increment votes for if user voted for
        } else {
            proposal.votesAgainst++;                // Increment votes against if user voted against
        }

        emit VoteCast(msg.sender, proposalId, voteFor);  // Emit event for vote casting
    }

    // Function to check if a proposal is active or closed based on expiration time
    function isProposalActive(uint256 proposalId) public view returns (bool) {
        Proposal storage proposal = proposals[proposalId];   // Retrieve the specified proposal
        return proposal.active && block.timestamp <= proposal.expirationTime;  // Return true if active and not expired
    }

    // Function to get vote counts for a specific proposal
    function getVoteCount(uint256 proposalId) public view returns (uint256 votesFor, uint256 votesAgainst) {
        Proposal storage proposal = proposals[proposalId];  // Retrieve the specified proposal
        return (proposal.votesFor, proposal.votesAgainst);   // Return current vote counts
    }

    // Function to retrieve details of a specific proposal by its ID
    function getProposal(uint256 proposalId) public view returns (Proposal memory) {
        return proposals[proposalId];  // Return the entire Proposal struct for the given ID
    }

    // Function to retrieve all stored proposal IDs as an array
    function getAllProposalIds() public view returns (uint256[] memory) {
        return proposalIds.values();   // Return all values from the EnumerableSet containing IDs of proposals
    }

    // Function to check if a specific user has voted on a given proposal
    function hasUserVoted(uint256 proposalId, address user) public view returns (bool) {
        return hasVoted[proposalId][user];  // Return true if the user has voted on this specific proposal
    }
}