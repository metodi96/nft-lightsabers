// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

import "./LightsaberForge.sol";

contract LightsaberAuction is LightsaberForge {
    event AuctionCreated(
        address owner,
        uint256 tokenId,
        uint256 startDate,
        uint256 endDate,
        uint256 highestBid,
        address highestBidder
    );
    event AuctionBid(uint256 tokenId, uint256 highestBid, address highestBidder);
    event AuctionEnded(uint256 tokenId, uint256 highestBid, address highestBidder);

    struct Auction {
        address owner;
        uint256 tokenId;
        uint256 startDate;
        uint256 endDate;
        uint256 highestBid;
        address highestBidder;
        bool ended;
    }

    mapping(uint256 => Auction) public tokenIdToAuction;
    mapping(address => uint256) public pendingReturns;

    uint256 public minimumPrice = 0.0001 ether;

    modifier onlyOwner(uint256 _tokenId) {
        require(msg.sender == lightsaberToOwner[_tokenId], "Only the owner of the lightsaber token can call this function");
        _;
    }

    function createAuction(uint256 _tokenId, uint256 _startDate, uint256 _endDate, uint256 _highestBid) public onlyOwner(_tokenId) {
        require(tokenIdToAuction[_tokenId].startDate == 0, "An auction already exists for this token id");
        require(_startDate < _endDate, "Start date must be before end date");
        require(_highestBid >= minimumPrice, "The price should be at least 0.001 ether");
        require(_startDate > block.timestamp, "The action should not start in the past");
        Auction memory auction = Auction(msg.sender, _tokenId, _startDate, _endDate, _highestBid, msg.sender, false);
        tokenIdToAuction[_tokenId] = auction;

        //send the token to the smart contract
        _transfer(msg.sender, address(this), _tokenId);    
        emit AuctionCreated(msg.sender, _tokenId, _startDate, _endDate, _highestBid, msg.sender);
    }

    function bidOnAuction(uint256 _tokenId) public payable {
        require(tokenIdToAuction[_tokenId].endDate >= block.timestamp, "Auction is not active anymore");
        require(tokenIdToAuction[_tokenId].highestBid < msg.value, "The bid must be higher than the auction's price");
        require(!tokenIdToAuction[_tokenId].ended, "You cannot bid on an auction that has ended");
        Auction storage auction = tokenIdToAuction[_tokenId];

        //solidity documentation
        if (auction.highestBid > minimumPrice) {
            pendingReturns[auction.highestBidder] += auction.highestBid;
        }

        //update auction properties
        auction.highestBid = msg.value;
        auction.highestBidder = msg.sender;

        emit AuctionBid(_tokenId, msg.value, msg.sender);
    }

    function withdrawAnOverbidBid() public returns (bool) {
        uint256 amount = pendingReturns[msg.sender];
        if (amount > 0) {
            pendingReturns[msg.sender] = 0;
            //we try to send the amount back and if it fails just reset the pendingReturns for the sender
            if (!payable(msg.sender).send(amount)) {
                pendingReturns[msg.sender] = amount;
                return false;
            }
        }
        return true;
    }

    function endAuction(uint256 _tokenId) public onlyOwner(_tokenId) {
        require(tokenIdToAuction[_tokenId].startDate > 0, "Auction does not exist");
        require(!tokenIdToAuction[_tokenId].ended, "Auction has already ended");
        Auction storage auction = tokenIdToAuction[_tokenId];
        _transfer(address(this), auction.highestBidder, _tokenId);
        auction.ended = true;
        emit AuctionEnded(_tokenId, auction.highestBid, auction.highestBidder);
    }
}
