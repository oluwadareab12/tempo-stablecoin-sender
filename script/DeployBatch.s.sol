// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "../contracts/BatchTransfer.sol";

contract DeployBatch {
    function run() external returns (BatchTransfer) {
        BatchTransfer batch = new BatchTransfer();
        return batch;
    }
}
