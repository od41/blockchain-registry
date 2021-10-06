//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Registry is ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private _profileIds;
    Counters.Counter private _profilesCreated;

    address _admin;

    uint256 regFee = 0.01 ether;

    struct Profile {
        uint profileId;
        string firstName;
        string lastName;
        address owner;
    }

    mapping(uint256 => Profile) private Profiles;

    event ProfileRegistered(
        uint indexed profileId,
        string firstName,
        string lastName,
        address creator
    );

    event ProfileDeleted(
        uint indexed profileId,
        address creator
    );

    constructor(address admin) {
        _admin = admin
    }

    function createRecord(string memory firstName, string memory lastName) public payable {
        require(msg.value == regFee, "Set reg fee to 0.01 ETH");
        // address existingOwner = address(0);
        // require(msg.sender != existingRecord, "Cannot create multiple records with the same address");
        
        _profileIds.increment();
        uint256 profileId = _profileIds.current();

        // create record
        Profiles[profileId] = Profile(profileId, firstName, lastName, msg.sender)

        // make payment 
        IERC721().transferFrom(msg.sender, address(this), profileId);

        // emit event
        emit ProfileRegistered(profileId, firstName, lastName, msg.sender);

    }

    function fetchRecords() public view returns (Profile[] memory) {
        // display records: first, last and id
        uint profileCount = _profileIds.current();
        uint currentIndex = 1;

        Profile[] memory profiles = new Profile[](profileCount);
        for (uint i = 1; i <= profileCount; i++) {
            profiles[currentIndex] = Profiles[i];
            currentIndex += 1;
        }
        return profiles;
    }

    function deleteRecord(uint profileId) public {
        // require msg.sender to be owner
        // require msg.sender to be admin
        // delete record with id
    }
}
