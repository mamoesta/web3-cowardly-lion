import React, { useEffect, useState } from "react";
import {ethers} from "ethers";
import Forms from "react";
import "./App.css";
import gmABI from "./utils/GameManager.json";
import predABI from "./utils/PredictionManager.json";
const App = () => {
  const gameABI = gmABI.abi;
  const gameAddress = "0xa0487053F053Cfa1f6C4025E6Ee71a2Fff08abb7";

  const predictionABI = predABI.abi;
  const predictionAddress = "0x4F5455854B9BE10df17C70941D3C3Af4FD5aBD43";


  return(
    <div>
      <li>Game Contract Address:  {gameAddress}!</li>
      <li>Prediction Contract Address: {predictionAddress}!</li>
    </div>
  )

}
export default App;
