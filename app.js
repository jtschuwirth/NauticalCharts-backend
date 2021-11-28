//testyeo nginx despues borrar

const { createServer } = require("http");

const { Server } = require("socket.io");
const express = require("express");
const { exists } = require("fs");



const app = express();

const httpServer = createServer(app);

const options = { transports: ["websocket"] };
const io = new Server(httpServer, options);

const port = process.env.port || 8000;
httpServer.listen(port);




class Queue {
    constructor(room, size) {
        this.users = [];
        this.games = [];
        this.size = size;

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
            io.to(room).emit("statusQueue"+this.size.toString(), {lastId: lastId, players: players});
            
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
            this.games.push({id: id, players: [], turn: [], currentTurn: 1})
        }
        this.games[id-1].players.push(player);

        if (this.games[id-1].players.length == players.length) {
            io.to(id).emit("partida", `Partida iniciada id: ${id}`);
            let dices = this.rollDices();
            let map = this.crearMapa();
            let pos = this.pos_inicial(map);
            io.to(id).emit("startInfo", {
                dices: dices, 
                pos: [pos.r, pos.q, pos.s],
                map: map});
        }

        socket.on("endTurn", (data) => {
            console.log(`endTurn ${id}: ${data.userAddress}`);
            io.to(id).emit("endTurn", data);
            if (this.games[id-1].turn.includes(data.userAddress)==false) {
                this.games[id-1].turn.push(data.userAddress)
            }

            if (this.games[id-1].turn.length == players.length) {
                if (this.games[id-1].currentTurn == 5) {
                    console.log("End Game")
                    io.to(id).emit("endGame", {winner: "Winner"});
    
                } else {
                console.log("New Round");
                console.log(`lista de jugadores que ya jugaron: ${this.games[id-1].turn}`);
                let dices = this.rollDices();
                this.games[id-1].currentTurn++;
                io.to(id).emit("newRound", {dices: dices, currentTurn: this.games[id-1].currentTurn});
                this.games[id-1].turn = []
                console.log(`lista de jugadores que jugaron vacia: ${this.games[id-1].turn}`);
                }
            }
        });
    }

    rollDices() {
        const dice0 = Math.floor(Math.random() * (7 - 1)) + 1;
        const dice1 = Math.floor(Math.random() * (7 - 1)) + 1;
        const dice2 = Math.floor(Math.random() * (7 - 1)) + 1;
        return [dice0, dice1, dice2]
    }

    crearMapa() {
        var board_size = 6;
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
        var b_size = 6;
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

function main_queues() {
    const cola1 = new Queue("waitingRoom1", 1);
    const cola2 = new Queue("waitingRoom2", 2);
    const cola3 = new Queue("waitingRoom3", 3);
    const cola4 = new Queue("waitingRoom4", 4);
}

main_queues();