const LightsaberForge = artifacts.require("LightsaberForge");
const LightsaberAuction = artifacts.require("LightsaberAuction");

module.exports = async (deployer, network, accounts) => {
  deployer.deploy(LightsaberAuction);
};
