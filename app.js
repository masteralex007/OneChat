var express = require("express");
var app     = express();
var server    = app.listen(3000);
var io      = require("socket.io").listen(server);
var users   = {};

app.set("view engine", "ejs");



app.get("/", function(req, res){
    res.render("index");
});


//the below code will turn on the connection event and this is the first thing a client does i.e turns onn a connection 
io.sockets.on("connection", function(socket){
    socket.on("new user", function(data, callback){
        if (data in users){
            callback(false);
        } else{
            callback(true);
            socket.nickname = data;
            users[socket.nickname] = socket;
            updateNicknames();
        }
    });

    function updateNicknames(){
        io.sockets.emit("usernames", Object.keys(users));
    }

    socket.on("send message", function(data, callback){
        //the below code is to replicate wishper functionallity in which a user  
        var msg = data.trim();
        if(msg.substr(0,3) === '/w '){
            msg = msg.substr(3);
            //here we check wheather user have endered a message in the message box or left it blank
            var ind = msg.indexOf(' ');
            if(ind !== -1){
                var name = msg.substring(0, ind);
                var msg  = msg.substring(ind + 1);
                if(name in users){
                    users[name].emit('wishper', {msg: msg, nick: socket.nickname});
                    console.log('Wishper!');
                } else{
                    callback('Error! Enter a valid user.');
                }  
            } else{
                callback("Error! Please enter a message for your wishper");
            }
        } else{
            io.sockets.emit("new message", {msg: data, nick: socket.nickname}); //message is sint to all the users includng me
        }
        // socket.broadcast.emit('new message', data); message is sent to all the users excluding me
    });

    //the below code is for removing a user if he/she left the database
    socket.on("disconnect", function(data){
        if(!socket.nickname) return;
        delete users[socket.nickname];
        updateNicknames();
    });
});

// server.listen(3000, function(){
//     console.log("server is listening");
// });

