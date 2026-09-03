// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ChainVote {
    struct Candidate {
        string name;
        uint256 voteCount;
    }

    Candidate[] private candidates;

    mapping(address => bool) public hasVoted;

    event VoteCast(
        address indexed voter,
        uint256 indexed candidateId
    );

    constructor(string[] memory candidateNames) {
        require(candidateNames.length >= 2, "At least two candidates required");

        for (uint256 i = 0; i < candidateNames.length; i++) {
            require(
                bytes(candidateNames[i]).length > 0,
                "Candidate name cannot be empty"
            );

            candidates.push(
                Candidate({
                    name: candidateNames[i],
                    voteCount: 0
                })
            );
        }
    }

    function vote(uint256 candidateId) external {
        require(!hasVoted[msg.sender], "Address has already voted");
        require(candidateId < candidates.length, "Invalid candidate");

        hasVoted[msg.sender] = true;
        candidates[candidateId].voteCount++;

        emit VoteCast(msg.sender, candidateId);
    }

    function getCandidate(
        uint256 candidateId
    ) external view returns (string memory name, uint256 voteCount) {
        require(candidateId < candidates.length, "Invalid candidate");

        Candidate memory candidate = candidates[candidateId];

        return (candidate.name, candidate.voteCount);
    }

    function getCandidates() external view returns (Candidate[] memory) {
        return candidates;
    }

    function getCandidatesCount() external view returns (uint256) {
        return candidates.length;
    }
}