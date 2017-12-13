var fs = require('fs');
var KalmanFilter = require('kalmanjs').default;

var sourceFilename = 'data/metingen 13-12/lijst_6_13-12-2017.csv';
var outputFilename = 'data/metingen 13-12/filtered_data_lijst6.csv';
var beaconName = 'BlueUp-01-016166';
var delimiter = ',';

fs.readFile(sourceFilename, 'utf8', (err, filedata) => {
    if (err) {
        if (err.code === 'ENOENT') {
            console.error('myfile does not exist');
            return;
        }
        throw err;
    }
    var data = CSVToArray(filedata, delimiter);
    var beaconData = [];

    for(var i in data){
        if(data[i][0].indexOf(beaconName) != -1) {
            beaconData.push(data[i]);
        }
    }

    var signaalSterktes = [];

    for(var i in beaconData){
        if (beaconData[i][3]) signaalSterktes.push(beaconData[i][3]);
    }

    var kalmanFilter = new KalmanFilter({R: 0.01, Q: 3});

    var dataConstantKalman = signaalSterktes.map(function(v) {
        return kalmanFilter.filter(v);
    });

    var filteredData = [];
    for(var i in dataConstantKalman){
        filteredData.push([beaconData[i][0], beaconData[i][2],
            //(Math.round(calculateDistance(dataConstantKalman[i]) * 100) / 100)
            (Math.round(calcDistanceLog(dataConstantKalman[i]) * 100) / 100)
            //(Math.round(dataConstantKalman[i] * 100) / 100)
        ]);
    }
    writeArray(filteredData);
});

function writeArray(array) {
    var fileName = outputFilename;
    fs.appendFile(fileName, array.join('\n'));//  append data to a file, creating the file if it does not yet exist
}

function calcDistanceLog(rssi) {
    txPower = -72.0833;
    return Math.pow(10, ((txPower - rssi)/(10 * 2)));
}

function CSVToArray( strData, strDelimiter ){
    // Check to see if the delimiter is defined. If not,
    // then default to comma.
    strDelimiter = (strDelimiter || ",");

    // Create a regular expression to parse the CSV values.
    var objPattern = new RegExp(
        (
            // Delimiters.
            "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

            // Quoted fields.
            "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

            // Standard fields.
            "([^\"\\" + strDelimiter + "\\r\\n]*))"
        ),
        "gi"
    );


    // Create an array to hold our data. Give the array
    // a default empty first row.
    var arrData = [[]];

    // Create an array to hold our individual pattern
    // matching groups.
    var arrMatches = null;


    // Keep looping over the regular expression matches
    // until we can no longer find a match.
    while (arrMatches = objPattern.exec( strData )){

        // Get the delimiter that was found.
        var strMatchedDelimiter = arrMatches[ 1 ];

        // Check to see if the given delimiter has a length
        // (is not the start of string) and if it matches
        // field delimiter. If id does not, then we know
        // that this delimiter is a row delimiter.
        if (
            strMatchedDelimiter.length &&
            strMatchedDelimiter !== strDelimiter
        ){

            // Since we have reached a new row of data,
            // add an empty row to our data array.
            arrData.push( [] );

        }

        var strMatchedValue;

        // Now that we have our delimiter out of the way,
        // let's check to see which kind of value we
        // captured (quoted or unquoted).
        if (arrMatches[ 2 ]){

            // We found a quoted value. When we capture
            // this value, unescape any double quotes.
            strMatchedValue = arrMatches[ 2 ].replace(
                new RegExp( "\"\"", "g" ),
                "\""
            );

        } else {

            // We found a non-quoted value.
            strMatchedValue = arrMatches[ 3 ];

        }


        // Now that we have our value string, let's add
        // it to the data array.
        arrData[ arrData.length - 1 ].push( strMatchedValue );
    }

    // Return the parsed data.
    return( arrData );
}