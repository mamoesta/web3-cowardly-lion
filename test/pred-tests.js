const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Prediction Contract", function (){
  let pred;
  let preds;
  let owner;
  let addr1;
  
  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    pred = await ethers.getContractFactory("PredictionManager");
    accounts = await ethers.getSigners();
    owner = accounts[0]
    addr1 = accounts[1]
    preds = await pred.deploy();
    bet_amount = 500000000000
    // fund contract
    owner.sendTransaction({"to":preds.address, "value":bet_amount})
  });
  // You can nest describe calls to create subsections.
  describe("Deployment", function () {
    // `it` is another Mocha function. This is the one you use to define your
    // tests. It receives the test name, and a callback function.

    // If the callback function is async, Mocha will `await` it.
    it("Should set the right owner", async function () {
      // Expect receives a value, and wraps it in an Assertion object. These
      // objects have a lot of utility methods to assert values.

      // This test expects the owner variable stored in the contract to be equal
      // to our Signer's owner.
      console.log("Owner start balance: ", await owner.getBalance())
      expect(await preds.owner()).to.equal(owner.address);
    });
  });
  describe("Sending a pred and a challenger", function() {
    bet_amount = 500000000000
    it("Sending a prediction object, retrieving it, adding a challenger, retreiving it again", async function (){
      singlePred = {"id":0,"bidAddr": owner.address,"challengerAddr": addr1.address, "bidAmount": bet_amount,"challengerAmount":1,"bidOdds": "50", "bidGameWinner": owner.address, "gameID": 0, "bidWin": true, "hasChallenger": true, "isFinal": true}

      txn = await preds.receiveNewBid(singlePred)
      // get the first pred
      txn = await preds.getPred(0)

      //update with challenge
      txn = await preds.updateBidWithChallenger(0, addr1.address, bet_amount)
    
      await preds.makeFinal(0)
      await preds.bidWin(0)
      bal_before = await owner.getBalance()

      await preds.returnResults()
      bal_after = await owner.getBalance()
      console.log("Balance difference: ", bal_after - bal_before)
    });
  });
});
