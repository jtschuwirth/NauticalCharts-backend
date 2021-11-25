const { createServer } = require("http");

const { Server } = require("socket.io");
const express = require("express");
const app = express();

const httpServer = createServer(app);

const options = { transports: ["websocket"] };
const io = new Server(httpServer, options);


const port = process.env.port || 8000;
httpServer.listen(port);

class Queue {
    constructor(room) {
        this.users = [];
        this.games = [];

        io.on("connection", socket => {
            console.log('client connected');

            // listen for incoming data msg on this newly connected socket
            socket.on("enter", (data) => {
                if (this.users.includes(data) == false) 
                {
                    socket.join(room);
                    io.to(room).emit("enter", data);
                    this.users.push(data);
                    console.log(this.users);
                    this.checkMatchMaking(room);
                } else {
                    io.to(room).emit("enter", data);
                }
            });

            socket.on("out", (data) => {
                io.to(room).emit("out", data);
                const index = this.users.indexOf(data);
                this.users.splice(index, 1);
                console.log(this.users);;
            });

            socket.on("foundGame", (data) => {
                console.log(`${data.player} found game`);
                this.partida(socket, data.id, data.player, data.players);
            });
        });
    }
    //por ahora se crean partida individuales al entrar a la cola
    checkMatchMaking(room) {
        if (this.users.length >= 2) {
            console.log("Existen jugadores suficientes para una partida");

            //por ahora los matcheara en orden de entrada y en partidas individuales
            var players = [];
            for (let i=0; i<this.users.length; i++) {
                players.push(this.users[i]);
            }
            var lastId = this.games.length
            io.to(room).emit("statusQueue", {lastId: lastId, players: players});
            
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
            this.games.push({id: id, turn: [], currentTurn: 0})
        }
        io.to(id).emit("partida", `Partida iniciada id: ${id}`);
        let dices = this.rollDices();
        let pos = this.pos_inicial();
        let map = this.crearMapa();
        io.to(id).emit("startInfo", {
            dices: dices, 
            pos: pos,
            map: map});

        socket.on("endTurn", (data) => {
            console.log(`endTurn ${id}: ${data.userAddress}`);
            io.to(id).emit("endTurn", data);
            if (this.games[id-1].turn.includes(data.userAddress)==false) {
                this.games[id-1].turn.push(data.userAddress)
            }
            if (this.games[id-1].currentTurn == 5) {
                console.log("End Game")
                io.to(id).emit("endGame", {player: player, winner: "Winner"});

            } else if (this.games[id-1].turn.length == players.length) {
                console.log("New Round");
                let dices = this.rollDices();
                io.to(id).emit("newRound", {player: player, dices: dices});
                this.games[id-1].turn = []
                this.games[id-1].currentTurn++;
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
        const size_x = 13;
        const size_y = 13;
        var n_isles = 10;
        const min_dis = 3;
        const loot_min = 2;
        const loot_max = 10;
        //creamos el array con valores (100 - agua) y el tamaño correcto
        var mapa = Array.apply(null, Array(size_y)).map( () => {
            return Array.apply(null, Array(size_x)).map( () => {return 100} )
        });
      
        //las islas no pueden estar en los límites del mapa
        var pos_islas = []
        for (var i = 1; i < size_x - 1; i++) {
          for (var j = 1; j < size_y - 1; j++) {
            pos_islas.push({x: i, y: j});
          }
        }
        this.shuffle(pos_islas)
      
        //asignamos las islas en el tablero
        while (pos_islas.length > 0 && n_isles > 0){
            var pos = pos_islas.pop();
            mapa[pos.y][pos.x] = this.getRandomInt(loot_min, loot_max);
            n_isles--;
          
      
            var temp = [];
            for (var i = 1; i < pos_islas.length; i++){
                if ( this.dist( pos_islas[i], pos) > min_dis ){
                temp.push(pos_islas[i])
                }
            }
            pos_islas = temp
        }
      
      //{x: xVal, y: yVal}
      
        return mapa;
    }

    pos_inicial() {
        var pos = [0,0,0];
        return pos
    }

    dist(coord_1, coord_2) {
        return Math.abs(coord_1.x - coord_2.x) + Math.abs(coord_1.y - coord_2.y)
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

function main_queue() {
    const cola = new Queue("waitingRoom");
}

main_queue();