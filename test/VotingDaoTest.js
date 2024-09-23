const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("VotingDao", function () {
    let votingDao; // Declare votingDao at a higher scope
    let owner, addr1, addr2; // Declare signers at a higher scope

    async function deployVotingDaoFixtures() {
        const [o, a1, a2] = await ethers.getSigners();
        const VotingDao = await ethers.getContractFactory("VotingDao");
        const votingDaoInstance = await VotingDao.deploy(); // Deploy contract here
        return { votingDao: votingDaoInstance, owner: o, addr1: a1, addr2: a2 };
    }

    beforeEach(async () => {
        ({ votingDao, owner, addr1, addr2 } = await deployVotingDaoFixtures());
    });

 describe("Proposal Creation", function () {
        it("Should create a new proposal", async function () {
            const expirationTime = 60; // 1 minute
            const tx = await votingDao.createProposal("Proposal 1", expirationTime);
            const receipt = await tx.wait();

            expect(receipt).to.not.be.null; // Ensure transaction was successful

            const proposal = await votingDao.getProposal(1); // Check proposal ID 1
            expect(proposal.description).to.equal("Proposal 1");
            expect(proposal.expirationTime).to.be.greaterThan(Math.floor(Date.now() / 1000));
        });

        it("Should revert if expiration time is invalid", async function () {
            const invalidExpirationTime = 0; // Past time
            await expect(votingDao.createProposal("Proposal 2", invalidExpirationTime))
                .to.be.revertedWith("Invalid expiration time");
        });
      });

     describe("Voting Logic", function () {
        beforeEach(async function () {
            const expirationTime = 60; // 1 minute
            await votingDao.createProposal("Proposal 1", expirationTime);
        });

        it("Should allow users to vote on proposals", async function () {
            await votingDao.connect(addr1).vote(1, true);
            const { votesFor } = await votingDao.getVoteCount(1);
            expect(votesFor).to.equal(1);
        });

        it("Should revert if user tries to vote twice", async function () {
            await votingDao.connect(addr1).vote(1, true); // First vote
            await expect(votingDao.connect(addr1).vote(1, true)) // Second vote
                .to.be.revertedWith("Already voted");
        });

        it("Should revert if user tries to vote after expiration", async function () {
            const expirationTime = 1; // 1 second
            await votingDao.createProposal("Proposal 1", expirationTime);

            // Wait for 2 seconds to ensure the proposal has expired
            await new Promise(resolve => setTimeout(resolve, 2000));

            await expect(votingDao.connect(addr1).vote(1, true))
                .to.be.revertedWith("Voting period has expired");
        });
    });

    describe("Accessing Proposal Data", function () {
        it("Should return correct proposal data", async function () {
            const expirationTime = Math.floor(Date.now() / 1000) + 60;
            await votingDao.createProposal("Proposal 1", expirationTime);

            const proposal = await votingDao.getProposal(0);
            expect(proposal.title).to.equal("Proposal 1");
            expect(proposal.expiration).to.be.greaterThan(Math.floor(Date.now() / 1000));
        });

        it("Should return correct vote counts", async function () {
            const expirationTime = Math.floor(Date.now() / 1000) + 60;
            await votingDao.createProposal("Proposal 1", expirationTime);
            await votingDao.connect(addr1).vote(0, true);
            await votingDao.connect(addr2).vote(0, false);

            const yesVotes = await votingDao.getVoteCount(0, true);
            const noVotes = await votingDao.getVoteCount(0, false);

            expect(yesVotes).to.equal(1);
            expect(noVotes).to.equal(1);
        });
    });
});
