import React, { useEffect, useState} from "react";
import {ethers} from "ethers";
import "./App.css";
import gmABI from "./utils/GameManager.json";
import predABI from "./utils/PredictionManager.json";
import Container from 'react-bootstrap/Container';
import Table from 'react-bootstrap/Table';
import 'bootstrap/dist/css/bootstrap.min.css';
import Form from 'react-bootstrap/Form'
import {DropdownButton, Dropdown, FormGroup, Row, Col, Modal } from "react-bootstrap";
import Button from 'react-bootstrap/Button';
import Image from 'react-bootstrap/Image'
import Card from 'react-bootstrap/Card'



const App = () => {
  //Game Settings
  const [homeTeam, setHomeTeam] = useState("");
  const [awayTeam, setAwayTeam] = useState("");
  const [homeScore, setHomeScore] = useState("");
  const [awayScore, setAwayScore] = useState("");
  const [gameId, setGameId] = useState("");
  //Prediction settings
  const [bidTeam, setBidTeam] = useState("")
  const [bidAmount, setBidAmount] = useState("");
  const [bidOdds, setBidOdds] = useState("");
  const [predGameID, setPredGameID] = useState("");
  const [tempGame, setTempGame] = useState({});
  const [showGames, setShowGames] = useState(false);
  const [gameList, setGameList] = useState([]);
  const [showPreds, setShowPreds] = useState(false);
  const [predList, setPredList] = useState([]);
  
  // challenger settings
  const [predAddr, setPredAddr] = useState("");
  
  const [showModal, setShowModal] = useState(false);

  const gameABI = gmABI.abi;
  const gameAddress = "0xa82fF9aFd8f496c3d6ac40E2a0F282E47488CFc9";
  const predictionABI = predABI.abi;
  const predictionAddress = "0xb7278A61aa25c888815aFC32Ad3cC52fF24fE575";
  const [currentAccount, setCurrentAccount] = useState("");

  const isBackgroundDark = true;



  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        // the ethereum object", ethereum);
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
    handleClose();
    event.preventDefault();
    console.log(ethers.utils.parseEther(bidAmount).toString())
    const pred = {"bidAddr": currentAccount, "challengerAddr":"0x0000000000000000000000000000000000000000","bidAmount": bidAmount, "challengerAmount": 0, "bidOdds":bidOdds,"gameWinner": "Tigers", "gameID": predGameID, "bidWin": true, "hasChallenger": true, "isFinal": true, listPointer:0}
    console.log("Here is the prediction: ", pred)
    await addPred(pred);
  }
  const handleChallengeSubmit = async (event) => {
    event.preventDefault();
    await addChallenge(predAddr);
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
        pred.bidAmount = String(ethers.utils.parseEther(pred.bidAmount).toBigInt());
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const predAddressContract = new ethers.Contract(predictionAddress, predictionABI, signer);
        const options = {value: pred.bidAmount};
        const predTxn = await predAddressContract.handleBidInfo(pred, options);
        await predTxn.wait();
        console.log("Mined -- ", predTxn.hash);
      }
    }
    catch(error){
      console.log(error)    
    }
  }
  const addChallenge = async(predAddr) => {
    try {
      const {ethereum} = window;
      if (ethereum){
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const predAddressContract = new ethers.Contract(predictionAddress, predictionABI, signer);
        //const gameAddressContract = new ethers.Contract(gameAddress, gameABI, signer);
        const options = {value: await predAddressContract.getMultiplier(predAddr)};
        const challengeTxn = await predAddressContract.updateBidWithChallenger(String(predAddr), String(currentAccount),options);
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
        //this isn't robust, only handles payouts based off of bidder executing the function
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
            var predTxn = await predAddressContract.predictions(predID);
            //predTxn.id = this.predCounter;
            if(!predTxn.isStale){
              predList.push(predTxn);
            }
            predCounter++;

          }
          catch(error){
            //console.log("error happened");
            isEmpty=true;
          }
        }
        if(predList.length < 1){
          console.log("There are no predictions right now!")
        }
        else{
        console.log(predList);
        setPredList(predList);
        setShowPreds(true);
        }
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
  const handleClose = () => setShowModal(false);
  const handleShow = (data) =>  {
    setTempGame(data);
    setPredGameID(data.id);
    setShowModal(true);
  };
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
        {currentAccount && showGames &&  ( 
          <Row xs={1} md={2} className="g-3">
              {gameList.map((game) =>(
                 <Col key = {game.id}>
                  <Card bg="dark" style={{ width: '20 rem', height:'20 rem' }}>
                    <Card.Body>
                      <Card.Title>{game.homeTeam.toString()} vs. {game.awayTeam.toString()}</Card.Title>
                      <Card.Text>Game ID: {game.id.toString()}</Card.Text>
                      <Button variant="primary" onClick={()=>handleShow(game)}>
                        Make a Prediction
                      </Button>
                    </Card.Body>
                  </Card>
                </Col> 
                ))}
          </Row>
        )}
        <Modal show={showModal} onHide={handleClose} bg="dark">
          <Modal.Header closeButton>
            <Modal.Title>{tempGame.awayTeam} @ {tempGame.homeTeam}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form >
              <FormGroup variant="dark" controlId="formBid">
                    <Form.Label>Pick your winner!</Form.Label>
                    <DropdownButton id="dropdown-basic-button" variant="dark" title={bidTeam} >
                      <Dropdown.Item href="#" onClick={(e) => setBidTeam(tempGame.homeTeam)}> {tempGame.homeTeam}</Dropdown.Item>
                      <Dropdown.Item href="#" onClick={(e => setBidTeam(tempGame.awayTeam))}>{tempGame.awayTeam}</Dropdown.Item>
                    </DropdownButton>
                    <Form.Label>Bid Amount</Form.Label>
                    <Form.Control placeholder="Enter a bid amount (in ETH)" value={bidAmount} onChange={(e) => setBidAmount(e.target.value)} />
                    <Form.Label>Bid Odds</Form.Label>
                    <Form.Control placeholder=" % chance to win? (out of 100)" value={bidOdds} onChange={(e) => setBidOdds(e.target.value)} />
              </FormGroup>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="success"  onClick={handlePredSubmit}>
              Submit Prediction
            </Button>
          </Modal.Footer>
        </Modal>
        <br></br>
        {currentAccount && (
          <Container>
            <Form onSubmit={handleChallengeSubmit}>
              <h1> Submit a Challenge </h1>
              <FormGroup variant="dark" controlId="formChallenge">
                <Form.Label>Bid Amount</Form.Label>
                <Form.Control placeholder="Choose a prediction address to challenge" value={predAddr} onChange={(e) => setPredAddr(e.target.value)} />
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
              <th>Bid Address</th>
              <th>Challenger Address</th>
              <th>Game ID</th>
              <th>Bidder's Predicted Winner</th>
              <th>Bid Amount</th>
              <th>Challenger Amount</th>
              <th>Bidder Odds</th>
              <th>Open for challengers?</th>
            </tr>
          </thead>
          <tbody>
            {predList.map((pred) =>(
              <tr key = {pred.listPointer}>
                <th>{pred.bidAddr.toString()}</th>
                <th>{pred.challengerAddr.toString().substring(32)}</th>
                <th>{pred.gameID.toString()}</th>
                <th> Home Team</th>
                <th>{String(ethers.utils.formatEther(pred.bidAmount.toBigInt()))}</th>
                <th>{String(ethers.utils.formatEther(pred.challengerAmount.toBigInt()))}</th>
                <th>{pred.bidOdds.toString()} %</th>
                <th>{(!pred.hasChallenger).toString()}</th>
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


