const { createServer } = require("http");

const { Server } = require("socket.io");
const express = require("express");
var cloneDeep = require('lodash.clonedeep');
var mysql = require('mysql');

const app = express();
const httpServer = createServer(app);
const Web3 = require('web3');
const BN = require('bn.js');
const options = { transports: ["websocket"] };
const io = new Server(httpServer, options);

var con = mysql.createConnection({
    host     : process.env.RDS_HOSTNAME,
    user     : process.env.RDS_USERNAME,
    password : process.env.RDS_PASSWORD,
    port     : process.env.RDS_PORT,
    database : process.env.RDS_DB_NAME
});

const port = process.env.port || 8000;
httpServer.listen(port);

HMY_RPC_URL = "https://api.s0.b.hmny.io"
const web3 = new Web3(HMY_RPC_URL);

const abi = [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "spender",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "Approval",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "Transfer",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "spender",
          "type": "address"
        }
      ],
      "name": "allowance",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "spender",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "approve",
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
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "balanceOf",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "decimals",
      "outputs": [
        {
          "internalType": "uint8",
          "name": "",
          "type": "uint8"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "spender",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "subtractedValue",
          "type": "uint256"
        }
      ],
      "name": "decreaseAllowance",
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
          "internalType": "address",
          "name": "spender",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "addedValue",
          "type": "uint256"
        }
      ],
      "name": "increaseAllowance",
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
      "inputs": [],
      "name": "name",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "symbol",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "totalSupply",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "recipient",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "transfer",
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
          "internalType": "address",
          "name": "sender",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "recipient",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "transferFrom",
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
          "internalType": "address",
          "name": "_address",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_funds",
          "type": "uint256"
        }
      ],
      "name": "mint",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function",
      "payable": true
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "transferOwnership",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function",
      "payable": true
    }
  ];
const contract_address = "0x9dCf351a9CDa08B88265C462533C79420b8921Dd";

let private_key = "8091135a184c2cf774bbd1e6dbf32a718bbbe5c8a1da709885169631e2b8557b"
let hmyMasterAccount = web3.eth.accounts.privateKeyToAccount(private_key);
web3.eth.accounts.wallet.add(hmyMasterAccount);
web3.eth.defaultAccount = hmyMasterAccount.address;

const UGT = new web3.eth.Contract(abi, contract_address);


class Database {
  constructor() {
    con.connect(function(err) {
      if (err) throw err;
      console.log("Connected!");
    });
    io.on("connection", socket => {
      this.createTables(socket);

      socket.on("newConnection", (data) => {
        if (this.isUser(data.userAddress)==false && data.userAddress != "Not Connected") {
          this.addUser(data.userAddress, socket);

        console.log(this.usersInDB());
        }
      })
    })
  }
  createTables(socket) {
    var sql = "CREATE TABLE IF NOT EXISTS users (id INT AUTO_INCREMENT PRIMARY KEY, address VARCHAR(255))";
    con.query(sql, function (err, result) {
      if (err) throw err;
    });

  }

  isUser(value) {
    con.query(`SELECT COUNT(*) FROM users WHERE address=${value})`, function (err, result, fields) {
      if (err) throw err;
      console.log(result);
    })
  }

  addUser(value, socket) {
    var sql = `INSERT INTO users (address) VALUES ( ${value})`;
    con.query(sql, function (err, result) {
      if (err) throw err;
      console.log(`User ${value} inserted)`);
    });

  }

  usersInDB() {
    return false
  }
}

class Queue {
    constructor(room, queueSize) {
        this.users = [];
        this.games = [];
        this.size = queueSize;
        this.boardSize = 6;

        io.on("connection", socket => {
            console.log(`client connected to queue size ${this.size}`);

            // listen for incoming data msg on this newly connected socket
            socket.on("enter"+this.size.toString(), (data) => {
                if (this.users.includes(data) == false) 
                {
                    socket.join(room);
                    io.to(room).emit("enter"+this.size.toString(), data);
                    this.users.push(data);
                    console.log(this.users);
                    this.checkMatchMaking(room);
                } else {
                    io.to(room).emit("enter"+this.size.toString(), data);
                }
            });

            socket.on("out"+this.size.toString(), (data) => {
                io.to(room).emit("out"+this.size.toString(), data);
                const index = this.users.indexOf(data);
                this.users.splice(index, 1);
                console.log(this.users);;
            });

            socket.on("foundGame"+this.size.toString(), (data) => {
                console.log(`${data.player} found game`);
                this.partida(socket, data.id, data.player, data.players);
            });
        });
    }
    //por ahora se crean partida individuales al entrar a la cola
    checkMatchMaking(room) {
        if (this.users.length >= this.size) {
            console.log("Existen jugadores suficientes para una partida");

            //por ahora los matcheara en orden de entrada y en partidas individuales
            var players = [];
            for (let i=0; i<this.users.length; i++) {
                players.push(this.users[i]);
            }
            var lastId = this.games.length
            io.to(room).emit("statusQueue"+this.size.toString(), {lastId: lastId, players: players, boardSize: this.boardSize});
            
            //quitamos al jugador de la Queue
            for (let i=0; i<players.length; i++) {
                var index = this.users.indexOf(players[i]);
                this.users.splice(index,1);
                console.log(this.users);
            }
        }
    }

