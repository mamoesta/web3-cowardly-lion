export const gameManagerAddress = '0x383F4C2c855d60cd34016bf8185BA472E6945d61'
export const gameManagerABI = [
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "gameList",
    "outputs": [
      {
        "internalType": "string",
        "name": "homeTeam",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "awayTeam",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "homeScore",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "awayScore",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "isFinal",
        "type": "bool"
      },
      {
        "internalType": "bool",
        "name": "isLocked",
        "type": "bool"
      },
      {
        "internalType": "uint256",
        "name": "startTime",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          {
            "internalType": "string",
            "name": "homeTeam",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "awayTeam",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "homeScore",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "awayScore",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "isFinal",
            "type": "bool"
          },
          {
            "internalType": "bool",
            "name": "isLocked",
            "type": "bool"
          },
          {
            "internalType": "uint256",
            "name": "startTime",
            "type": "uint256"
          }
        ],
        "internalType": "struct GameManager.Game",
        "name": "gm",
        "type": "tuple"
      }
    ],
    "name": "createGame",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      }
    ],
    "name": "unlockGame",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      }
    ],
    "name": "lockGame",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "homeScore",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "awayScore",
        "type": "uint256"
      }
    ],
    "name": "updateGameScore",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      }
    ],
    "name": "getGame",
    "outputs": [
      {
        "components": [
          {
            "internalType": "string",
            "name": "homeTeam",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "awayTeam",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "homeScore",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "awayScore",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "isFinal",
            "type": "bool"
          },
          {
            "internalType": "bool",
            "name": "isLocked",
            "type": "bool"
          },
          {
            "internalType": "uint256",
            "name": "startTime",
            "type": "uint256"
          }
        ],
        "internalType": "struct GameManager.Game",
        "name": "gm",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
]
export const predManagerAddress = '0xdE5046230F329245273ae6E6E7253784fDd0E187'
export const predManagerABI = [
  {
    "stateMutability": "payable",
    "type": "fallback"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "addressBook",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "predId",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "predictionList",
    "outputs": [
      {
        "internalType": "address payable",
        "name": "bidAddr",
        "type": "address"
      },
      {
        "internalType": "address payable",
        "name": "challengerAddr",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "bidAmount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "challengerAmount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "bidOdds",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "bidGameWinner",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "gameID",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "bidWin",
        "type": "bool"
      },
      {
        "internalType": "bool",
        "name": "hasChallenger",
        "type": "bool"
      },
      {
        "internalType": "bool",
        "name": "isFinal",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "stateMutability": "payable",
    "type": "receive"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "addr",
        "type": "address"
      }
    ],
    "name": "hasActiveBid",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          {
            "internalType": "address payable",
            "name": "bidAddr",
            "type": "address"
          },
          {
            "internalType": "address payable",
            "name": "challengerAddr",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "bidAmount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "challengerAmount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "bidOdds",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "bidGameWinner",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "gameID",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "bidWin",
            "type": "bool"
          },
          {
            "internalType": "bool",
            "name": "hasChallenger",
            "type": "bool"
          },
          {
            "internalType": "bool",
            "name": "isFinal",
            "type": "bool"
          }
        ],
        "internalType": "struct PredictionManager.Prediction",
        "name": "pred",
        "type": "tuple"
      }
    ],
    "name": "receiveNewBid",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "returnResults",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "predIndex",
        "type": "uint256"
      },
      {
        "internalType": "address payable",
        "name": "challengerAddr",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "updateBidWithChallenger",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "index",
        "type": "uint256"
      }
    ],
    "name": "getPred",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address payable",
            "name": "bidAddr",
            "type": "address"
          },
          {
            "internalType": "address payable",
            "name": "challengerAddr",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "bidAmount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "challengerAmount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "bidOdds",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "bidGameWinner",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "gameID",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "bidWin",
            "type": "bool"
          },
          {
            "internalType": "bool",
            "name": "hasChallenger",
            "type": "bool"
          },
          {
            "internalType": "bool",
            "name": "isFinal",
            "type": "bool"
          }
        ],
        "internalType": "struct PredictionManager.Prediction",
        "name": "pred",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "addr",
        "type": "address"
      }
    ],
    "name": "getIndex",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "index",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
]