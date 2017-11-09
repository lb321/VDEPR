var noble = require('noble');
var fs = require('fs');
var raspberryPi_Lift = [];

//replace localhost with your server's IP;
var socket = require('socket.io-client')('http://localhost/scanner');

//replace with your hardware address
var addressToTrack = '623bc0d1cffb'; 

socket.on('connect', function(){  
  console.log('connected to server');
});

noble.on('discover', function(peripheral){
  if(peripheral.advertisement.localName && peripheral.advertisement.localName.indexOf('BlueUp') != -1){
  //console.log('peripheral: ' + peripheral);
  //console.log(peripheral.uuid + ', '+ peripheral.rssi);
  //socket.emit('deviceData', {mac: peripheral.uuid, rssi:peripheral.rssi});

console.log('Beacon ' + peripheral.advertisement.localName + ',' + 'found at time: ' + timeconverter(Date.now()));
  raspberryPi_Lift.push('Beacon ' + peripheral.advertisement.localName + ',' + 'found at time: ' + timeconverter(Date.now()) + '\n\r');
  if (raspberryPi_Lift.length >= 5) {
    fs.writeFile('./lijst.csv',raspberryPi_Lift.join(''),{flag:'a'});
    raspberryPi_Lift = [];
  } 
  //console.log(raspberryPi_Lift);
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
	
}

function calculateDistance(rssi) {
  
  var txPower = -59 //hard coded power value. Usually ranges between -59 to -65
  
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

function timeconverter(UNIX_timestamp){
  var a = new Date(UNIX_timestamp );
  var year = a.getFullYear();
  var month = a.getMonth() + 1 ;
  var date = a.getDate();
  var hour = a.getHours();
  var min = a.getMinutes();
  var sec = a.getSeconds();
  var time = date + '-' + month + '-' + year + ',' + hour + ':' + min + ':' + sec ;
  return time;
}