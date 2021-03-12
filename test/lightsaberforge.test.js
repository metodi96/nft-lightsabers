const LightsaberForge = artifacts.require('./LightsaberForge')
const truffleAssert = require('truffle-assertions')

contract("LightsaberForge", ([user]) => {
    let lightsaberForge;

    before(async () => {
        lightsaberForge = await LightsaberForge.new()
    });

    describe('Forge deployment', async () => {
        it("...should deploy the Lightsaber contract successfully", async () => {
            console.log('Address is ', lightsaberForge.address)
            assert.notEqual(lightsaberForge.address, '', 'should not be empty');
            assert.notEqual(lightsaberForge.address, 0x0, 'should not be the 0x0 address');
            assert.notEqual(lightsaberForge.address, null, 'should not be null');
            assert.notEqual(lightsaberForge.address, undefined, 'should not be undefined');
        })

        it('...should have a name and a symbol', async () => {
            const name = await lightsaberForge.name()
            assert.equal(name, 'LightsaberForge', 'the name should be LightsaberForge')
            const symbol = await lightsaberForge.symbol()
            assert.equal(symbol, 'LSF', 'the symbol should be LS')
        })
    })

    describe('Forge (mint) a lightsaber', async () => {

        it('...should not be able to mint using an empty color', async () => {
            await truffleAssert.reverts(lightsaberForge.mint('', 'Anakin Skywalker'));
        })
        it('...should not be able to mint using an empty hilt', async () => {
            await truffleAssert.reverts(lightsaberForge.mint('#0000FF', ''));
        })

        it("...should mint a lightsaber successfully", async () => {
            const result = await lightsaberForge.mint('#0000FF', 'Anakin Skywalker')
            const totalSupply = await lightsaberForge.totalSupply()
            assert.equal(totalSupply, 1, 'should have a total supply of 1')
            assert.equal(result.logs.length, 2, 'should trigger two events');
            assert.equal(result.logs[0].event, 'Transfer', 'should be the "LightsaberCreated" event');
            assert.equal(result.logs[0].args.from, 0x0000000000000000000000000000000000000000, 'should log the caller of the function');
            assert.equal(result.logs[0].args.to, user, 'should log the recipient');
            assert.equal(result.logs[0].args.tokenId, totalSupply - 1, 'should log the token id which is 0');
            assert.equal(result.logs[1].event, 'LightsaberCreated', 'should be the "LightsaberCreated" event');
            assert.equal(result.logs[1].args.colorCrystal, '#0000FF', 'should log the caller of the function');
            assert.equal(result.logs[1].args.hilt, 'Anakin Skywalker', 'should log the number of staked tokens');
        })

        it('...should not be able to mint the same lightsaber', async () => {
            await truffleAssert.reverts(lightsaberForge.mint('#0000FF', 'Anakin Skywalker'));
        })

    })

    describe('Listing tokens correctly', async () => {
        it('...should list the newly added tokens correctly', async () => {
            // Mint 3 more tokens
            await lightsaberForge.mint('#555555', 'Count Dooku')
            await lightsaberForge.mint('#444444', 'Obi Wan Kenobi')
            await lightsaberForge.mint('#333333', 'Anakin Skywalker')
            const totalSupply = await lightsaberForge.totalSupply()

            let lightsaberObj
            let result = []

            for (let i = 1; i <= totalSupply; i++) {
                lightsaberObj = await lightsaberForge.lightsabers(i - 1)
                result.push(lightsaberObj.colorCrystal + lightsaberObj.hilt)
            }
            let expected = ['#0000FFAnakin Skywalker', '#555555Count Dooku', '#444444Obi Wan Kenobi', '#333333Anakin Skywalker']
            assert.equal(result.join(','), expected.join(','))
        })
    })
});
