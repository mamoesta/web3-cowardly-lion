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
  
  //an address can only have one active prediction bid at a time
  mapping (address => Prediction) public predictions;
  address [] public predList;
  
  struct Prediction {
    address payable bidAddr;
    address payable challengerAddr;
    uint bidAmount;
    uint challengerAmount;
    uint bidOdds;
    
    //this is terrible but I also use this value as who the bidder voted to win
    string gameWinner;
    uint gameID;
    bool bidWin;
    bool hasChallenger;
    //bid is marked final once it's paid out.
    bool gameIsFinal;
    uint listPointer;
    bool isStale;
  }
  
  function hasBid (address entityAddress) public view returns (bool){
    if(predList.length == 0) return false;
    return (predList[predictions[entityAddress].listPointer] == entityAddress);
  }
  function getPredCount() public view returns(uint predsCount) {
    return predList.length;
  }
  function handleBidInfo(Prediction memory pred) public payable returns (bool success){
    if(hasBid(msg.sender)){
      updateStaleBid((pred));
    }
    else {
      newBid(pred);
    }
    return true;
  }
  
  function newBid(Prediction memory pred) public payable returns(bool success) {
    require(!hasBid(msg.sender), "This address already has a bid");
    
    predList.push(msg.sender);
    pred.bidAddr = payable(msg.sender);
    pred.hasChallenger = false;
    pred.gameIsFinal = false;
    pred.bidOdds = pred.bidOdds;
    pred.bidWin = false;
    pred.isStale = false;
    pred.listPointer =  (predList.length) - 1;
    predictions[msg.sender] = pred;
   
    return true;
  }

  function updateStaleBid( Prediction memory pred ) public payable returns(bool success) {
    predictions[msg.sender].isStale = false;
    
    predictions[msg.sender].bidAddr = payable(msg.sender);
    predictions[msg.sender].bidWin = false;
    predictions[msg.sender].bidOdds = pred.bidOdds;
    predictions[msg.sender].bidAmount = pred.bidAmount;
    predictions[msg.sender].hasChallenger = false;
    predictions[msg.sender].challengerAddr = payable(address(0));
    predictions[msg.sender].challengerAmount = 0;
    
    predictions[msg.sender].gameIsFinal = false;
    predictions[msg.sender].gameID = pred.gameID;
    predictions[msg.sender].isStale = false;
    
    return true;

  }
  function updateBidWithChallenger(address bidAddress, address payable challengerAddr) public payable {
    console.log("Address sending in the challenge:", msg.sender);
    predictions[bidAddress].challengerAddr = challengerAddr;
    //Prediction memory temp =  predictions[bidAddress];
    require(predictions[bidAddress].hasChallenger == false, 'This bid already has a challenger');
    
    uint amountMultiplied = getMultiplier(bidAddress);
    predictions[bidAddress].challengerAddr = challengerAddr;
    predictions[bidAddress].challengerAmount = amountMultiplied;
    predictions[bidAddress].hasChallenger = true;
    
    console.log("Bid amount:", predictions[bidAddress].bidAmount);
    console.log("Challenger amount:",predictions[bidAddress].challengerAmount);  
    console.log("Bid/challenger ratio:", (predictions[bidAddress].bidOdds * 100)/(100-predictions[bidAddress].bidOdds));
    
    //temp for hardcoding that the bidder wins each time
    bidWin(bidAddress);
    makeFinal(bidAddress);
  }
  function getMultiplier(address entityAddress) public view returns (uint response){
    Prediction memory halfBakedPred = predictions[entityAddress];
    uint multiplier = ((100 - halfBakedPred.bidOdds) * 10000) / halfBakedPred.bidOdds;
    //uint multiplier = ((100 - halfBakedPred.bidOdds) * 100) / (halfBakedPred.bidOdds * 100)
    uint amountMultiplied = ((halfBakedPred.bidAmount * multiplier))/10000;
    //require(amountMultiplied == amount, 'Challenge amount does not match bid amount.');
    return amountMultiplied;
  }
  
  function deleteBid (address entityAddress) public returns(bool success) {   
    //TODO: Be sure that this only needs to get called when the bidder is replacing this bid with a new one
    if(!hasBid(entityAddress)) revert();
    // EnttityStructs
    // '0x1' --> 'foo', 0
    // '0x2' --> 'bar', 1
    // '0x3' --> 'baz', 2
   
    // entityList
    //[0x1,0x2,0x3]
    // 0
    uint rowToDelete = predictions[entityAddress].listPointer;
    // 0x3
    address keyToMove   = predList[predList.length-1];
    // entityLIst = [0x3,0x2,0x3]
    predList[rowToDelete] = keyToMove;
    //2 -->  0
    predictions[keyToMove].listPointer = rowToDelete;
    predictions[keyToMove].isStale = true;
    // entityList = [0x3,0x2]
    predList.pop();
    
    //entityStructs
    // '0x1' --> 'foo', 0
    // '0x2' --> 'bar', 1
    // '0x3' --> 'baz', 0
    return true;
  }
  function returnResults(address payable sourceAddr) public payable returns (bool success) {
    
    Prediction memory pred = predictions[sourceAddr];
    
    //TODO: This should check if the game is final
    require(pred.gameIsFinal,'Cannot return payouts for a matched bid until the game is final.');
    
    if(!pred.hasChallenger && sourceAddr == pred.bidAddr){
      console.log("No challenger!");
      uint amount = pred.bidAmount;
      (bool sent, ) = pred.bidAddr.call{value: amount}("");
      require(sent, "Failed to send Ether");
      predictions[sourceAddr].isStale = true;
      return true;
    }
    else if (pred.bidAddr == sourceAddr && pred.bidWin){
      console.log("Bidder won!");
      uint winAmount = (pred.bidAmount + pred.challengerAmount);
      //(bool sent, ) = pred.challengerAddr.call{value: winAmount}("");
      //require(sent, "Failed to send Ether");
      sourceAddr.transfer(winAmount);
      predictions[sourceAddr].isStale = true;
      console.log("Deleting the bid");
      return true;
    }
    else if (pred.challengerAddr == sourceAddr && !pred.bidWin) {
      console.log("Challenger won!");
      uint winAmount = (pred.bidAmount + pred.challengerAmount);
      //console.log(winAmount);
      //(bool sent, ) = pred.challengerAddr.call{value: 128 ether}("");
      //require(sent, "Failed to send Ether");
      sourceAddr.transfer(winAmount);
      predictions[sourceAddr].isStale = true;
      return true;
    }
    else {
      console.log("Uncaught!");
      predictions[sourceAddr].isStale = true;
      return false;
      // return the money to everyone - perhaps in the case of a tie or some other uncaught result
    }
  }
  function makeFinal(address entityAddress) public {
    
    predictions[entityAddress].gameIsFinal = true;
  }
  function bidWin(address entityAddress) public {
    predictions[entityAddress].bidWin = true;
  }
  function getGameContractAddress(address addr) public{
    game_addr = addr;
    console.log("Game address:", game_addr);
  }
  /*
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

  // Gets dicey from here on out
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
    predictionList[predIndex].isFinal = true;
    
    console.log("Bid amount:", predictionList[predIndex].bidAmount);
    console.log("Challenger amount:",predictionList[predIndex].challengerAmount);  
    console.log("Bid/challenger ratio:", (predictionList[predIndex].bidOdds * 100)/(100-predictionList[predIndex].bidOdds));
  }

  function getPred(uint index) public view returns (Prediction memory pred){
    return predictionList[index];
  }


  function getIndex(address addr) public view returns (uint index){
    return addressBook[addr];
  }
  */
}
