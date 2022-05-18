const { messagePrefix } = require("@ethersproject/hash");
const { expect } = require("chai");
const { ethers } = require("hardhat");
const hre = require("hardhat");


describe("\nGetting started with Prediction and Game contracts\n", function (){
  let pred;
  let preds;
  let owner;
  let addr1;
  const bet_amount = ethers.utils.parseEther('100').toBigInt();
  const provider =  new ethers.getDefaultProvider(network = "http://127.0.0.1:8545/")
   
  beforeEach(async function () {
    // Get the ContractFactory and Signers here.

    accounts = await ethers.getSigners();
    owner = accounts[0]
    addr1 = accounts[1]
  });
  // You can nest describe calls to create subsections.
  describe("\nDeployment\n", function () {
    
   

    // If the callback function is async, Mocha will `await` it.
    it("Should set the right owner", async function () {

      pred = await ethers.getContractFactory("PredictionManager");
      game = await ethers.getContractFactory("GameManager");
      preds = await pred.deploy();
      games = await game.deploy();
      

      
      console.log("Owner start balance: ", await owner.getBalance())
      console.log("Prediction contract start balance: ", await provider.getBalance(preds.address))
      
      expect(await preds.owner()).to.equal(owner.address).to.equal(await games.owner());

    });
  });
  describe("\nPrediction Happy Path\n", function() {
    
    it("Create new bid, fill it with a challenger, finalize and pay out", async function (){
      singlePred = {"bidAddr": owner.address,"challengerAddr": addr1.address, "bidAmount": bet_amount,"challengerAmount": bet_amount,"bidOdds": 10, "gameWinner": owner.address, "gameID": 0, "bidWin": true, "hasChallenger": true, "isFinal": true, "listPointer":0}

      singleGame = {"id":0,"homeTeam":"Giants","awayTeam":"Tigers","homeScore":10, "awayScore":6,"isFinal":true,"isLocked":true, "startTime":30303030}

      await preds.getGameContractAddress(games.address);
      await games.createGame(singleGame);
      const validGame = await games.getGame(singlePred.gameID)
      if (validGame.homeTeam == "Giants"){
        
        await preds.newBid(singlePred, {value: bet_amount})
        cval = await preds.getMultiplier(owner.address);
        challenge = await preds.connect(addr1).updateBidWithChallenger(owner.address, addr1.address, {value: cval})
        await preds.bidWin(owner.address)
        //console.log("Prediction with challenger: ", await preds.predictions(owner.address))

        console.log("Does owner address have a bid?: ", await preds.hasBid(owner.address))
        await preds.returnResults(owner.address, 0)
        console.log("Does owner address have a bid?: ", await preds.hasBid(owner.address))
        console.log("Owner end balance: ",await owner.getBalance() )

      }
      else {
        console.log("Invalid game! But the test still passed!")
        expect(validGame.homeTeam).to.equal('')
      }
    });
  });
});
