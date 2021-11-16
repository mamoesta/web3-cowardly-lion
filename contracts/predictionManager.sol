// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract PredictionManager {
  address payable owner;
  uint status;
  uint totalPredCount;
  uint predID;

  //a user can only have one active prediction at a time
  mapping(address=>Prediction) predictionList;

  fallback() external payable{}
  
  constructor() public {
    owner = payable(msg.sender);
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
    //a bid is active if no challenger is found
    bool isActive;
  }
  function receiveNewBid(Prediction memory pred) public payable {
    pred.isActive = true;
    pred.challengerAddr = owner;
    predictionList[msg.sender] = pred;
  }

  function returnResults() public returns (bool) {
    address sourceAddr = msg.sender;
    Prediction memory pred = predictionList[sourceAddr];
    if(pred.isActive && sourceAddr == pred.bidAddr){
      pred.bidAddr.transfer(pred.bidAmount);
      //send original amount back to sourceAddr
    }
    else if (pred.bidAddr == sourceAddr && pred.bidWin){
      uint winAmount = pred.bidAmount * pred.bidOdds;
      pred.bidAddr.transfer(winAmount);
      // send winAmount to bidder
    }
    else if (pred.challengerAddr == sourceAddr && !pred.bidWin) {
      uint winAmount = pred.challengerAmount;
      pred.challengerAddr.transfer(winAmount);
      // send winAmount to asker
    }
    else {
      return false;
      // return the money to everyone - perhaps in the case of a tie or some other uncaught result
    }
    return true;
  }
  function updateBidWithAsk (address creatorAddr, address payable challengeAddr, uint amount) public payable {
    predictionList[creatorAddr].challengerAddr = challengeAddr;
    predictionList[creatorAddr].challengerAmount = amount;
    //TODO ensure bid amount * bid odds = ask amount
  }
}
