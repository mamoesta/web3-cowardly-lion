import React, { useEffect, useState } from "react";
import {ethers} from "ethers";
import "./App.css";
import gmABI from "./utils/GameManager.json";
import predABI from "./utils/PredictionManager.json";
const App = () => {
  const dummyGame = {"homeTeam":"Falcons","awayTeam":"Panthers","homeScore":99, "awayScore": 91,"isFinal": true,"isLocked": false,"startTime":12345}
  const gameABI = gmABI.abi;
  const gameAddress = "0xa0487053F053Cfa1f6C4025E6Ee71a2Fff08abb7";
  const predictionABI = predABI.abi;
  const predictionAddress = "0x4F5455854B9BE10df17C70941D3C3Af4FD5aBD43";
  const [currentAccount, setCurrentAccount] = useState("");
  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error);
    }
  }
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error)
    }
  }
  const addGame = async () => {
    try {
      const {ethereum } = window;
      if (ethereum){
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const gameAddressContract = new ethers.Contract(gameAddress, gameABI, signer);
        const gameTxn = await gameAddressContract.createGame(dummyGame);
        console.log("Added Game: ", dummyGame)
        console.log("Mining...", gameTxn.hash);
        await gameTxn.wait();
        console.log("Mined -- ", gameTxn.hash);
     }
     
    }
    catch(error){
      console.log(error)
    }
  }
  const getGame = async () => {
    try {
      const {ethereum} = window;
      if (ethereum) {        
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const gameAddressContract = new ethers.Contract(gameAddress, gameABI, signer);
        const gameTxn = await gameAddressContract.getGame();
        console.log(gameTxn.homeTeam);
      }
      else {
        console.log('ethereum object DNE')
      }
    }
    catch(error){
      console.log(error)
    }
  }
  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])


  return(
    <div>
      <li>Game Contract Address:  {gameAddress}!</li>
      <li>Prediction Contract Address: {predictionAddress}!</li>
      {!currentAccount && (
          <button onClick={connectWallet}>
            Connect Wallet
          </button>
        )}
      {currentAccount && (
        <button onClick={addGame}>
          Add a Dummy Game
        </button>
      )}
      {currentAccount && (
        <button onClick={getGame}>
          Get Game ID 0
        </button>
      )}
    </div>
  )
}
export default App;
