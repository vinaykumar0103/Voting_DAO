// Import necessary libraries for testing
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("VotingDao", function () {
    let votingDao; // Instance of the VotingDao contract
    let owner, addr1, addr2; // Declare variables for different Ethereum accounts (signers)

    // Function to deploy a new VotingDao contract before each test
    async function deployVotingDaoFixtures() {
        const [o, a1, a2] = await ethers.getSigners(); // Get available signers
        const VotingDao = await ethers.getContractFactory("VotingDao"); // Get the contract factory
        const votingDaoInstance = await VotingDao.deploy(); // Deploy the contract
        return { votingDao: votingDaoInstance, owner: o, addr1: a1, addr2: a2 }; // Return instances
    }

    // Before each test, deploy a new instance of VotingDao
    beforeEach(async () => {
        ({ votingDao, owner, addr1, addr2 } = await deployVotingDaoFixtures());
    });

    // Should create a new proposal
    it("Should create a new proposal", async function () {
        const expirationTime = 60; // Proposal is active for 1 minute
        const tx = await votingDao.createProposal("Proposal 1", expirationTime); // Create a proposal
        const receipt = await tx.wait(); // Wait for the transaction to be mined

        expect(receipt).to.not.be.null; // Ensure the transaction was successful

        const proposal = await votingDao.getProposal(1); // Retrieve proposal by ID 1
        expect(proposal.description).to.equal("Proposal 1"); // Check description matches
        expect(proposal.expirationTime).to.be.greaterThan(Math.floor(Date.now() / 1000)); // Ensure expiration time is in the future
    });

    // Should revert if expiration time is invalid
    it("Should revert if expiration time is invalid", async function () {
        const invalidExpirationTime = 0; // Invalid expiration time (0 seconds)
        await expect(votingDao.createProposal("Proposal 2", invalidExpirationTime)) // Attempt to create proposal with invalid time
            .to.be.revertedWith("Invalid expiration time"); // Expect revert with specific error message
    });

    // Should allow users to vote on proposals
    it("Should allow users to vote on proposals", async function () {
        const expirationTime = 60; // Proposal is active for 1 minute
        await votingDao.createProposal("Proposal 1", expirationTime); // Create a proposal

        await votingDao.connect(addr1).vote(1, true); // addr1 votes 'for' proposal ID 1
        const { votesFor } = await votingDao.getVoteCount(1); // Retrieve vote count for proposal ID 1
        expect(votesFor).to.equal(1); // Expect one vote in favor
    });

    // Should revert if user tries to vote twice
    it("Should revert if user tries to vote twice", async function () {
        const expirationTime = 60; // Proposal is active for 1 minute
        await votingDao.createProposal("Proposal 1", expirationTime); // Create a proposal

        await votingDao.connect(addr1).vote(1, true); // First vote by addr1
        await expect(votingDao.connect(addr1).vote(1, true)) // Attempt second vote by addr1
            .to.be.revertedWith("Already voted"); // Expect revert with specific error message
    });

    // Should revert if user tries to vote after expiration
    it("Should revert if user tries to vote after expiration", async function () {
        const expirationTime = 1; // Proposal active for only 1 second
        await votingDao.createProposal("Proposal 1", expirationTime); // Create a proposal

        // Wait for 2 seconds to ensure the proposal has expired
        await new Promise(resolve => setTimeout(resolve, 2000));

        await expect(votingDao.connect(addr1).vote(1, true)) // Attempt to vote after expiration
            .to.be.revertedWith("Voting period has expired"); // Expect revert with specific error message
    });
});