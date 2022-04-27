// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
import "hardhat/console.sol";

contract PredictionManager {
  address public owner = msg.sender;
  uint public predId = 0;


  fallback() external payable{}
  receive() external payable{}
  address payable pred_addr = payable(this);
  address public game_addr;
  
  struct Prediction {
    uint id;
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
  
  //function hasActiveBid(address addr) public view returns(bool){
    //check to determine if an address has an open bid
    //return predictionList[addressBook[addr]].isFinal;
  //}
  function receiveNewBid(Prediction memory pred) public payable  {
    //require(hasActiveBid(msg.sender) != true, 'This address already has an active bid.');
    //if this address has yet to ever file a bid
   
    if(addressBook[msg.sender] == 0){
      //add a new entry
      pred.bidWin = false;
      pred.hasChallenger = false;
      pred.challengerAmount = 0;
      pred.isFinal = false;
      pred.id = predId;
      predictionList[predId] = pred;
      addressBook[msg.sender] = predId;
      predId++;

    }
    // this address is trying to add a new bid and the previous prediction that they made is finalized
    else if (addressBook[msg.sender]!= 0 && predictionList[addressBook[msg.sender]].isFinal == true) {
      pred.bidWin = false;
      pred.hasChallenger = false;
      pred.isFinal = false;
      pred.id = predId;
      predictionList[addressBook[msg.sender]] = pred;
      predId++;

    }
    // this address is trying to add a new bid and the previous bid is not final
    else{
    console.log("uncaught");
    //uncaught
    }
    
  }
  function clearPrediction(address bidder, address challenger) public {
  
  delete predictionList[addressBook[bidder]];
  delete addressBook[bidder];
  
  delete predictionList[addressBook[challenger]];
  delete addressBook[challenger];
  }

  function returnResults(address payable addr) public returns (bool) {
    address payable sourceAddr = addr;
    Prediction memory pred = predictionList[addressBook[msg.sender]];
    require(pred.isFinal,'Cannot return payouts for a matched bid until the results are final.');
    
    if(!pred.hasChallenger && sourceAddr == pred.bidAddr){
      console.log("No challenger!");
      uint amount = pred.bidAmount;
      (bool sent, ) = pred.challengerAddr.call{value: amount}("");
      require(sent, "Failed to send Ether");
      clearPrediction(pred.bidAddr, pred.challengerAddr);
      return true;
    }
    else if (pred.bidAddr == sourceAddr && pred.bidWin){
      console.log("Bidder won!");
      uint winAmount = (pred.bidAmount + pred.challengerAmount);
      //(bool sent, ) = pred.challengerAddr.call{value: winAmount}("");
      //require(sent, "Failed to send Ether");
      sourceAddr.transfer(winAmount);
      clearPrediction(pred.bidAddr, pred.challengerAddr);
      return true;
    }
    else if (pred.challengerAddr == sourceAddr && !pred.bidWin) {
      console.log("Challenger won!");
      uint winAmount = (pred.bidAmount + pred.challengerAmount);
      //console.log(winAmount);
      //(bool sent, ) = pred.challengerAddr.call{value: 128 ether}("");
      //require(sent, "Failed to send Ether");
      //hard-coded now because I'm an idiot
      sourceAddr.transfer(winAmount);
      clearPrediction(pred.bidAddr, pred.challengerAddr);
      return true;
    }
    else {
      console.log("Uncaught!");
      clearPrediction(pred.bidAddr, pred.challengerAddr);
      return false;
      // return the money to everyone - perhaps in the case of a tie or some other uncaught result
    }

  }
  function updateBidWithChallenger (uint predIndex, address payable challengerAddr) public payable {
    console.log("Address sending in the challenge:", msg.sender);
    addressBook[challengerAddr] = predIndex;
    Prediction memory halfBakedPred =  predictionList[predIndex];
    //uint amount = halfBakedPred.bidAmount;
    require(halfBakedPred.hasChallenger == false, 'This bid already has a challenger');
    //uint multiplier = ((100 - halfBakedPred.bidOdds) * 10000) / halfBakedPred.bidOdds;
    //uint multiplier = ((100 - halfBakedPred.bidOdds) * 100) / (halfBakedPred.bidOdds * 100);
    //console.log("here is the multiplier:" , multiplier);
    
    uint amountMultiplied = getMultiplier(predIndex);
    predictionList[predIndex].challengerAddr = challengerAddr;
    predictionList[predIndex].challengerAmount = amountMultiplied;
    predictionList[predIndex].hasChallenger = true;
    console.log("Bid amount:", predictionList[predIndex].bidAmount);
    console.log("Challenger amount:",predictionList[predIndex].challengerAmount);  
    console.log("Bid/challenger ratio:", (predictionList[predIndex].bidOdds * 100)/(100-predictionList[predIndex].bidOdds));
  }
  function getMultiplier(uint predIndex) public view returns (uint response){
    Prediction memory halfBakedPred = predictionList[predIndex];
    uint multiplier = ((100 - halfBakedPred.bidOdds) * 10000) / halfBakedPred.bidOdds;
    //uint multiplier = ((100 - halfBakedPred.bidOdds) * 100) / (halfBakedPred.bidOdds * 100)
    uint amountMultiplied = ((halfBakedPred.bidAmount * multiplier))/10000;
    //require(amountMultiplied == amount, 'Challenge amount does not match bid amount.');
    return amountMultiplied;
  }
  function getPred(uint index) public view returns (Prediction memory pred){
    return predictionList[index];
  }
  function getGameContractAddress(address addr) public{
    game_addr = addr;
    console.log("Game address:", game_addr);
  }

  function getIndex(address addr) public view returns (uint index){
    return addressBook[addr];
  }
  function makeFinal(uint index) public {
    
    predictionList[index].isFinal = true;
  }
  function bidWin(uint index) public {
    predictionList[index].bidWin = true;
  }

}
