var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var scanner = io.of('/scanner'); 

scanner.on('connection', function(socket) {

    console.log('Scanner Connected');
    
    socket.on('message', function(msg) {
        //recived message from scanner
        //do some processing here
    });

    socket.on('disconnect', function() {
        console.log('Scanner Disconnected');
    });
});

http.listen(3000, function() {
    console.log('listening on *:3000');
});