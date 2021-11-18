// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract PredictionManager {
  address public owner = msg.sender;
  uint predID = 1;

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
    bool hasChallenger;

    //bid is marked final once it's paid out.
    bool isFinal;
  }
  
  //a user can only have one active prediction at a time
  mapping (address => uint) public addressBook;
  mapping (uint => Prediction) public predictionList;
  
  function receiveNewBid(Prediction memory pred) public payable {
    require(addressBook[msg.sender] == 0, 'send a bid from a new address');
    addressBook[msg.sender] = predID;
    pred.bidWin = false;
    pred.hasChallenger = true;
    pred.isFinal = false;
    predictionList[predID] = pred;
    predID++;  
  }
  function returnResults() public returns (bool) {
    address payable sourceAddr = payable(msg.sender);
    uint index = addressBook[sourceAddr];
    Prediction memory pred = predictionList[index];
    if(!pred.hasChallenger && sourceAddr == pred.bidAddr){
      pred.bidAddr.transfer(pred.bidAmount );
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
    }
    else {
      return false;
      // return the money to everyone - perhaps in the case of a tie or some other uncaught result
    }
    return true;
  }
  function updateBidWithAsk (uint predIndex, address payable challengeAddr, uint amount) public payable {
    addressBook[challengeAddr] = predIndex;
    predictionList[predIndex].challengerAddr = challengeAddr;
    predictionList[predIndex].challengerAmount = amount;
    predictionList[predIndex].isFinal = true;
    //TODO ensure bid b * bid odds = ask amount
  }
  function getPred( uint index) public view returns (Prediction memory pred){
    return predictionList[index];
  }
}
