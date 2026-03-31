// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import {VaultPayEscrow} from "../src/VaultPayEscrow.sol";

contract DeployScript is Script {
    function run() external {
        address feeRecipient = vm.envAddress("FEE_RECIPIENT");
        uint256 feeBps = vm.envUint("FEE_BPS");

        vm.startBroadcast();
        VaultPayEscrow escrow = new VaultPayEscrow(feeRecipient, feeBps);
        vm.stopBroadcast();

        console.log("VaultPayEscrow deployed at:", address(escrow));
    }
}
