
var LENDER = {};

LENDER.name = "LENDER";              // Model name

LENDER.attributes = [            // Model attribute list
    
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in LENDER
LENDER.create = function(data, success, error) {
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

    DBAdapter.create(LENDER.name, data, successCB, errorCB);
};


// "id" : the ObjectId of LENDER, must be 24 character hex string 
LENDER.get = function(id, success, error) {
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

    DBAdapter.get(LENDER.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
LENDER.read = function(data, success, error) {
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

    DBAdapter.read(LENDER.name, data, successCB, errorCB);
};

// "id" : the ObjectId of LENDER, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
LENDER.update = function(id, update, success, error) {
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

    DBAdapter.update(LENDER.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
LENDER.delete = function(data, success, error) {
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

    DBAdapter.delete(LENDER.name, data, successCB, errorCB);
};

// "id" : the ObjectId of LENDER, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in LENDER
LENDER.set = function(id, newData, success, error) {
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

    DBAdapter.update(LENDER.name, data, successCB, errorCB);
};

// Add the other functions here


