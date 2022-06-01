
const { expect } = require("chai");
const { ethers } = require("hardhat");
const {deployPreds} = "../scripts/preds-deploy.js";

describe("\nGetting started with Prediction and Game contracts\n", function (){
  let pred;
  let preds;
  let game;
  let games;
  let owner;
  let addr1;
  const bet_amount = ethers.utils.parseEther('2').toBigInt();
  const provider =  new ethers.getDefaultProvider(network = "http://127.0.0.1:8545/")
  
   
  beforeEach(async function () {
    // Get the ContractFactory and Signers here.

    accounts = await ethers.getSigners();
    owner = accounts[0]
    addr1 = accounts[1]
  });
  // You can nest describe calls to create subsections.
  describe("Deployment\n", function () {
    // If the callback function is async, Mocha will `await` it.
    it("Should set the right owner", async function () {

      pred = await ethers.getContractFactory("PredictionManager");
      game = await ethers.getContractFactory("GameManager");
      preds = await pred.deploy();
      games = await game.deploy();
      await deployDummyPreds(preds);

      console.log("Owner start balance: ", await owner.getBalance())
      console.log("Prediction contract start balance: ", await provider.getBalance(preds.address))
      console.log("We should have 3 predictions right now: ", await preds.getPredCount())
      expect(await preds.owner()).to.equal(owner.address).to.equal(await games.owner());

    });
  });
  describe("E2E Happy path\n", function() {
    
    it("Creates a new bid, fill it with a challenger, finalize and pay out to bidder", async function (){
      
      singlePred = {"bidAddr": owner.address,"challengerAddr": addr1.address, "bidAmount": bet_amount,"challengerAmount": bet_amount,"bidOdds": 50, "gameWinner": owner.address, "gameID": 0, "bidWin": false, "hasChallenger": true, "isLocked": true, "listPointer":0, isStale: false}
      singleGame = {"id":0,"homeTeam":"Giants","awayTeam":"Tigers","homeScore":10, "awayScore":6,"isLocked":true,"isLocked":true, "startTime":30303030}

      await preds.getGameContractAddress(games.address);
      await games.createGame(singleGame);
      const validGame = await games.getGame(singlePred.gameID)
      if (validGame.homeTeam){
        
        await preds.handleBidInfo(singlePred, {value: bet_amount})
        cval = await preds.getMultiplier(owner.address);
        challenge = await preds.connect(addr1).updateBidWithChallenger(owner.address, addr1.address, {value: cval})
        
        await preds.makeFinal(owner.address);
        await preds.bidWin(owner.address);
        console.log("We should have 4 predictions right now: ", await preds.getPredCount())
        

        await preds.returnResults(owner.address);
        console.log("Bidder ETH:", await owner.getBalance());
        console.log("Challenger ETH:", await addr1.getBalance());
        
      }
      else {
        console.log("Invalid game! But the test still passed!")
        expect(validGame.homeTeam).to.equal('')
      }
    });
  });
  describe("Adding a fresh pred", function () {
    it("Should allow me to add a fresh pred for the new address", async function () {
        //submit a new pred
        newPred = {"bidAddr": owner.address,"challengerAddr": addr1.address, "bidAmount": bet_amount,"challengerAmount": bet_amount,"bidOdds": 20, "gameWinner": owner.address, "gameID": 0, "bidWin": false, "hasChallenger": true, "isLocked": true, "listPointer":0, isStale: false}
        //console.log("Game:" , await games.getGame(0))
        
        await preds.handleBidInfo(newPred, {value: bet_amount})
        //console.log(await preds.predictions(owner.address))
        //console.log(await preds.predList(0))

    });
  });
});

async function deployDummyPreds(preds) {
  
  accounts = await ethers.getSigners();
  owner = accounts[0]
  addr1 = accounts[1]
  addr2 = accounts[2]
  addr3 = accounts[3]
  const bet_amount = ethers.utils.parseEther('2').toBigInt();
  
  dummyPreds = [
    {"bidAddr": addr1.address, "challengerAddr": owner.address, "bidAmount":bet_amount,"challengerAmount":0,"bidOdds":44,"gameWinner":"tbd", "gameID":0,"bidWin":false, "hasChallenger":false, "isLocked":false, "listPointer":0, isStale: false},
    {"bidAddr": addr2.address, "challengerAddr": owner.address, "bidAmount":bet_amount,"challengerAmount":0,"bidOdds":75,"gameWinner":"tbd", "gameID":1,"bidWin":false, "hasChallenger":true, "isLocked":false, "listPointer":0, isStale: false},
    {"bidAddr": addr3.address, "challengerAddr": owner.address, "bidAmount":bet_amount,"challengerAmount":0,"bidOdds":22,"gameWinner":"tbd", "gameID":2,"bidWin":false, "hasChallenger":false, "isLocked":false, "listPointer":0, isStale: false}
  ]

  for(let i =0; i<3; i++){
    await preds.connect(accounts[i+1]).newBid(dummyPreds[i])
    const options = {value: await preds.getMultiplier(String(accounts[i+1].address))}
    await preds.updateBidWithChallenger(String(accounts[i+1].address), String(owner.address), options)
    //await preds.connect(accounts[i+1]).makeFinal(accounts[i+1].address)
  };
  console.log("Added dummy preds");
}
