// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract PredictionManager {
  address payable public owner = payable(msg.sender);
  uint totalPredCount = 0;
  uint predID = 0;

  fallback() external payable{}
  receive() external payable{}
  
  struct Prediction {
    address payable bidAddr;
    address payable challengerAddr;
    uint bidAmount;
    uint bidOdds;
    string bidGameWinner;
    uint challengerAmount;
    uint gameID;
    bool bidWin;
    //a bid is active if no challenger is found
    bool isActive;
  }
  
  //a user can only have one active prediction at a time
  mapping (address => Prediction) public predictionList;
  
  function receiveNewBid(uint  _bidAmount, uint  _bidOdds, string memory _bidGameWinner, uint  _gameID) public payable {
    Prediction memory pred;
    pred.bidAddr = payable(msg.sender);
    pred.challengerAddr = payable(msg.sender);
    pred.bidAmount = _bidAmount;
    pred.bidOdds = _bidOdds;
    pred.bidGameWinner = _bidGameWinner;
    pred.challengerAmount = 0;
    pred.gameID = _gameID;
    pred.bidWin = false;
    pred.isActive = true;
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
  function getPred( address addr) public view returns (Prediction memory pred){
    return predictionList[addr];
  }
}
