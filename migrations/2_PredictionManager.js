const PredictionManager = artifacts.require("PredictionManager");

module.exports = function (deployer) {
  deployer.deploy(PredictionManager);
};