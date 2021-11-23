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
                const id = "idx"+data.players[0];
                console.log(id);
                this.partida(socket, id, data.players[0]);
            });
        });
    }
    //por ahora se crean partida individuales al entrar a la cola
    checkMatchMaking(socket, room) {
        if (this.users.length >= 1) {
            console.log("Existen jugadores suficientes para una partida");

            //por ahora los matcheara en orden de entrada y en partidas individuales
            var player1 = this.users[0];
            var players = [player1];
            io.to(room).emit("statusQueue", players);
            
            //quitamos al jugador de la Queue
            var index_p1 = this.users.indexOf(player1);
            this.users.splice(index_p1,1);
            console.log(this.users);
        }
    }

    partida(socket, id, player) {
        socket.join(id);
        io.to(id).emit("partida", `Partida iniciada id: ${id}`);

        socket.on("endTurn", (data) => {
            console.log(`endTurn ${id}: ${data.playerId}`);
            io.to(id).emit("endTurn", data);
        });

    }

}

function main_queue() {
    const cola = new Queue("waitingRoom");
}

main_queue();