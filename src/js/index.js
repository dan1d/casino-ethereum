import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Web3 from 'web3';
import './../css/index.css';

class App extends Component {
  
  constructor(props) {
    super(props)
    this.state = {
      lastWinner: 0,
      timer: 0,
      numberOfBets: 0,
      minimunBet: 0,
      totalBet: 0,
      maxAmountOfBets: 0
    }
    if(typeof web3 !== 'undefined'){
      console.log("Using web3 detected from external source like Metamask");
      this.web3 = new Web3(web3.currentProvider)
    } else {
      let otherProvider = new Web3.providers.HttpProvider("http://localhost:8545");
      this.web3 = new Web3(otherProvider);
    }

    const MyContract = web3.eth.contract(
      [
        {
          "constant": true,
          "inputs": [],
          "name": "owner",
          "outputs": [
            {
              "name": "",
              "type": "address"
            }
          ],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
        },
        {
          "constant": true,
          "inputs": [],
          "name": "totalBet",
          "outputs": [
            {
              "name": "",
              "type": "uint256"
            }
          ],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
        },
        {
          "constant": true,
          "inputs": [
            {
              "name": "",
              "type": "uint256"
            }
          ],
          "name": "players",
          "outputs": [
            {
              "name": "",
              "type": "address"
            }
          ],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
        },
        {
          "constant": true,
          "inputs": [
            {
              "name": "",
              "type": "address"
            }
          ],
          "name": "playerInfo",
          "outputs": [
            {
              "name": "amountBet",
              "type": "uint256"
            },
            {
              "name": "numberSelected",
              "type": "uint256"
            }
          ],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
        },
        {
          "constant": true,
          "inputs": [],
          "name": "numberOfBets",
          "outputs": [
            {
              "name": "",
              "type": "uint256"
            }
          ],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
        },
        {
          "constant": true,
          "inputs": [],
          "name": "minimumBet",
          "outputs": [
            {
              "name": "",
              "type": "uint256"
            }
          ],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
        },
        {
          "constant": true,
          "inputs": [
            {
              "name": "player",
              "type": "address"
            }
          ],
          "name": "checkPlayerExist",
          "outputs": [
            {
              "name": "",
              "type": "bool"
            }
          ],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
        },
        {
          "constant": true,
          "inputs": [],
          "name": "maxAmountOfBets",
          "outputs": [
            {
              "name": "",
              "type": "uint256"
            }
          ],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "name": "_minimumBet",
              "type": "uint256"
            },
            {
              "name": "_maxBets",
              "type": "uint256"
            }
          ],
          "payable": false,
          "stateMutability": "nonpayable",
          "type": "constructor"
        },
        {
          "constant": false,
          "inputs": [
            {
              "name": "numberSelected",
              "type": "uint256"
            }
          ],
          "name": "bet",
          "outputs": [],
          "payable": true,
          "stateMutability": "payable",
          "type": "function"
        },
        {
          "payable": true,
          "stateMutability": "payable",
          "type": "fallback"
        },
        {
          "constant": false,
          "inputs": [
            {
              "name": "winnerNumber",
              "type": "uint256"
            }
          ],
          "name": "distributePrizes",
          "outputs": [],
          "payable": false,
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "constant": false,
          "inputs": [],
          "name": "finishBet",
          "outputs": [],
          "payable": false,
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "constant": false,
          "inputs": [],
          "name": "kill",
          "outputs": [],
          "payable": false,
          "stateMutability": "nonpayable",
          "type": "function"
        }
      ]
    )

    this.state.ContractInstance = MyContract.at("0x2b70708589aeef0e2f7e75ed49a86a38846e2df8")
  }

  componentDidMount(){
    this.updateState();
    this.setupListeners();
    setInterval(this.updateState.bind(this), 10e3)
  }

  updateState(){
    this.state.ContractInstance.minimumBet((err, result) => {
      if(result != null){
        this.setState({
          minimumBet: parseFloat(web3.fromWei(result, 'ether'))
        })
      }
    })
    this.state.ContractInstance.totalBet((err, result) => {
      if(result != null){
        this.setState({
          totalBet: parseFloat(web3.fromWei(result, 'ether'))
        })
       }
    })
    this.state.ContractInstance.numberOfBets((err, result) => {
      if(result != null){
        this.setState({
          numberOfBets: parseInt(result)
        })
      }
    })
    this.state.ContractInstance.maxAmountOfBets((err, result) => {
      if(result != null){
        this.setState({
          maxAmountOfBets: parseInt(result)
        })
      }
    })
  }

  setupListeners(){
    let liNodes = this.refs.numbers.querySelector('li');
    liNodes.forEach(number => {
      number.addEventListener('click', event => {
        this.placeBet(parseInt(event.target.innerHTML), done => {
          for(let i = 0; i < liNodes.length; i++){
            liNodes[i].className = ''
          }
        })
        event.target.className = 'number-selected';
      })
    })
  }
  placeBet(number, cb){
    let bet = this.refs['ether-bet'].value
    if(!bet) bet = 0.1
    if(parseFloat(bet) < this.state.minimumBet) {
      alert("You must bet more than the minimum. Minimum: " + this.state.minimumBet);
      cb()
    } else {
      this.state.ContractInstance.bet(number, {
        gas: 300000,
        from: web3.eth.accounts[0],
        value: web3.toWei(bet, 'ether')
      }, (err, result) => {
        cb()
      })
    }
    
  }

  render(){
    return (
      <div className="main-container">
        <h1>Bet for your best number and win huge amounts of Ether</h1>
        <div className="block">
          <b>Number of bets:</b> &nbsp;
          <span>{this.state.numberOfBets}</span>
        </div>
        <div className="block">
          <b>Last number winner:</b> &nbsp;
          <span>{this.state.lastWinner}</span>
        </div>
        <div className="block">
          <b>Total ether bet:</b> &nbsp;
          <span>{this.state.totalBet} ether</span>
        </div>
        <div className="block">
          <b>Minimum bet:</b> &nbsp;
          <span>{this.state.minimumBet} ether</span>
        </div>
        <div className="block">
          <b>Max amount of bets:</b> &nbsp;
          <span>{this.state.maxAmountOfBets} ether</span>
        </div>
        <hr/>
        <h2>Vote for the next number</h2>
        <label>
          <b>How much Ether do you want to bet? <input className="bet-input" ref="ether-bet" type="number" placeholder={this.state.minimumBet}/></b> ether
          <br/>
        </label>
        <ul ref="numbers">
          <li>1</li>
          <li>2</li>
          <li>3</li>
          <li>4</li>
          <li>5</li>
          <li>6</li>
          <li>7</li>
          <li>8</li>
          <li>9</li>
          <li>10</li>
        </ul>
      </div>
    )
  }
}


let rootElement = document.querySelector('#root');
ReactDOM.render(<App />, rootElement);
