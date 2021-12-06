// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract PredictionManager {
  address public owner = msg.sender;
  uint public predId = 0;

  fallback() external payable{}
  receive() external payable{}
  
  struct Prediction {
    address payable bidAddr;
    address payable challengerAddr;
    uint bidAmount;
    uint challengerAmount;
    uint bidOdds;
    string bidGameWinner;
    uint gameID;
    bool bidWin;
    bool hasChallenger;
    //bid is marked final once it's paid out.
    bool isFinal;
  }
  
  //a user can only have one active prediction at a time
  mapping (address => uint) public addressBook;
  mapping (uint => Prediction) public predictionList;
  
  function hasActiveBid(address addr) public returns(bool){
    //check to determine if an address has an open bid
    return predictionList[addressBook[addr]].isFinal;
  }
  function receiveNewBid(Prediction memory pred) public payable {
    require(hasActiveBid(msg.sender) != true, 'This address already has an active bid.');

    //if this address has yet to ever file a bid
    if(addressBook[msg.sender] == 0){
      // add a new entry
      pred.bidWin = false;
      pred.hasChallenger = false;
      pred.isFinal = false;
      predictionList[predId] = pred;
      predId++;  
    }
    // this address is trying to add a new bid and the previous pred is finalized
    else if (addressBook[msg.sender]!= 0 && predictionList[addressBook[msg.sender]].isFinal == true) {
      pred.bidWin = false;
      pred.hasChallenger = false;
      pred.isFinal = false;
      predictionList[addressBook[msg.sender]] = pred;
    }
    // this address is trying to add a new bid and the previous bid is not final
    else{
      //uncaught
    }
    
  }
  function returnResults() public returns (bool) {
    address payable sourceAddr = payable(msg.sender);
    Prediction memory pred = predictionList[addressBook[msg.sender]];
    require(pred.isFinal,'Cannot return payouts for a matched bid until the results are final.');
    
    // We checked that the game is final, now we can reset isFinal so that addresses can issue fresh bids
    predictionList[addressBook[msg.sender]].isFinal = false;
    
    if(!pred.hasChallenger && sourceAddr == pred.bidAddr){
      uint amount = pred.bidAmount;
      (bool sent, bytes memory data) = pred.bidAddr.call{value: amount}("");
      require(sent, "Failed to send Ether");
      return true;
    }
    else if (pred.bidAddr == sourceAddr && pred.bidWin){
      uint winAmount = pred.bidAmount + pred.challengerAmount;
      (bool sent, bytes memory data) = pred.bidAddr.call{value: winAmount}("");
      require(sent, "Failed to send Ether");
      return true;
    }
    else if (pred.challengerAddr == sourceAddr && !pred.bidWin) {
      uint winAmount = pred.bidAmount + pred.challengerAmount;
      (bool sent, bytes memory data) = pred.bidAddr.call{value: winAmount}("");
      require(sent, "Failed to send Ether");
      return true;
    }
    else {
      return false;
      // return the money to everyone - perhaps in the case of a tie or some other uncaught result
    }
  }
  function updateBidWithChallenger (uint predIndex, address payable challengerAddr, uint amount) public payable {
    addressBook[challengerAddr] = predIndex;
    require(predictionList[predIndex].hasChallenger == false, 'This bid already has a challenger');
    require(predictionList[predIndex].bidAmount == amount, 'Challenge amount does not match bid amount.');
    
    predictionList[predIndex].challengerAddr = challengerAddr;
    predictionList[predIndex].challengerAmount = amount;
    predictionList[predIndex].hasChallenger = true;
  }
  function getPred(uint index) public view returns (Prediction memory pred){
    return predictionList[index];
  }
  function getIndex(address addr) public view returns (uint index){
    return addressBook[addr];
  }
}
