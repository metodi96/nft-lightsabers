// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

import "../node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract LightsaberForge is ERC721 {

    event LightsaberCreated(string colorCrystal, string hilt);

    struct Lightsaber {
        string colorCrystal;
        string hilt;
    }

    mapping (uint256 => address) public lightsaberToOwner;
    mapping (bytes32 => bool) public combinationExists;

    Lightsaber[] public lightsabers;

    constructor() ERC721("LightsaberForge", "LSF") {}

    function mint(string memory _colorCrystal, string memory _hilt) public {
        require(!combinationExists[keccak256(abi.encode(_colorCrystal, _hilt))], "This combination cannot exist more than once.");
        require(keccak256(abi.encode(_colorCrystal)) != keccak256(abi.encode("")), "The color should not be empty");
        require(keccak256(abi.encode(_hilt)) != keccak256(abi.encode("")), "The hilt should not be empty");
         lightsabers.push(Lightsaber(_colorCrystal, _hilt));
         uint256 _id = lightsabers.length - 1;
        _mint(msg.sender, _id);
        lightsaberToOwner[_id] = msg.sender;
        bytes32 _combination = keccak256(abi.encode(_colorCrystal, _hilt));
        combinationExists[_combination] = true;

        emit LightsaberCreated(_colorCrystal, _hilt);
    }

}