    partida(socket, id, player, players) {
        socket.join(id);
        console.log(`partida iniciada ${id}`)
        if (this.games.length == id-1) {
            this.games.push({id: id, players: [], currentTurn: 0, turnState: [], mapState: [], mapOptions: []})
        }
        this.games[id-1].players.push({player: player, points: 0});

        if (this.games[id-1].players.length == players.length) {
            io.to(id).emit("partida", `Partida iniciada id: ${id}`);
            let map = this.crearMapa();
            this.games[id-1].mapState = map;
            let pos = this.pos_inicial(map);
            io.to(id).emit("startInfo", {
                pos: [pos.r, pos.q, pos.s],
                map: map,
            });
            var thisPlayerMapState;
        }

        socket.on("loot", (data) => {
            let looted;
            let points;
            let position = data.currentPosition;
            if (thisPlayerMapState == undefined) {
                thisPlayerMapState = cloneDeep(this.games[id-1].mapState);
            }
            let currentValue = thisPlayerMapState[position[0]+this.boardSize][position[1]+this.boardSize];
            if (data.lootValue > currentValue) {
                looted = currentValue;
            } else {
                looted = data.lootValue;
            }
            if (currentValue == 100) {
                socket.emit("lootResult", {result: "sea", looted: 0, points: points});

            } else if (currentValue == 0) {
                socket.emit("lootResult", {result: "empty", looted: 0, points: points});

            } else {
                for (let i =0; i<this.games[id-1].players.length; i++) {
                    if (data.userAddress == this.games[id-1].players[i].player) {
                        this.games[id-1].players[i].points = this.games[id-1].players[i].points+looted;
                        points = this.games[id-1].players[i].points;
                    }
                }
                thisPlayerMapState = this.newMap(thisPlayerMapState, -looted, data.currentPosition);
                this.games[id-1].mapOptions.push(thisPlayerMapState);
                console.log(thisPlayerMapState[position[0]+this.boardSize][position[1]+this.boardSize]);
                socket.emit("lootResult", {result: "",looted: looted, points: points});
            }

        });

        socket.on("endTurn", (data) => {
            console.log(`endTurn ${id}: ${data.userAddress}`);
            io.to(id).emit("endTurn", data);
            if (this.games[id-1].turnState.includes(data)==false) {
                this.games[id-1].turnState.push(data)
            }

            if (this.games[id-1].turnState.length == players.length) {
                if (this.games[id-1].currentTurn == 5) {
                    console.log("End Game")
                    io.to(id).emit("endGame", {winner: "Winner"});
    
                } else {
                console.log("New Round");
                let dices = this.rollDices();
                this.games[id-1].currentTurn++;
                this.games[id-1].mapState = this.returnBestMap(this.games[id-1].mapState, this.games[id-1].mapOptions);
                thisPlayerMapState = undefined;
                io.to(id).emit("newRound", {
                    dices: dices, 
                    currentTurn: this.games[id-1].currentTurn,
                    turnState: this.games[id-1].turnState,
                    mapState: this.games[id-1].mapState,
                });
                this.games[id-1].turnState = []
                }
            }
        });
    }

    returnBestMap(mapState, mapOptions) {
        let bestMap = mapState;
        for (let i = 0; i < mapOptions.length; i++) {
            for (let j = 0; j < mapOptions[i].length; j++) {
                for (let n = 0; n < mapOptions[i][j].length; n++) {
                    if (mapOptions[i][j][n]<bestMap[j][n]) {
                        bestMap[j][n] = mapOptions[i][j][n];
                    }
                }
            }
        }
        return bestMap;

    }


    newMap(map, change, currentPosition) {
        const old_tiles = map;
        const new_tiles = old_tiles.map((_) => _ );

        new_tiles[currentPosition[0]+this.boardSize][currentPosition[1]+this.boardSize]= new_tiles[currentPosition[0]+this.boardSize][currentPosition[1]+this.boardSize]+change;    
        return new_tiles
    }

    rollDices() {
        const dice0 = Math.floor(Math.random() * (7 - 1)) + 1;
        const dice1 = Math.floor(Math.random() * (7 - 1)) + 1;
        const dice2 = Math.floor(Math.random() * (7 - 1)) + 1;
        return [dice0, dice1, dice2]
    }

