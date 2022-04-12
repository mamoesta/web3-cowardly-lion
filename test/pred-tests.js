const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("submitAndReturnPrediction", function () {
  it("Can submit a prediction and it shows up in the prediction list", async function () {
    const Preds = await hre.ethers.getContractFactory("PredictionManager");
    const preds = await Preds.deploy();
  
    await preds.deployed();
    predElement = {"bidAddr": "0x5945c34A809095D74932a0876F9900a295Bda5BE", "challengerAddr":"0x5945c34A809095D74932a0876F9900a295Bda5BE","bidAmount": "1","challengerAmount": "1", "bidOdds":"50","bidGameWinner": "0xD7Fa4965eA43E0cB3bdB89A3Fb411d22e92d76DE", "gameID": "0", "bidWin": true, "hasChallenger": true, "isFinal": true, id: 0}

    
    txn = await preds.receiveNewBid(predElement)
    p = await preds.getPred(0)
    console.log(p[0].bidAddr)
    //expect(p.bidAddr).to.equal("0x5945c34A809095D74932a0876F9900a295Bda5BE")
  
  });
});
