// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test, console2} from "forge-std/Test.sol";
import {SkillsRegistry} from "../src/SkillsRegistry.sol";

contract SkillsRegistryTest is Test {
    SkillsRegistry public registry;

    address public user1 = address(0x1);
    address public user2 = address(0x2);

    function setUp() public {
        registry = new SkillsRegistry();
    }

    function test_recordAndGetAttestation() public {
        bytes32 hash = keccak256("skill-profile-v1");
        vm.prank(user1);
        registry.recordAttestation(hash);

        (bytes32 storedHash, uint256 ts) = registry.getAttestation(user1);
        assertEq(storedHash, hash);
        assertEq(ts, block.timestamp);
    }

    function test_updateOverwrites() public {
        bytes32 hash1 = keccak256("profile-v1");
        bytes32 hash2 = keccak256("profile-v2");

        vm.prank(user1);
        registry.recordAttestation(hash1);
        vm.warp(block.timestamp + 100);
        vm.prank(user1);
        registry.recordAttestation(hash2);

        (bytes32 storedHash,) = registry.getAttestation(user1);
        assertEq(storedHash, hash2);
    }

    function test_unchangedUserReturnsZero() public {
        (bytes32 storedHash, uint256 ts) = registry.getAttestation(user2);
        assertEq(storedHash, bytes32(0));
        assertEq(ts, 0);
    }

    function test_emitsAttestationRecorded() public {
        bytes32 hash = keccak256("profile");
        vm.prank(user1);
        vm.expectEmit(true, true, true, true);
        emit SkillsRegistry.AttestationRecorded(user1, hash, block.timestamp);
        registry.recordAttestation(hash);
    }
}
