import React, { useState, Component } from 'react';
import ReactDOM from 'react-dom';
//import App from './App';

import Jumbotron from 'react-bootstrap/Jumbotron';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import { Form, FormControl, InputGroup } from 'react-bootstrap';

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
      console.log(web3.eth.defaultAccount)
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
  }
  async fundContract (amount_num) {
    await this.state.web3.eth.sendTransaction({from: this.state.defaultAccount, to:PLACE_BET_ADDR, value: this.state.web3.utils.toWei(amount_num, 'ether')},
      function(error,txHash) {
        if(!error) {
          console.log(txHash)
        }
        else {
          console.log(error)
        }
      })
    
  }
  async handleSubmit(event) {
    var amount_num = event.target[0].value
    event.preventDefault()
    await this.fundContract(amount_num)
  }
    render (){
    return (
      <Container>
        <Jumbotron>
          <h1 className="header">Welcome to the Cowardly Lion</h1>
          <h4>Current wallet address {this.state.defaultAccount}</h4>
          <h4>Balance {this.state.bal}</h4>
          <h2>
            Options:
          </h2>
          <Form onSubmit={this.handleSubmit}>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>ETH to wager</Form.Label>
              <Form.Control type="text"/>
              <Form.Text className="text-muted">
                Foo bar baz
              </Form.Text>
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