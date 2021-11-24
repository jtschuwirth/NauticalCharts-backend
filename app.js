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
                    this.checkMatchMaking(socket, room);
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
                this.partida(socket, data.id, data.players);
            });
        });
    }
    //por ahora se crean partida individuales al entrar a la cola
    checkMatchMaking(socket, room) {
        if (this.users.length >= 1) {
            console.log("Existen jugadores suficientes para una partida");

            //por ahora los matcheara en orden de entrada y en partidas individuales
            var players = [this.users[0]];
            io.to(room).emit("statusQueue", {players: players});
            
            //quitamos al jugador de la Queue
            for (let i=0; i<players; i++) {
                var index = this.users.indexOf(players[i]);
                this.users.splice(index,1);
                console.log(this.users);
            }
        }
    }

    partida(socket, id, players) {
        socket.join(id);
        console.log(`partida iniciada ${id}`)
        io.to(id).emit("partida", `Partida iniciada id: ${id}`);

        let endedTurn = [];
        socket.on("endTurn", (data) => {
            console.log(`endTurn ${id}: ${data.userAddress}`);
            io.to(id).emit("endTurn", data);
            if (!endedTurn.includes(data.userAddress)) {
                endedTurn.push(data.userAddress)
            }
            if (endedTurn.length == players.length) {
                io.to(id).emit("endTurn", "New Round");
            }
        });

    }

}

function main_queue() {
    const cola = new Queue("waitingRoom");
}

main_queue();