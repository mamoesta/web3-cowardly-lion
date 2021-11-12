// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract predictionManager {
  address owner;
  uint status;
  uint totalPredCount;
  uint predID;
  mapping (uint=>Prediction) predictionList;

  fallback() external payable{}
  
  constructor(uint _status) public {
    owner = msg.sender;
    status = _status;
    totalPredCount = 0;
    predID = 0;
  }
  struct Prediction {
    address payable bidAddr;
    address payable challengerAddr;
    uint bidAmount;
    uint bidOdds;
    uint bidgameWinnerID;
    uint challengerAmount;
    uint gameID;
    bool bidWin;
    bool isActive;
  }
  function receiveNewBid(Prediction pred) public payable {
    pred.isActive = true;
    pred.challengerAddr = '0x0';
    predictionList[predID] = pred;
    predID++;
  }

  function returnResults(Prediction pred, uint winnerID) {
    pred.isActive = false;
    uint winAmount;
    if (pred.bidgameWinnerID == winnerID){
      winAmount = pred.bidAmount * pred.bidOdds;
      // send winAmount to bidder
      //notify ask that they have lost
    }
    else if (pred.bidgameWinnerID != winnerID) {
      winAmount = pred.challengerAmount
      // send winAmount to asker
      // notify bidder that they have lost
    }
    else {
      // return the money to everyone - perhaps in the case of a tie or some other uncaught result
    }
  }
  function updateBidWithAsk public payable (uint predID, address addr, uint amount){
    predictionList[predID].challengerAddr = addr;
    predictionList[predID].challengerAmount = amount;
    //TODO ensure bid amount * bid odds = ask amount
  }
}
