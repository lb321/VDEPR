var noble = require('noble');
var fs = require('fs');
var raspberryPi_Lift = [];

//replace localhost with your server's IP;
var socket = require('socket.io-client')('http://localhost/scanner');

//replace with your hardware address
var addressToTrack = '69384fed5bc9';

var filename;

socket.on('connect', function(){
    console.log('connected to server');
});

noble.on('discover', function(peripheral){
    //console.log(peripheral.advertisement.localName +  ', ' + peripheral.uuid);
    if(peripheral.advertisement.localName && peripheral.advertisement.localName.indexOf('BlueUp') != -1 || peripheral.uuid == addressToTrack){
        console.log('Beacon ' + peripheral.advertisement.localName + ',' + 'found at time: ' + timeconverter(Date.now()) + ',' + peripheral.rssi );
        //raspberryPi_Lift.push('Beacon ' + peripheral.advertisement.localName + ',' + 'found at time: ' + timeconverter(Date.now()) + '\n\r');
        raspberryPi_Lift.push(peripheral.advertisement.localName + ',' + timeconverter(Date.now()) + ',' + peripheral.rssi + '\n');
        if (raspberryPi_Lift.length >= 5) {
            writeArray(raspberryPi_Lift);
            raspberryPi_Lift = [];
        }
        //console.log('distance: ' + calculateDistance(peripheral.rssi));
    }
});

noble.on('stateChange', function(state) {
    if(state == 'poweredOn'){
        noble.startScanning([], true) //allows dubplicates while scanning
    } else {
        noble.stopScanning();
    }
});

function writeArray(array) {
    var currentDate = new Date(Date.now());
    //fs.writeFile('./lijst.csv',raspberryPi_Lift.join(''),{flag:'a'});
    fs.appendFile(fileName, array.join(''));//  append data to a file, creating the file if it does not yet exist
}

function calculateDistance(rssi) {

    var txPower = -72; //hard coded power value. Usually ranges between -59 to -65

    if (rssi == 0) {
        return -1.0;
    }

    var ratio = rssi*1.0/txPower;
    if (ratio < 1.0) {
        return Math.pow(ratio,10);
    }
    else {
        var distance =  (0.89976)*Math.pow(ratio,7.7095) + 0.111;
        return distance * 0.3048;
    }
}

function generateFilename() {
    filename = fs.readdir('./data/', (err, files) => {
        return './data/lijst_' + files.length + '_' + currentDate.getDate() + '-' + Number(currentDate.getMonth() + 1) + '-' + currentDate.getFullYear() + '.csv';
    });
}

function timeconverter(UNIX_timestamp){
    var a = new Date(UNIX_timestamp );
    var year = a.getFullYear();
    var month = a.getMonth() + 1 ;
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    var sec = a.getSeconds();
    var time = year + '-' + month + '-' + date + 'T' + hour + ':' + min + ':' + sec ;
    return time;
}

function getRightValue(value) {
    if((value + '').length == 1) return '0'+value;
    return value;
}