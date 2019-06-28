
var WORDLIST = {};

WORDLIST.name = "WORDLIST";              // Model name

WORDLIST.attributes = [            // Model attribute list
    "LengthNotUseds"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in WORDLIST
WORDLIST.create = function(data, success, error) {
    // Wrap data

    // Define callback function
    function successCB(msg) {
        // Success handling
        success(msg);
    }

    function errorCB(msg) {
        // Error handling
        error(msg);
    }

    DBAdapter.create(WORDLIST.name, data, successCB, errorCB);
};


// "id" : the ObjectId of WORDLIST, must be 24 character hex string 
WORDLIST.get = function(id, success, error) {
    // Wrap data
    var data = id;

    // Define callback function
    function successCB(msg) {
        // Success handling
        success(msg);
    }

    function errorCB(msg) {
        // Error handling
        error(msg);
    }

    DBAdapter.get(WORDLIST.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
WORDLIST.read = function(data, success, error) {
    // Wrap data

    // Define callback function
    function successCB(msg) {
        // Success handling
        success(msg);
    }

    function errorCB(msg) {
        // Error handling
        error(msg);
    }

    DBAdapter.read(WORDLIST.name, data, successCB, errorCB);
};

// "id" : the ObjectId of WORDLIST, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
WORDLIST.update = function(id, update, success, error) {
    // Wrap data
    var data = {
        "_id" : id,
        "newData" : update
    };

    // Define callback function
    function successCB(msg) {
        // Success handling
        success(msg);
    }

    function errorCB(msg) {
        // Error handling
        error(msg);
    }

    DBAdapter.update(WORDLIST.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
WORDLIST.delete = function(data, success, error) {
    // Wrap data 

    // Define callback function
    function successCB(msg) {
        // Success handling
        success(msg);
    }

    function errorCB(msg) {
        // Error handling
        error(msg);
    }

    DBAdapter.delete(WORDLIST.name, data, successCB, errorCB);
};

// "id" : the ObjectId of WORDLIST, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in WORDLIST
WORDLIST.set = function(id, newData, success, error) {
    // Wrap data
    var data = {"_id" : id, "newData" : newData};

    // Define callback function
    function successCB(msg) {
        // Success handling
        success(msg);
    }

    function errorCB(msg) {
        // Error handling
        error(msg);
    }

    DBAdapter.update(WORDLIST.name, data, successCB, errorCB);
};

// Add the other functions here


