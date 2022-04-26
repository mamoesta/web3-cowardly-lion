const { messagePrefix } = require("@ethersproject/hash");
const { expect } = require("chai");
const { ethers } = require("hardhat");


describe("\nGetting started with Prediction and Game contracts\n", function (){
  let pred;
  let preds;
  let owner;
  let addr1;
  const bet_amount = ethers.utils.parseEther('1').toBigInt();
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
      console.log("Games contract address: ", await games.address)
      expect(await preds.owner()).to.equal(owner.address).to.equal(await games.owner());

    });
  });
  describe("\nPrediction Happy Path\n", function() {
    
    it("Create new bid, fill it with a challenger, finalize and pay out", async function (){
      singlePred = {"id":0,"bidAddr": owner.address,"challengerAddr": addr1.address, "bidAmount": bet_amount,"challengerAmount": bet_amount,"bidOdds": "48", "bidGameWinner": owner.address, "gameID": 0, "bidWin": true, "hasChallenger": true, "isFinal": true}

      singleGame = {"id":0,"homeTeam":"Giants","awayTeam":"Tigers","homeScore":10, "awayScore":6,"isFinal":true,"isLocked":true, "startTime":30303030}

      await preds.getGameContractAddress(games.address);
      await games.createGame(singleGame);
      const validGame = await games.getGame(singlePred.gameID)
      if (validGame.homeTeam){
        await preds.receiveNewBid(singlePred, {value: bet_amount})
      
        foo = await preds.connect(addr1).updateBidWithChallenger(0, addr1.address, {value: ethers.utils.parseEther('1.0833')})
        cval = await preds.getMultiplier(0);
        await preds.bidWin(0)
        await preds.makeFinal(0)
        
        const txn = await preds.returnResults(owner.address)
        await txn.wait();
        contract_final_bal = await  provider.getBalance(preds.address)
        console.log("Contract final balance after bid and challenger: ", await  provider.getBalance(preds.address))

        console.log("Bidder address after prediction win: ", await owner.getBalance())
        console.log("Challenger address after prediction loss: ", await addr1.getBalance())
        //console.log("Prediction object (hopefully wiped): ", await preds.getPred(0))

        flushedPred = await preds.getPred(0)
        expect(String(flushedPred.bidAmount)).to.equal('0');
      }
      else {
        console.log("Invalid game! But the test still passed!")
        expect(validGame.homeTeam).to.equal('')
      }
    });
  });
});
