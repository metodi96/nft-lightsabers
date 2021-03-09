const LightsaberForge = artifacts.require("LightsaberForge");

module.exports = async (deployer, network, accounts) => {
  deployer.deploy(LightsaberForge);
};
