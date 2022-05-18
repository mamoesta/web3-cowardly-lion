// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const Preds = await hre.ethers.getContractFactory("PredictionManager");
  const preds = await Preds.deploy();
  accounts = await ethers.getSigners();
  owner = accounts[0]
  addr1 = accounts[1]
  addr2 = accounts[2]
  addr3 = accounts[3]
  const bet_amount = ethers.utils.parseEther('2').toBigInt();
  await preds.deployed();

  console.log("Preds deployed to:", preds.address);

  dummyPreds = [
    {"bidAddr": addr1.address, "challengerAddr": owner.address, "bidAmount":bet_amount,"challengerAmount":0,"bidOdds":44,"gameWinner":"tbd", "gameID":0,"bidWin":false, "hasChallenger":false, "isFinal":false, "listPointer":0},
    {"bidAddr": addr2.address, "challengerAddr": owner.address, "bidAmount":bet_amount,"challengerAmount":0,"bidOdds":75,"gameWinner":"tbd", "gameID":1,"bidWin":false, "hasChallenger":true, "isFinal":false, "listPointer":0},
    {"bidAddr": addr3.address, "challengerAddr": owner.address, "bidAmount":bet_amount,"challengerAmount":0,"bidOdds":22,"gameWinner":"tbd", "gameID":2,"bidWin":false, "hasChallenger":false, "isFinal":false, "listPointer":0}
  ]
  for(let i =0; i<3; i++){
    await preds.connect(accounts[i+1]).newBid(dummyPreds[i])
  };
  console.log("Added dummy preds");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
