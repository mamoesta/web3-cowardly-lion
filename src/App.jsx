import React, { useEffect, useState } from "react";
import {ethers} from "ethers";
import "./App.css";
import gmABI from "./utils/GameManager.json";
import predABI from "./utils/PredictionManager.json";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link
} from "react-router-dom";
const {BigNumber} = require("@ethersproject/bignumber");
const App = () => {
  //Game Settings
  const [homeTeam, setHomeTeam] = useState("");
  const [awayTeam, setAwayTeam] = useState("");
  const [homeScore, setHomeScore] = useState("");
  const [awayScore, setAwayScore] = useState("");
  const [gameId, setGameId] = useState("");
  //Prediction settings
  const [bidAddress, setBidAddress] = useState("");
  const [challengerAddress, setChallengerAddress] = useState("");
  const [bidAmount, setBidAmount] = useState("");
  const [challengerAmount, setChallengerAmount] = useState("");
  const [bidOdds, setBidOdds] = useState("");
  const [predGameID, setPredGameID] = useState("");
  const [showGames, setShowGames] = useState(false);
  const [gameList, setGameList] = useState([]);
  const [showPreds, setShowPreds] = useState(false);
  const [predList, setPredList] = useState([]);
  const gameABI = gmABI.abi;
  const gameAddress = "0x4a1a9723680f1f9F4dc3E1e93b212d623885D0FA";
  const predictionABI = predABI.abi;
  const predictionAddress = "0x2c07e97C64ed9B3bedbDf32453F988f22734C527";
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
  const handleGameSubmit = async (event) => {
    event.preventDefault();
    const game = {"id":0,"homeTeam": homeTeam, "awayTeam":awayTeam,"homeScore": homeScore,"awayScore": awayScore, "isFinal":false,"isLocked": false, "startTime": Date.now()}
    console.log("Here is the game: ", game)
    await addGame(game);
  }
  const handlePredSubmit = async (event) => {
    event.preventDefault();
    const pred = {"bidAddr": bidAddress, "challengerAddr":challengerAddress,"bidAmount": bidAmount,"challengerAmount": challengerAmount, "bidOdds":bidOdds,"bidGameWinner": 'Unknown', "gameID": predGameID, "bidWin": false, "hasChallenger": false, "isFinal": false}
    console.log("Here is the prediction: ", pred)
    await addPred(pred);
  }
  const addPred = async (pred) => {
    try {
      const {ethereum} = window;
      if (ethereum){
        pred.id = 0
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const predAddressContract = new ethers.Contract(predictionAddress, predictionABI, signer);
        const predTxn = await predAddressContract.receiveNewBid(pred);
        await predTxn.wait();
        console.log("Mined -- ", predTxn.hash);
      }
    }
    catch(error){
      console.log(error)
    }
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
     else {
       console.log('Ethereum object does not exist')
     }
    }
    catch(error){
      console.log(error)
    }
  }
  const getGames = async (event) => {
    event.preventDefault();
    try {
      const {ethereum} = window;
      if (ethereum) {        
        const gameList = [];
        let isEmpty = false;
        let gameCounter = 0;
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const gameAddressContract = new ethers.Contract(gameAddress, gameABI, signer);
        while (!isEmpty){
          let gameTxn = await gameAddressContract.getGame(parseInt(gameCounter));
          if (gameTxn.homeTeam !== ""){
            gameList.push(gameTxn);
            gameCounter++;
          } else {
            isEmpty=true;
          }
        }
        setGameList(gameList);
        setShowGames(true);
      }
      else {
        console.log('ethereum object does not exist')
      }
    }
    catch(error){
      console.log(error)
    }
  }
  const getPreds = async (event) => {
    event.preventDefault();
    try {
      const {ethereum} = window;
      if (ethereum) {        
        console.log('asking the blockchain for all predictions')
        const predList = [];
        let isEmpty = false;
        let predCounter = 0;
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const predAddressContract = new ethers.Contract(predictionAddress, predictionABI, signer);
        while (!isEmpty){
          let predTxn = await predAddressContract.getPred(parseInt(predCounter));
          console.log(predTxn.bidAmount)
          if (predTxn.bidAmount.toNumber() !== 0){
            predList.push(predTxn);
            predCounter++;
          } else {
            isEmpty=true;
          }
        }
        console.log('im out of this hole')
        setPredList(predList);
        setShowPreds(true);
      }
      else {
        console.log('ethereum object does not exist')
      }
    }
    catch(error){
      console.log(error)
    }
  }
  function About() {
    return <h2>You're on the About Page</h2>;
  }
  function Home() {
    return <h2>You're on the Home Page</h2>;
  }
  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])
  return(
    //routing
    <>
    <div>
      some basic routing here
    </div>
    <Router>
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/about">About</Link>
            </li>
            <li>
              <Link to="/">Home </Link>
            </li>
          </ul>
        </nav>
        <Routes>
          <Route path="/about" element={<About />} />
          <Route path="/" element={<Home />} />
        </Routes>
      </div>
    </Router>

    <div>
      <h2>THE MEAT:</h2>
      <li>Game Contract Address:  {gameAddress}</li>
      <li>Prediction Contract Address: {predictionAddress}</li>
      <br></br>
      {!currentAccount && (
          <button onClick={connectWallet}>
            Connect Wallet
          </button>
        )}
      {currentAccount && (
        <form onSubmit={handleGameSubmit}>
          <label>
            Home Team:
            <input type="text" key="homeTeam" value={homeTeam} onChange={(e) => setHomeTeam(e.target.value)}/>
          </label>
          <label>
            Away Team:
            <input type="text" key="awayTeam" value={awayTeam} onChange={(e) => setAwayTeam(e.target.value)}/>
          </label>
          <label>
            Home Score:
            <input type="number" key="homeScore" value={homeScore} onChange={(e) => setHomeScore(e.target.value)}/>
          </label>
          <label>
            Away Score:
            <input type="number" key="awayScore" value={awayScore} onChange={(e) => setAwayScore(e.target.value)}/>
          </label>
          <input type="submit" value="Submit a new game" />
        </form>
      )}
      <br></br>
      {currentAccount && (
        <form onSubmit={handlePredSubmit}>
          <label>
            Bid Address:
            <input type="text" value={bidAddress} onChange={(e) => setBidAddress(e.target.value)}/>
          </label>
          <label>
            Challenger Address:
            <input type="text" value={challengerAddress} onChange={(e) => setChallengerAddress(e.target.value)}/>
          </label>
          <label>
            Bid Amount:
            <input type="number" value={bidAmount} onChange={(e) => setBidAmount(e.target.value)}/>
          </label>
          <label>
            Challenger Amount:
            <input type="number" value={challengerAmount} onChange={(e) => setChallengerAmount(e.target.value)}/>
          </label>
          <label>
            Bid Odds:
            <input type="number" value={bidOdds} onChange={(e) => setBidOdds(e.target.value)}/>
          </label>
          <label>
            Game ID:
            <input type="number" value={predGameID} onChange={(e) => setPredGameID(e.target.value)}/>
          </label>
          <input type="submit" value="Submit a new prediction" />
        </form>
      )}
      <br></br>
      {currentAccount && (
       <form onSubmit = {getGames}>
         <input type="submit" value="Ask the blockchain for all the games" />
       </form>
      )}
      <h3>ID | Home Team | Away Team</h3>
      {showGames && ( 
        <ul>
          {gameList.map((game) => (
            <li key={game.id}>{game.id.toString()} | {game.homeTeam} | {game.awayTeam}</li>
          ))}
        </ul>
      )}
      <br></br>
      {currentAccount && (
       <form onSubmit = {getPreds}>
         <input type="submit" value="Ask the blockchain for all the predictions" />
       </form>
      )}
      <h3>ID | Bid Addr | Challenger Addr | Game ID</h3>
      {showPreds && ( 
        <ul>
          {predList.map((pred) => (
            <li key={pred.id}>{pred.id.toString()} | {pred.bidAddr} | {pred.challengerAddr} | {pred.gameID.toString()}</li>
          ))}
        </ul>
      )}
    </div>
    </>
  )
}
export default App;
