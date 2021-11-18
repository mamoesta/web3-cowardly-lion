// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract GameManager {
 
  uint gameID = 1;
  uint status;
  address public owner = msg.sender;

  struct Game {
    string homeTeam;
    string awayTeam;
    uint homeScore;
    uint awayScore;
    bool isFinal;
    bool isLocked;
    uint startTime;
  }
  mapping (uint => Game) public gameList;
  function createGame(Game memory gm) public returns (bool){
    gameList[gameID] = gm;
    gameID ++;
    return true;
  }
  function unlockGame (uint id) public returns (bool){
    gameList[id].isLocked = false;
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
  function getGame(uint id) public view returns (Game memory gm){
    return gameList[id];
  }
}
