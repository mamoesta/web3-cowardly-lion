import React, { useEffect, useState, createContext } from "react";
import {ethers} from "ethers";
import "./App.css";
import gmABI from "./utils/GameManager.json";
import predABI from "./utils/PredictionManager.json";
import Container from 'react-bootstrap/Container';
import Table from 'react-bootstrap/Table';
import 'bootstrap/dist/css/bootstrap.min.css';





const App = () => {
  //Game Settings
  const [homeTeam, setHomeTeam] = useState("");
  const [awayTeam, setAwayTeam] = useState("");
  const [homeScore, setHomeScore] = useState("");
  const [awayScore, setAwayScore] = useState("");
  const [gameId, setGameId] = useState("");
  //Prediction settings

  const [bidAmount, setBidAmount] = useState("");
  const [bidOdds, setBidOdds] = useState("");
  const [predGameID, setPredGameID] = useState("");
  const [showGames, setShowGames] = useState(false);
  const [gameList, setGameList] = useState([]);
  const [showPreds, setShowPreds] = useState(false);
  const [predList, setPredList] = useState([]);
  // challenge settings
  const [predId, setPredId] = useState("");
  const [predIdFinal, setPredIdFinal] = useState(0);
  const gameABI = gmABI.abi;
  const gameAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  const predictionABI = predABI.abi;
  const predictionAddress = "0x0165878A594ca255338adfa4d48449f69242Eb8F";
  const [currentAccount, setCurrentAccount] = useState("");

  const isBackgroundDark = true;



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
    const pred = {"bidAddr": currentAccount, "challengerAddr":"0x0000000000000000000000000000000000000000","bidAmount": bidAmount, "challengerAmount": 0, "bidOdds":bidOdds,"bidGameWinner": "0x00", "gameID": predGameID, "bidWin": true, "hasChallenger": true, "isFinal": true}
    console.log("Here is the prediction: ", pred)
    await addPred(pred);
  }
  const handleChallengeSubmit = async (event) => {
    event.preventDefault();
    await addChallenge(predId, currentAccount);
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
        pred.bidAmount = String(ethers.utils.parseEther(pred.bidAmount).toBigInt());
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const predAddressContract = new ethers.Contract(predictionAddress, predictionABI, signer);
        const options = {value: pred.bidAmount};
        const predTxn = await predAddressContract.receiveNewBid(pred, options);
        await predTxn.wait();
        console.log("Mined -- ", predTxn.hash);
      }
    }
    catch(error){
      console.log(error)    
    }
  }
  const addChallenge = async(predId, addr) => {
    try {
      const {ethereum} = window;
      if (ethereum){
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const predAddressContract = new ethers.Contract(predictionAddress, predictionABI, signer);
        //const gameAddressContract = new ethers.Contract(gameAddress, gameABI, signer);
        const options = {value: await predAddressContract.getMultiplier(predId)};
        const challengeTxn = await predAddressContract.updateBidWithChallenger(String(predId), String(addr),options);
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
          if (predTxn.bidAmount > 0 ){
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
  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])
  return(
    <body className={isBackgroundDark ? 'background-grey' : 'background-white'}  >
      <header className="App-header">
        <h1 variant="dark">Welcome to the Cowardly Lion! </h1>
      </header>
        {!currentAccount && (
            <button onClick={connectWallet}>
              Connect Wallet
            </button>
          )}
        {currentAccount && (
          <form onSubmit={handleGameSubmit}>
            <h2>Game Admin</h2>
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
        <br></br>
        {currentAccount && (
        <form onSubmit = {getGames}>
          <input type="submit" value="Ask the blockchain for all the games" />
        </form>
        )}
        <br></br>
        <br></br>
        {currentAccount && showGames &&  ( 
          <Table striped bordered hover variant="dark">
            <thead>
              <tr>
                <th>#</th>
                <th>Home Team</th>
                <th>Away Team</th>
                <th>Home Score</th>
                <th>Away Score</th>
                <th>Is The Game Final?</th>
              </tr>
            </thead>
            <tbody>
              {gameList.map((game) =>(
                <tr>
                  <th>{game.id.toString()}</th>
                  <th>{game.homeTeam.toString()}</th>
                  <th>{game.awayTeam.toString()}</th>
                  <th>{game.homeScore.toString()}</th>
                  <th>{game.awayScore.toString()}</th>
                  <th>{game.isFinal.toString()}</th>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
        <br></br>
        {currentAccount && (
          <form onSubmit={handlePredSubmit}>
            <h2>Prediction Admin</h2>
            <label>
              Bid Amount:
              <input type="number" value={bidAmount} onChange={(e) => setBidAmount(e.target.value)}/>
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
            <input type="submit" value="Submit a new challenge" />
          </form>
        )}
        <br></br>
        {currentAccount && (
          <form onSubmit = {handlePredFinal}>
            <label>
              Pred Id to Finalize:
              <input type="number" value={predIdFinal} onChange={(e) => setPredIdFinal(e.target.value)}/>
            </label>
            <input type="submit" value="Finalize a Prediction"/>
          </form>
        )}
        <br></br>
        {currentAccount && (
        <form onSubmit = {getPreds}>
          <input type="submit" value="Ask the blockchain for all the predictions" />
        </form>
        )}
        <br></br>
        {showPreds && (
          <Table striped bordered hover variant="dark">
          <thead>
            <tr>
              <th>#</th>
              <th>Bid Address</th>
              <th>Challenger Address</th>
              <th>Game ID</th>
              <th>Bid Amount</th>
              <th>Challenger Amount</th>
              <th>Did Bidder Win?</th>
              <th>Is the Bid Final?</th>
            </tr>
          </thead>
          <tbody>
            {predList.map((pred) =>(
              <tr>
                <th>{pred.id.toString()}</th>
                <th>{pred.bidAddr.toString()}</th>
                <th>{pred.challengerAddr.toString()}</th>
                <th>{pred.gameID.toString()}</th>
                <th>{String(ethers.utils.formatEther(pred.bidAmount.toBigInt()))}</th>
                <th>{String(ethers.utils.formatEther(pred.challengerAmount.toBigInt()))}</th>
                <th>{pred.bidWin.toString()}</th>
                <th>{pred.isFinal.toString()}</th>
              </tr>
            ))}
          </tbody>
        </Table>
        )}
        <br></br>
        {currentAccount && (
        <form onSubmit = {returnResults}>
          <h2> Request a Payout </h2>
          <input type="submit" value="Return results for current account" />
        </form>
        )}
      <br></br>
    </body>
  )
}

export default App;


