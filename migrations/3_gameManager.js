const gameManager = artifacts.require("gameManager");

module.exports = function (deployer) {
  deployer.deploy(gameManager);
};
