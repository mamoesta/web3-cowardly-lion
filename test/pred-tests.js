const { messagePrefix } = require("@ethersproject/hash");
const { expect } = require("chai");
const { ethers } = require("hardhat");


describe("Prediction Contract", function (){
  let pred;
  let preds;
  let owner;
  let addr1;
  const bet_amount = ethers.utils.parseEther('5').toBigInt();
   
  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    pred = await ethers.getContractFactory("PredictionManager");
    accounts = await ethers.getSigners();
    owner = accounts[0]
    addr1 = accounts[1]
    preds = await pred.deploy();
    
    const provider =  new ethers.getDefaultProvider(network = "http://127.0.0.1:8545/")
    console.log("Owner start balance: ", await owner.getBalance())
    console.log("Contract start balance: ", await  provider.getBalance(preds.address))
   

  });
  // You can nest describe calls to create subsections.
  describe("Deployment", function () {
    
   

    // If the callback function is async, Mocha will `await` it.
    it("Should set the right owner", async function () {
      // Expect receives a value, and wraps it in an Assertion object. These
      // objects have a lot of utility methods to assert values.

      // This test expects the owner variable stored in the contract to be equal
      // to our Signer's owner.

      // fund contract

      expect(await preds.owner()).to.equal(owner.address);
    });
  });
  describe("Prediction Happy Path", function() {
    
    it("Create new bid, fill it with a challenger, finalize and pay out", async function (){
      singlePred = {"id":0,"bidAddr": owner.address,"challengerAddr": addr1.address, "bidAmount": bet_amount,"challengerAmount":bet_amount,"bidOdds": "50", "bidGameWinner": owner.address, "gameID": 0, "bidWin": true, "hasChallenger": true, "isFinal": true}

      await preds.receiveNewBid(singlePred, {value: bet_amount})
      
      await preds.connect(addr1).updateBidWithChallenger(0, addr1.address, bet_amount, {value: bet_amount})

      
      await preds.bidWin(0)
      await preds.makeFinal(0)
      
      const txn = await preds.returnResults(owner.address)
      await txn.wait();

      const provider =  new ethers.getDefaultProvider(network = "http://127.0.0.1:8545/")
      contract_final_bal = await  provider.getBalance(preds.address)
      console.log("Contract final balance after bid and challenger: ", await  provider.getBalance(preds.address))

      console.log("Biddger address after prediction win: ", await owner.getBalance())
      console.log("Challenger address after prediction loss: ", await addr1.getBalance())

      expect(contract_final_bal).to.equal(0)

    });
  });
});
