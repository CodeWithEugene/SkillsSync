// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title SkillsRegistry
/// @notice Stores a single attestation (profile hash + timestamp) per address.
///         Full skill data lives off-chain; on-chain hash enables verification.
contract SkillsRegistry {
    struct Attestation {
        bytes32 profileHash;
        uint256 timestamp;
    }

    mapping(address => Attestation) public attestations;

    event AttestationRecorded(address indexed user, bytes32 profileHash, uint256 timestamp);

    /// @notice Record or update the caller's skill profile attestation.
    /// @param profileHash keccak256 hash of canonical skill profile (computed off-chain).
    function recordAttestation(bytes32 profileHash) external {
        attestations[msg.sender] = Attestation(profileHash, block.timestamp);
        emit AttestationRecorded(msg.sender, profileHash, block.timestamp);
    }

    /// @notice Get the latest attestation for a user.
    /// @param user Address to query.
    /// @return profileHash Stored profile hash (zero if never attested).
    /// @return timestamp Block timestamp of the attestation (0 if never attested).
    function getAttestation(address user) external view returns (bytes32 profileHash, uint256 timestamp) {
        Attestation memory a = attestations[user];
        return (a.profileHash, a.timestamp);
    }
}
