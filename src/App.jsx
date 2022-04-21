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
  // challenge settings
  const [predId, setPredId] = useState("");
  const [betAmount, setBetAmount] = useState(0);
  const [predIdFinal, setPredIdFinal] = useState(0);
  const gameABI = gmABI.abi;
  const gameAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const predictionABI = predABI.abi;
  const predictionAddress = "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318";
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
  const handlePredFinal = async (event) => {
    event.preventDefault();
    try {
      const {ethereum} = window;
      if (ethereum){
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const predAddressContract = new ethers.Contract(predictionAddress, predictionABI, signer);
        const predTxn = await predAddressContract.makeFinal(predIdFinal);
        await predTxn.wait();
        console.log("Mined -- ", predTxn.hash);
      }
    }
    catch(error){
      console.log(error)    
    }
    

  }
  const handlePredSubmit = async (event) => {
    event.preventDefault();
    console.log(ethers.utils.parseEther(bidAmount).toString())
    const pred = {"bidAddr": bidAddress, "challengerAddr":challengerAddress,"bidAmount": bidAmount, "challengerAmount": challengerAddress, "bidOdds":bidOdds,"bidGameWinner": "0xD7Fa4965eA43E0cB3bdB89A3Fb411d22e92d76DE", "gameID": predGameID, "bidWin": true, "hasChallenger": true, "isFinal": true}
    console.log("Here is the prediction: ", pred)
    await addPred(pred);
  }
  const handleChallengeSubmit = async (event) => {
    event.preventDefault();
    await addChallenge(predId, currentAccount, betAmount);
  }
  const handleGameUpdate = async(event) => {
    event.preventDefault();
    const update = {"gameId": gameId,"homeScore": homeScore, "awayScore": awayScore}
    console.log("Here is the game update: ",update )
    await finalizeGame(update)
  }
  const addPred = async (pred) => {
    try {
      const {ethereum} = window;
      if (ethereum){
        pred.id = 0
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const predAddressContract = new ethers.Contract(predictionAddress, predictionABI, signer);
        const options = {value: ethers.utils.parseEther(pred.bidAmount)};
        const predTxn = await predAddressContract.receiveNewBid(pred, options);
        await predTxn.wait();
        console.log("Mined -- ", predTxn.hash);
      }
    }
    catch(error){
      console.log(error)    
    }
  }
  const addChallenge = async(predId, addr, betAmount) => {
    try {
      const {ethereum} = window;
      if (ethereum){
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const predAddressContract = new ethers.Contract(predictionAddress, predictionABI, signer);
        //const gameAddressContract = new ethers.Contract(gameAddress, gameABI, signer);
        console.log(betAmount)
        const options = {value: ethers.utils.parseEther(betAmount)}
        const challengeTxn = await predAddressContract.updateBidWithChallenger(String(predId), String(addr), betAmount,options);
        await challengeTxn.wait();
        console.log("Mined challenge --", challengeTxn.hash);
        console.log(await provider.getBalance(predictionAddress))
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
  const returnResults = async (event) => {
    event.preventDefault();
    try {
      const {ethereum } = window;
      if (ethereum){
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const predictionContract = new ethers.Contract(predictionAddress, predictionABI, signer);
        const ret = await predictionContract.returnResults(currentAccount);
        await ret.wait();
        console.log("Mined -- ", ret.hash);
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
  const finalizeGame = async (update) => {
    try {
      const {ethereum} = window;
      if (ethereum) {        
        console.log('finalizing game...')
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const gameAddressContract = new ethers.Contract(gameAddress, gameABI, signer);
        let txn = await gameAddressContract.updateGameScore(update.gameId, update.homeScore, update.awayScore)
        console.log(txn)
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
          <input type="submit" value="Submit a new bid" />
        </form>
      )}
          <br></br>
      {currentAccount && (
        <form onSubmit={handleChallengeSubmit}>
          <label>
            Prediction ID:
            <input type="text" value={predId} onChange={(e) => setPredId(e.target.value)}/>
          </label>
          <label>
            Bet Amount:
            <input type="text" value={betAmount} onChange={(e) => setBetAmount(e.target.value)}/>
          </label>
          <input type="submit" value="Submit a new challenge" />
        </form>
      )}
      <br></br>
      {currentAccount && (
       <form onSubmit = {getGames}>
         <input type="submit" value="Ask the blockchain for all the games" />
       </form>
      )}
      <h3>ID | Home Team |Home Score | Away Team | Away Score | Is Final</h3>
      {showGames && ( 
        <ul>
          {gameList.map((game) => (
            <li key={game.id}>{game.id.toString()} | {game.homeTeam} |{game.homeScore.toString()}| 
           {game.awayTeam} | {game.awayScore.toString()} | {game.isFinal.toString()}</li>
          ))}
        </ul>
      )}
      <br></br>
      {currentAccount && (
       <form onSubmit = {getPreds}>
         <input type="submit" value="Ask the blockchain for all the predictions" />
       </form>
      )}
      <h3>ID | Bid Addr | Challenger Addr | Game ID | Who Won? | BidWin | Has Challenger? | Is Final?</h3>
      {showPreds && ( 
        <ul>
          {predList.map((pred) => (
            <li key={pred.id}>{pred.id.toString()} | {pred.bidAddr.substring(32,)} | {pred.challengerAddr.substring(32,)} | {pred.gameID.toString()} | {pred.bidGameWinner} | {pred.bidWin.toString()}| {pred.hasChallenger.toString()} | {pred.isFinal.toString()}</li>
          ))}
        </ul>
      )}
      {currentAccount && (
       <form onSubmit = {handleGameUpdate}>
         <label>
            Game ID:
            <input type="number" value={gameId} onChange={(e) => setGameId(e.target.value)}/>
          </label>
          <label>
            Home Final:
            <input type="number" value={homeScore} onChange={(e) => setHomeScore(e.target.value)}/>
          </label>
          <label>
            Away Final:
            <input type="number" value={awayScore} onChange={(e) => setAwayScore(e.target.value)}/>
          </label>
         <input type="submit" value="Finalize a Game" />
         
       </form>
      )}
      {currentAccount && (
        <form onSubmit = {handlePredFinal}>
          <label>
            Pred Id to Finalize:
            <input type="number" value={predIdFinal} onChange={(e) => setPredIdFinal(e.target.value)}/>
          </label>
          <input type="submit" value="Finalize a Prediction"/>
        </form>
      )}
      {currentAccount && (
       <form onSubmit = {returnResults}>
         <input type="submit" value="Return results for current account" />
       </form>
      )}
    </div>
    </>
  )
}
export default App;
