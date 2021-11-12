// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract placeBet {
  uint public betCount = 0;
  unit public totalFunds = 0;
  // send a bet to the contract. Bet contains ETH amount and win likelihood
  function get() public view returns (uint) {
    return betCount;
  }
  function increment(uint amount) public {
    betCount += amount;
  }
  function getBalance() public view returns (uint) {
    return address(this).balance;
  }
  function receive(amount) external payable{
    totalFunds += amount;
    return totalFunds;
  }
  fallback() external payable{}
}
