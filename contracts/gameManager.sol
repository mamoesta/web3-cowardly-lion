// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract gameManager {
  mapping (uint=>Game) gameList;
  uint gameID;
  uint status;
  address owner;
  
  constructor() public {   
    owner = msg.sender;
    gameID = 0;

  }
  struct Game {
    string homeTeam;
    string awayTeam;
    uint homeScore;
    uint awayScore;
    bool isFinal;
    bool isLocked;
    uint startTime;
  }
  
  function createGame(Game memory gm) public returns (bool){
    gameList[gameID] = gm;
    gameID ++;
    return true;
  }
  function lockGame (uint id) public returns (bool){
    gameList[id].isLocked = true;
    return true;
  }
  function updateGameScore(uint id, uint homeScore, uint awayScore) public returns (bool){
    gameList[id].isFinal = true;
    gameList[id].homeScore = homeScore;
    gameList[id].awayScore = awayScore;
    return true;
  }
  function getGame(uint id) public returns (Game memory gm){
    return gameList[id];
  }
}
