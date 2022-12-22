//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Registry is ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private _profileIds;
    Counters.Counter private _profilesCreated;

    uint private random;

    address public admin;

    uint256 private regFee = 0.0001 ether;

    mapping(address => bool) public hasExistingProfile;

    struct Profile {
        uint profileId;
        string name;
        string message;
        address creator;
    }

    mapping(uint256 => Profile) private Profiles;

    event ProfileRegistered(
        uint indexed profileId,
        string name,
        string message,
        address creator
    );

    event ProfileDeleted(
        uint indexed profileId,
        address creator
    );

    constructor(address _admin) {
        admin = _admin;
    }

    function setRegFee(uint256 _regFee) public {
        require(msg.sender == admin, "Only admin can set registration fee");
        regFee = _regFee;
    }

    function createRecord(string memory _name, string memory _message) public payable {
        require(msg.value >= regFee, "Set registration fee to a minimum 0.0001 ETH");
        
        _profilesCreated.increment();
        _profileIds.increment();
        uint256 profileId = _profileIds.current();

        // create record
        Profiles[profileId] = Profile(profileId, _name, _message, msg.sender);

        // make payment 
        payable(address(this));

        hasExistingProfile[msg.sender] = true;
        // emit event
        emit ProfileRegistered(profileId, _name, _message, msg.sender);

    }

    function fetchRecord( uint profileId) public view returns(Profile memory) {
        Profile memory profile = Profiles[profileId];
        return profile;
    }

    function fetchRecords() public view returns (Profile[] memory) {
        // display records: first, last and id
        uint profileCount = _profilesCreated.current();
        uint currentIndex = 0;

        Profile[] memory profiles = new Profile[](profileCount);
        for (uint i = 0; i < profileCount; i++) {
            profiles[currentIndex] = Profiles[i+1];
            currentIndex += 1;
        }
        
        return profiles;
    }

    function deleteRecord(uint profileId) public returns (bool success) {
       
        // require msg.sender to be owner
        // require msg.sender to be admin
        require(Profiles[profileId].creator == msg.sender || admin == msg.sender, "Only record creator or the admin can delete a profile");

        // require record to exist
        require(Profiles[profileId].creator != address(0), "Error, record doesn't exist.");
    
        delete Profiles[profileId];
        _profilesCreated.decrement();
        emit ProfileDeleted(profileId, msg.sender);
        
         hasExistingProfile[msg.sender] = false;
        
        return true;
    }
}
