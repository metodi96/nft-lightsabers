const LightsaberAuction = artifacts.require('./LightsaberAuction')
const truffleAssert = require('truffle-assertions')
const { convertTokensToWei } = require('../utils/tokens')
const helper = require('ganache-time-traveler');

const SECONDS_IN_DAY = 86400
const NOW = Math.floor(new Date().getTime() / 1000)
const NEXT_DAY = NOW + SECONDS_IN_DAY
const THE_DAY_AFTER = NOW + 2 * SECONDS_IN_DAY

contract("LightsaberAuction", ([auctionCreator, bidderOne, bidderTwo]) => {
    let lightsaberAuction, snapshot, snapshotId;

    before(async () => {
        lightsaberAuction = await LightsaberAuction.new()
        await lightsaberAuction.mint('#0000FF', 'Anakin Skywalker', { from: auctionCreator })
    });

    describe('Auction deployment', async () => {
        it("...should deploy the Lightsaber auctioncontract successfully", async () => {
            assert.notEqual(lightsaberAuction.address, '', 'should not be empty');
            assert.notEqual(lightsaberAuction.address, 0x0, 'should not be the 0x0 address');
            assert.notEqual(lightsaberAuction.address, null, 'should not be null');
            assert.notEqual(lightsaberAuction.address, undefined, 'should not be undefined');
        })

        it('...should have a minimum price of 0.0001 ether defined', async () => {
            const minPrice = await lightsaberAuction.minimumPrice()
            assert.equal(minPrice, convertTokensToWei('0.0001'), 'the name should be LightsaberForge')
        })
    })

    describe('Auction creation', async () => {
        it("...should not be able to create an auction with end date < start date", async () => {
            await truffleAssert.reverts(lightsaberAuction.createAuction(0, THE_DAY_AFTER, NEXT_DAY, convertTokensToWei('0.0001'), { from: auctionCreator }));
        })

        it("...should not be able to create an auction with original price less than 0.0001 ether", async () => {
            await truffleAssert.reverts(lightsaberAuction.createAuction(0, NEXT_DAY, THE_DAY_AFTER, convertTokensToWei('0.00001'), { from: auctionCreator }));
        })

        it("...should not be able to create an auction with start time equal to block time", async () => {
            await truffleAssert.reverts(lightsaberAuction.createAuction(0, NOW, THE_DAY_AFTER, convertTokensToWei('0.00001'), { from: auctionCreator }));
        })

        it("...should emit an event after a successful auction creation", async () => {
            const result = await lightsaberAuction.createAuction(0, NEXT_DAY, THE_DAY_AFTER, convertTokensToWei('0.0001'), { from: auctionCreator })
            assert.equal(result.logs[2].event, 'AuctionCreated', 'should be the "AuctionCreated" event');
            assert.equal(result.logs[2].args.owner, auctionCreator, 'should log the owner of the auction');
            assert.equal(result.logs[2].args.tokenId, 0, 'should log the token id');
            assert.equal(result.logs[2].args.startDate, NEXT_DAY, 'should log the start date');
            assert.equal(result.logs[2].args.endDate, THE_DAY_AFTER, 'should log the end date');
            assert.equal(result.logs[2].args.highestBid, convertTokensToWei('0.0001'), 'should log the highest bid');
            assert.equal(result.logs[2].args.highestBidder, auctionCreator, 'should log the highest bidder');

            snapshot = await helper.takeSnapshot()
            snapshotId = snapshot['result'];
        })

        it("...should transfer the token to the auction smart contract", async () => {
            const ownerOfToken = await lightsaberAuction.lightsaberToOwner(0)
            assert.notEqual(ownerOfToken, auctionCreator, "the auction creator should not be the owner of the token anymore")
            assert.equal(ownerOfToken, lightsaberAuction.address, "the auction contract should be the owner of the token")
        })

        it("...should save the auction", async () => {
            const auction = await lightsaberAuction.tokenIdToAuction(0)
            const auctionEmpty = await lightsaberAuction.tokenIdToAuction(1)
            assert.notEqual(auction.startDate, 0, "Should save the auction")
            assert.equal(auctionEmpty.startDate, 0, "Should be empty")
        })

        it("...should not be able to create an auction if it exists already", async () => {
            await truffleAssert.reverts(lightsaberAuction.createAuction(0, NEXT_DAY, THE_DAY_AFTER, convertTokensToWei('0.0001'), { from: auctionCreator }));
        })
    })


    describe('Auction bid', async () => {
        it("...should not be able to bid on an auction that is not active due to timestamp", async () => {
            await helper.advanceTimeAndBlock(3 * SECONDS_IN_DAY); //advance 3 days
            await truffleAssert.reverts(lightsaberAuction.bidOnAuction(0, { from: bidderOne, value: convertTokensToWei('0.0002') }));
        })

        it("...should not be able to bid on an auction with less than the highest bid until now", async () => {
            await truffleAssert.reverts(lightsaberAuction.bidOnAuction(0, { from: bidderOne, value: convertTokensToWei('0.00001') }));
        })

        it("...should not be able to bid on an auction that has been closed by the owner", async () => {
            await truffleAssert.reverts(lightsaberAuction.bidOnAuction(0, { from: bidderOne, value: convertTokensToWei('0.0002') }));
        })

        it("...should emit an event after a successful bid on an auction", async () => {
            await helper.revertToSnapshot(snapshotId)
            const result = await lightsaberAuction.bidOnAuction(0, { from: bidderOne, value: convertTokensToWei('0.0002') })
            assert.equal(result.logs[0].event, 'AuctionBid', 'should be the "AuctionBid" event');
            assert.equal(result.logs[0].args.tokenId, 0, 'should log the token id');
            assert.equal(result.logs[0].args.highestBid, convertTokensToWei('0.0002'), 'should log the highest bid as 0.0002 tokens');
            assert.equal(result.logs[0].args.highestBidder, bidderOne, 'should log the highest bidder as bidderOne\'s address');
        })


        it("...should get the auction from the token id and it should have updated value", async () => {
            const auction = await lightsaberAuction.tokenIdToAuction(0)
            assert.equal(auction.highestBid, convertTokensToWei('0.0002'), "the highest bid should be 0.0002 tokens")
            assert.equal(auction.highestBidder, bidderOne, "bidderOne should be the highest bidder")
        })

        it("...should have an empty pending returns for the original auction creator", async () => {
            const pendingReturnsForOwner = await lightsaberAuction.pendingReturns(auctionCreator)
            assert.equal(pendingReturnsForOwner, 0, "auction creator should not be eligible for a return after the initial bid")
        })

        it("...should give a pendingReturn of 0.0002 tokens for bidderOne when bidderTwo bids a larger sum", async () => {
            await lightsaberAuction.bidOnAuction(0, { from: bidderTwo, value: convertTokensToWei('0.0003') })
            const pendingReturnsForBidderOne = await lightsaberAuction.pendingReturns(bidderOne)
            assert.equal(pendingReturnsForBidderOne, convertTokensToWei('0.0002'), "bidderOne is eligible for a return of 0.0002 tokens")
        })
    })


    describe('Auction end', async () => {
        it("...should not be able to end an auction triggered by anyone other than the owner", async () => {
            await truffleAssert.reverts(lightsaberAuction.endAuction(0, { from: bidderOne }));
        })

        it("...should not be able to end a nonexistent auction", async () => {
            await truffleAssert.reverts(lightsaberAuction.endAuction(1, { from: auctionCreator }));
        })

        it("...should show the auction contract as the owner of the token", async () => {
            const owner = await lightsaberAuction.lightsaberToOwner(0)
            assert.notEqual(owner, bidderTwo, 'the new owner should not be the bidderTwo')
            assert.equal(owner, lightsaberAuction.address, 'the new owner should be the smart contract')
        })

        it("...should emit an event when the auction has ended", async () => {
            const result = await lightsaberAuction.endAuction(0, { from: auctionCreator })
            assert.equal(result.logs[2].event, 'AuctionEnded', 'should be the "AuctionEnded" event');
            assert.equal(result.logs[2].args.tokenId, 0, 'should log the token id which is 0');
            assert.equal(result.logs[2].args.highestBid, convertTokensToWei('0.0003'), 'should log the highest bid as 0.0003 tokens');
            assert.equal(result.logs[2].args.highestBidder, bidderTwo, 'should log the highest bidder as bidderTwo\'s address');
        })

        it("...should not be able to end a closed auction", async () => {
            await truffleAssert.reverts(lightsaberAuction.endAuction(0, { from: auctionCreator }));
        })

        it("...should transfer the token to the highest bidder", async () => {
            const newOwner = await lightsaberAuction.lightsaberToOwner(0)
            assert.notEqual(newOwner, lightsaberAuction.address, 'the new owner should not be the auction contract')
            assert.equal(newOwner, bidderTwo, 'the new owner should be bidderTwo')
        })

        it("...should change the property ended of the struct Auction", async () => {
            await truffleAssert.reverts(lightsaberAuction.endAuction(0, { from: auctionCreator }));
        })
    })


    describe('Auction withdrawal for overbid bid', async () => {

        it("...should send the amount to bidderTwo which is 0", async () => {
            const pendingReturnsForBidderTwo = await lightsaberAuction.pendingReturns(bidderTwo)
            assert.equal(pendingReturnsForBidderTwo.toString(), 0, "bidderTwo should have an empty pending amount")
            const result = await lightsaberAuction.withdrawAnOverbidBid.call({ from: bidderTwo })
            assert.equal(result, true, "bidderTwo should also be able to call this")
        })

        it("...should send the amount to bidderOne which is 0.0002", async () => {
            await lightsaberAuction.withdrawAnOverbidBid({ from: bidderOne })
            const pendingReturnsForBidderOne = await lightsaberAuction.pendingReturns(bidderOne)
            assert.equal(pendingReturnsForBidderOne, 0, "bidderOne has been repaid")
        })
    })
});
