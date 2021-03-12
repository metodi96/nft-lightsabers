const LightsaberAuction = artifacts.require('./LightsaberAuction')
const truffleAssert = require('truffle-assertions')
const { convertTokensToWei } = require('../utils/tokens')

const SECONDS_IN_DAY = 86400
const NOW = Math.floor(new Date().getTime() / 1000)
const NEXT_DAY = NOW + SECONDS_IN_DAY
const THE_DAY_AFTER = NOW + 2 * SECONDS_IN_DAY

contract("LightsaberAuction", ([auctionCreator, BidderOne, BidderTwo]) => {
    let lightsaberAuction;

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
});
