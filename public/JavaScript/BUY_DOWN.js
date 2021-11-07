
var BUY_DOWN = {};

BUY_DOWN.name = "BUY_DOWN";              // Model name

BUY_DOWN.attributes = [            // Model attribute list
    "Code", "Description", "TermMonths", "Percent", "FrequencyMonths", "Match1stAdjust", "ShortDescription", "Approved"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in BUY_DOWN
BUY_DOWN.create = function(data, success, error) {
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

    DBAdapter.create(BUY_DOWN.name, data, successCB, errorCB);
};


// "id" : the ObjectId of BUY_DOWN, must be 24 character hex string 
BUY_DOWN.get = function(id, success, error) {
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

    DBAdapter.get(BUY_DOWN.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
BUY_DOWN.read = function(data, success, error) {
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

    DBAdapter.read(BUY_DOWN.name, data, successCB, errorCB);
};

// "id" : the ObjectId of BUY_DOWN, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
BUY_DOWN.update = function(id, update, success, error) {
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

    DBAdapter.update(BUY_DOWN.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
BUY_DOWN.delete = function(data, success, error) {
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

    DBAdapter.delete(BUY_DOWN.name, data, successCB, errorCB);
};

// "id" : the ObjectId of BUY_DOWN, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in BUY_DOWN
BUY_DOWN.set = function(id, newData, success, error) {
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

    DBAdapter.update(BUY_DOWN.name, data, successCB, errorCB);
};

// Add the other functions here


