import React, { useEffect, useState} from "react";
import {ethers} from "ethers";
import "./App.css";
import gmABI from "./utils/GameManager.json";
import predABI from "./utils/PredictionManager.json";
import Container from 'react-bootstrap/Container';
import Table from 'react-bootstrap/Table';
import 'bootstrap/dist/css/bootstrap.min.css';
import Form from 'react-bootstrap/Form'
import {DropdownButton, Dropdown, FormGroup } from "react-bootstrap";
import Button from 'react-bootstrap/Button';
import Image from 'react-bootstrap/Image'
import { isAddress } from "ethers/lib/utils";



const App = () => {
  //Game Settings
  const [homeTeam, setHomeTeam] = useState("");
  const [awayTeam, setAwayTeam] = useState("");
  const [homeScore, setHomeScore] = useState("");
  const [awayScore, setAwayScore] = useState("");
  const [gameId, setGameId] = useState("");
  //Prediction settings
  const [bidTeam, setBidTeam] = useState("Home Team")
  const [bidAmount, setBidAmount] = useState("");
  const [bidOdds, setBidOdds] = useState("");
  const [predGameID, setPredGameID] = useState("");
  const [showGames, setShowGames] = useState(false);
  const [gameList, setGameList] = useState([]);
  const [showPreds, setShowPreds] = useState(false);
  const [predList, setPredList] = useState([]);
  // challenge settings
  const [predId, setPredId] = useState("");

  const gameABI = gmABI.abi;
  const gameAddress = "0xcbEAF3BDe82155F56486Fb5a1072cb8baAf547cc";
  const predictionABI = predABI.abi;
  const predictionAddress = "0x04C89607413713Ec9775E14b954286519d836FEf";
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
        //console.log("Found an authorized account:", account);
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
        if(gameList.length < 1){
          console.log("There are no games right now!")
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
        //console.log('asking the blockchain for all predictions')
        const predList = [];
        let isEmpty = false;
        let predCounter = 0;
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const predAddressContract = new ethers.Contract(predictionAddress, predictionABI, signer);
        while (!isEmpty){
          try{ 
            let predID = await predAddressContract.predList(parseInt(predCounter));
            //console.log(predID);
            let predTxn = await predAddressContract.predictions(predID);
            predList.push(predTxn);
            predCounter++;
          }
          catch(error){
            //console.log(error);
            isEmpty=true;
          }
        }
        if(predList.length < 1){
          console.log("There are no predictions right now!")
        }
        console.log(predList);
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
    <body className={isBackgroundDark ? 'background-grey' : 'background-white'}>
      <Container>
      <header className="App-header">
        <h1 variant="dark">Welcome to the Cowardly Lion! </h1>
        <Image height="200" src="https://upload.wikimedia.org/wikipedia/commons/d/d0/Cowardly_Lion.png"/>
      </header>
      <br></br>
        {!currentAccount && (
            <Button variant="outline-primary" onClick={connectWallet}>
              Connect Wallet
            </Button>
          )}
        {currentAccount && (
          <Container>
            <Form onSubmit={handleGameSubmit}>
              <h1> Submit a Game </h1>
              <FormGroup variant="dark" controlId="formNewGame">
                <Form.Label>Home Team</Form.Label>
                <Form.Control placeholder="Home Team" value={homeTeam} onChange={(e) => setHomeTeam(e.target.value)} />
                <Form.Label>Away Team</Form.Label>
                <Form.Control placeholder="Away Team" value={awayTeam} onChange={(e) => setAwayTeam(e.target.value)} />
                <Form.Label>Home Score</Form.Label>
                <Form.Control placeholder="Home Score" value={homeScore} onChange={(e) => setHomeScore(e.target.value)}/>
                <Form.Label>Away Score</Form.Label>
                <Form.Control placeholder="Away Score" value={awayScore} onChange={(e) => setAwayScore(e.target.value)}/>
              </FormGroup>
              <Button variant="outline-success" type="submit">
                Submit a New Game
              </Button>
            </Form>
          </Container>
        )}
        <br></br>
        {currentAccount && (
          <Container>
          <Form onSubmit={handleGameUpdate}>
            <h1>Finalize a Game </h1>
            <FormGroup variant="dark" controlId="formNewGame">
              <Form.Label>Game Id</Form.Label>
              <Form.Control placeholder="Game Id" value={gameId} onChange={(e) => setGameId(e.target.value)} />
              <Form.Label>Home Score</Form.Label>
              <Form.Control placeholder="Home Score" value={homeScore} onChange={(e) => setHomeScore(e.target.value)}/>
              <Form.Label>Away Score</Form.Label>
              <Form.Control placeholder="Away Score" value={awayScore} onChange={(e) => setAwayScore(e.target.value)}/>
            </FormGroup>
            <Button variant="outline-success" type="submit">
              Finalize Game
            </Button>
          </Form>
        </Container>
        )}
        <br></br>
        {currentAccount && (
          <Container>
            <Form onSubmit={getGames}>
              <Button variant="outline-primary" type="submit">
                Get All Games
              </Button>
            </Form>
          </Container>
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
                <tr key={game.id}>
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
          <Container>
            <Form onSubmit={handlePredSubmit}>
              <h1> Submit a Bid </h1>
              <FormGroup variant="dark" controlId="formBid">
              <Form.Label>Game ID:</Form.Label>
                <Form.Control placeholder="Which Game would you like to bid on?" value={predGameID} onChange={(e) => setPredGameID(e.target.value)}/>
                <Form.Label>Pick your winner!</Form.Label>
                <DropdownButton id="dropdown-basic-button" variant="dark" title={bidTeam} >
                  <Dropdown.Item href="#/action-1" onClick={(e => setBidTeam("Home Team"))} value="Home Team"> Home Team</Dropdown.Item>
                  <Dropdown.Item href="#/action-2" onClick={(e => setBidTeam("Away Team"))}>Away Team</Dropdown.Item>
                </DropdownButton>
                <Form.Label>Bid Amount</Form.Label>
                <Form.Control placeholder="Enter a bid amount (in ETH)" value={bidAmount} onChange={(e) => setBidAmount(e.target.value)} />
                <Form.Label>Bid Odds</Form.Label>
                <Form.Control placeholder="What % chance do you think your team has to win? (out of 100)" value={bidOdds} onChange={(e) => setBidOdds(e.target.value)} />

              </FormGroup>
              <Button variant="outline-success" type="submit">
                Submit Bid 
              </Button>
            </Form>
          </Container>
        )}
        <br></br>
        {currentAccount && (
          <Container>
            <Form onSubmit={handleChallengeSubmit}>
              <h1> Submit a Challenge </h1>
              <FormGroup variant="dark" controlId="formChallenge">
                <Form.Label>Bid Amount</Form.Label>
                <Form.Control placeholder="Choose a prediction to challenger" value={predId} onChange={(e) => setPredId(e.target.value)} />
              </FormGroup>
              <Button variant="outline-success" type="submit">
                Submit Challenge 
              </Button>
            </Form>
          </Container>
        )}
        <br></br>
        {currentAccount && (
        <Container>
          <Form onSubmit = {getPreds}>
            <Button variant="outline-primary" type="submit">
              Get Predictions
            </Button>
          </Form>
        </Container>
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
              <th>Bidder's Predicted Winner</th>
              <th>Bid Amount</th>
              <th>Challenger Amount</th>
              <th>Bidder Odds</th>
              <th>Is the Bid Final?</th>
            </tr>
          </thead>
          <tbody>
            {predList.map((pred) =>(
              <tr key = {pred.id}>
                <th>{pred.bidAddr.toString().substring(32)}</th>
                <th>{pred.challengerAddr.toString().substring(32)}</th>
                <th>{pred.gameID.toString()}</th>
                <th> Home Team</th>
                <th>{String(ethers.utils.formatEther(pred.bidAmount.toBigInt()))}</th>
                <th>{String(ethers.utils.formatEther(pred.challengerAmount.toBigInt()))}</th>
                <th>{pred.bidOdds.toString()} %</th>
                <th>{pred.isFinal.toString()}</th>
              </tr>
            ))}
          </tbody>
        </Table>
        )}
        <br></br>
        {currentAccount && (
        <Container>
          <h1> Request a Payout </h1>
          <Form onSubmit = {returnResults}>
            <Button variant="outline-success" type="submit">
              Return results for all Active Predictions
            </Button>
          </Form>
        </Container>
        )}
      <br></br>
      </Container>
    </body>
  )
}

export default App;


