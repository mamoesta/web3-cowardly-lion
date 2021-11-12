import React, { useState, Component } from 'react';
import ReactDOM from 'react-dom';
//import App from './App';

import Jumbotron from 'react-bootstrap/Jumbotron';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import { Form } from 'react-bootstrap';

// Importing the Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css';
import Web3 from 'web3';
import {PLACE_BET_ABI, PLACE_BET_ADDR} from './config'

// This function detects most providers injected at window.ethereum
import detectEthereumProvider from '@metamask/detect-provider';
class Main extends React.Component {
  
  async componentWillMount() {
    await this.loadBlockchainData()
  }

  async loadBlockchainData() {
    const provider = await detectEthereumProvider();
    if (provider) {
      
      // From now on, this should always be true:
      // provider === window.ethereum
      let web3 = new Web3(Web3.givenProvider || "http://127.0.0.1:7545")
      const accounts = await window.ethereum.request({method: 'eth_requestAccounts'});
      const defaultAccount = accounts[0]
      var bal = (await web3.eth.getBalance(defaultAccount))/1000000000000000000
      this.setState({bal})
      this.setState({defaultAccount})
      this.setState({web3})
      try {
        var placeBet = await new web3.eth.Contract(PLACE_BET_ABI,PLACE_BET_ADDR)
        this.setState({placeBet})
      } catch(error){
        console.log('Error: contract could not be found: ', error)
      }
    } else {
      //bail
      console.log('Please install MetaMask!');
}

}
  constructor(props){
    super(props);
    this.state = {
      defaultAccount : '0x0',
      bal: 0,
      ethEnabled: false,
      amount: 0,
      placeBet: {},
      web3: {}
    }
    this.fundContract = this.fundContract.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.fundContractMethod = this.fundContractMethod.bind(this)
  }
  // Send ether to main contract (no method call)
  async fundContract (amount) {
    await this.state.web3.eth.sendTransaction({from: this.state.defaultAccount, to:PLACE_BET_ADDR, value: this.state.web3.utils.toWei(amount, 'ether')},
      function(error,txHash) {
        if(!error) {
          console.log(txHash)
        }
        else {
          console.log(error)
        }
      })
    
  }
  // Send an int to param contract method
  async fundContractMethod(amount) {
    const amount_num = parseInt(amount)
    this.state.placeBet.methods.receive(amount_num).send({from: this.state.defaultAccount, value: this.state.web3.utils.toWei(amount, 'ether')}).once('transactionHash', function(hash)
    { console.log('txhash: ', hash) })
    .once('receipt', function(receipt){ console.log('receipt: ', receipt.events) })
    .on('error', function(error){ console.log(error) })
    //console.log("Total Funds in the contract since init: ")
  }
  async handleSubmit(event) {
    var amount = event.target[0].value
    event.preventDefault()
    //await this.fundContract(amount)
    await this.fundContractMethod(amount)
  }
    render (){
    return (
      <Container>
        <Jumbotron>
          <h1 className="header">Welcome to the Cowardly Lion</h1>
          <h4>Current wallet address {this.state.defaultAccount}</h4>
          <h4>Balance {this.state.bal}</h4>
          <h2>
            Place A Bid:
          </h2>
          <Form onSubmit={this.handleSubmit}>
            <Form.Group>
              <Form.Label>ETH to bid</Form.Label>
              <Form.Control type="text" controlid="bidAmount"/>
              <Form.Text className="text-muted">
                Foo bar baz
              </Form.Text>
            </Form.Group>
            <Form.Group controlId="formBasicSelect">
              <Form.Label>Select Win Likelihood</Form.Label>
              <Form.Control as="select" controlid="bidOdds">
                <option value="0">25</option>
                <option value="1">50</option>
                <option value="2">75</option>
              </Form.Control>
              <Form.Label>Select Winning Team</Form.Label>
              <Form.Control as="select" controlid="bidWinningTeam">
                <option value="0">Lions</option>
                <option value="1">Packers</option>
              </Form.Control>
          </Form.Group>
            <Button variant="primary" type="submit">
              Submit
            </Button>
          </Form>
        </Jumbotron>
      </Container>
    )
  }
}

ReactDOM.render(<Main />, document.getElementById('root'));