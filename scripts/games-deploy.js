// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const { string } = require("@nomiclabs/buidler/internal/core/params/argumentTypes");
const hre = require("hardhat");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const Games = await hre.ethers.getContractFactory("GameManager");
  const games = await Games.deploy();

  await games.deployed();

  console.log("Games deployed to:", games.address);
  dummyGames = [
    {"id": "0", "homeTeam": "Detroit Tigers", "awayTeam":"San Francisco Giants","homeScore":"0","awayScore":"0","isFinal":false, "isLocked":false,"startTime":20203392},
    {"id": "1", "homeTeam": "Baltimore Orioles", "awayTeam":"Oakland A's","homeScore":"0","awayScore":"0","isFinal":false, "isLocked":false,"startTime":20203599},
    {"id": "2", "homeTeam": "San Diego Padres", "awayTeam":"LA Dodgers","homeScore":"4","awayScore":"1","isFinal":false, "isLocked":false,"startTime":20206921},
    {"id": "3", "homeTeam": "Houston Astros", "awayTeam":"Atlanta Braves","homeScore":"1","awayScore":"2","isFinal":true, "isLocked":false,"startTime":20208888}
  ]
  for(let i =0; i<4; i++){
    await games.createGame(dummyGames[i])
  };
  console.log("Added dummy games");

}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
