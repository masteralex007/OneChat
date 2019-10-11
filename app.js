var express = require("express");
var app     = express();
var server    = app.listen(3000);
var io      = require("socket.io").listen(server);
var nicknames = [];

app.set("view engine", "ejs");



app.get("/", function(req, res){
    res.render("index");
});


//the below code will turn on the connection event and this is the first thing a client does i.e turns onn a connection 
io.sockets.on("connection", function(socket){
    socket.on("new user", function(data, callback){
        if (nicknames.indexOf(data) != -1){
            callback(false);
        } else{
            callback(true);
            socket.nickname = data;
            nicknames.push(socket.nickname);
           updateNicknames();
        }
    });

    function updateNicknames(){
        io.sockets.emit("usernames", nicknames);
    }

    socket.on("send message", function(data){
        io.sockets.emit("new message", {msg: data, nick: socket.nickname}); //message is sint to all the users includng me
        // socket.broadcast.emit('new message', data); message is sent to all the users excluding me
    });

    //the below code is for removing a user if he/she left the database
    socket.on("disconnect", function(data){
        if(!socket.nickname) return;
        nicknames.splice(nicknames.indexOf(socket.nicknames), 1);
        updateNicknames();
    });
});

// server.listen(3000, function(){
//     console.log("server is listening");
// });

