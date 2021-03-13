# nft-lightsabers
Use the ERC-721 standard for non-fungible tokens to allow users to generate their own custom made lightsabers and sell them to interested parties via auctions

# Development

## Setup

Make sure to have a local development Ethereum blockchain started (e.g. Ganache) and also a wallet provider such as MetaMask connected to that development blockchain. 
Then you can run the following commands deploy the smart contracts and also test them.

```PS
npm install     # install dependencies such as truffle-assertions, @openzeppelin/contracts and ganache-time-traveler
truffle migrate # build and deploy the smart contract LightsaberAuction - since it inherits from the LightsaberForge we do not need to deploy the other one
truffle test    # run the tests
```

If at some point you would like to redeploy the contracts just run the command

```PS
truffle migrate --reset # build and redeploy the smart contract
```