    crearMapa() {
        var board_size = this.boardSize ;
        var b_size = board_size;
        var n_isles = 15;
        var min_dis = 1;
        var loot_min = 2;
        var loot_max = 10;
      
        //creamos el array con valores (200 -> no se renderiza) y el tamaño correcto
        var aux = (board_size*2) + 1;
        var mapa = Array.apply(null, Array(aux)).map( () => {
            return Array.apply(null, Array(aux)).map( () => {return 200} )
        });
      
        // agregamos todas las posiciones donde pueden haber islas
        // además definimos estas posiciones como agua inicialmente (100)
        var pos_islas = []
        for (var r = -board_size; r < (board_size +1); r++) {
          var min_q = -board_size - Math.min(r, 0)
          var max_q = board_size - Math.max(r, 0)
          for (var q = min_q; q < max_q + 1; q++) {
            mapa[r + b_size][q + b_size] = 100
            pos_islas.push({r: r, q: q});
          }
        }
        this.shuffle(pos_islas)
      
        //asignamos las islas en el tablero
        while (pos_islas.length > 0 && n_isles > 0){
          var pos = pos_islas.pop()
          mapa[pos.r + b_size][pos.q + b_size] = this.getRandomInt(loot_min, loot_max)
          n_isles--;
      
          var temp = [];
          for (var i = 0; i < pos_islas.length; i++){
            if ( this.dist( pos_islas[i], pos) > min_dis ){
              temp.push(pos_islas[i])
            }
          }
          pos_islas = temp;
        }
      
        return mapa;
      }

    pos_inicial(mapa){
        var b_size = this.boardSize ;
        while(true){
          var pos = {
            r: this.getRandomInt(1, b_size) + this.getRandomInt(1, b_size)-b_size,
            q: this.getRandomInt(1, b_size) + this.getRandomInt(1, b_size)-b_size,
            s: null
          }
          if (mapa[pos.r - 1+b_size][pos.q - 1+b_size] == 100){
              pos.s = -pos.r-pos.q
            return pos;
          }
        }
      }

    dist(coord_1, coord_2){
        var s1 = - coord_1.q - coord_1.r
        var s2 = - coord_2.q - coord_2.r
        return (Math.abs(coord_1.q - coord_2.q) + Math.abs(coord_1.r - coord_2.r) + Math.abs(s1 - s2)) / 2
      }
      
    shuffle(array) {
        //https://dev.to/codebubb/how-to-shuffle-an-array-in-javascript-2ikj
        for (let i = array.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          const temp = array[i];
          array[i] = array[j];
          array[j] = temp;
        }
    }
      
    getRandomInt(min, max) {
        //https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Math/random
        return Math.floor(Math.random() * (max - min)) + min;
    }

}

class TokenGiver {
    constructor() {
        io.on("connection", socket => {
            socket.on("claimONE", (data) => {
                if (data.userAddress != "Not Connected") {
                    try  {
                        this.transferOne(data.userAddress)
                    } catch(error) {console.log(error)}

                }
            })
            socket.on("claimUGT", (data) => {
                if (data.userAddress != "Not Connected") {
                    try  {
                        this.transferUGT(data.userAddress)
                    } catch(error) {console.log(error)}

                }
            })
        })
    }

    async transferOne(to) {
        const gasPrice = new BN(await web3.eth.getGasPrice()).mul(new BN(1));
        const gasLimit = 6721900;

        var exp = new BN(10).pow(new BN(18));
        var value = new BN(5).mul(exp);

        const from = web3.eth.defaultAccount;

        const result = await web3.eth
            .sendTransaction({ from, to, value, gasPrice, gasLimit })
            .on('error', console.error);

        console.log(`Send tx: ${result.transactionHash} result: `, result.status);
    }
    async transferUGT(to) {
        const gasPrice = new BN(await web3.eth.getGasPrice()).mul(new BN(1));
        const gasLimit = 6721900;

        var exp = new BN(10).pow(new BN(18));
        var value = new BN(5).mul(exp);

        const from = web3.eth.defaultAccount;

        const result = await UGT.methods
            .transfer(to, value)
            .send({from: from, gasPrice: gasPrice, gas: gasLimit})
            .on('error', console.error);

        console.log(`Send tx: ${result.transactionHash} result: `, result.status);
    }
}


function initialize() {
    var db = new Database();
    var tg = new TokenGiver();
    var queue1 = new Queue("waitingRoom1", 1);
    var queue2 = new Queue("waitingRoom2", 2);
    var queue3 = new Queue("waitingRoom3", 3);
    var queue4 = new Queue("waitingRoom4", 4);
}

initialize();