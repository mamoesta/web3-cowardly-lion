import React, { useEffect, useState } from "react";
import {ethers} from "ethers";
import "./App.css";
import gmABI from "./utils/GameManager.json";
import predABI from "./utils/PredictionManager.json";
import { id } from "ethers/lib/utils";
const App = () => {
  const [homeTeam, setHomeTeam] = useState("");
  const [awayTeam, setAwayTeam] = useState("");
  const [homeScore, setHomeScore] = useState("");
  const [awayScore, setAwayScore] = useState("");
  const [gameId, setGameId] = useState("");
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
  const handleSubmit = async (event) => {
    event.preventDefault();
    const game = {"homeTeam": homeTeam, "awayTeam":awayTeam,"homeScore": homeScore,"awayScore": awayScore, "isFinal":false,"isLocked": false, "startTime": Date.now()}
    console.log("Here is the game: ", game)
    await addGame(game);
  }
  const addGame = async (game) => {
    try {
      const {ethereum } = window;
      if (ethereum){
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const gameAddressContract = new ethers.Contract(gameAddress, gameABI, signer);
        const gameTxn = await gameAddressContract.createGame(game);
        await gameTxn.wait();
        console.log("Mined -- ", gameTxn.hash);
     }
     
    }
    catch(error){
      console.log(error)
    }
  }
  const getGame = async (event) => {
    event.preventDefault();
    try {
      const {ethereum} = window;
      if (ethereum) {        
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const gameAddressContract = new ethers.Contract(gameAddress, gameABI, signer);
        const gameTxn = await gameAddressContract.getGame(parseInt(gameId));
        console.log("Home team for game Id", gameId, ":" ,gameTxn.homeTeam)
      }
      else {
        console.log('ethereum object does not exist')
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
        <form onSubmit={handleSubmit}>
          <label>
            Home Team:
            <input type="text" value={homeTeam} onChange={(e) => setHomeTeam(e.target.value)}/>
          </label>
          <label>
            Away Team:
            <input type="text" value={awayTeam} onChange={(e) => setAwayTeam(e.target.value)}/>
          </label>
          <label>
            Home Score:
            <input type="number" value={homeScore} onChange={(e) => setHomeScore(e.target.value)}/>
          </label>
          <label>
            Away Score:
            <input type="number" value={awayScore} onChange={(e) => setAwayScore(e.target.value)}/>
          </label>
          <input type="submit" value="Submit" />
        </form>
      )}
      {currentAccount && (
       <form onSubmit = {getGame}>
         <label>
           Game ID
           <input type="number" value = {gameId} onChange={(e) => setGameId(e.target.value)} />
         </label>
         <input type="submit" value="Get Game ID" />
       </form>
      )}
    </div>
  )
}
export default App;
