
var LOSDATA = {};

LOSDATA.name = "LOSDATA";              // Model name

LOSDATA.attributes = [            // Model attribute list
    "xml"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in LOSDATA
LOSDATA.create = function(data, success, error) {
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

    DBAdapter.create(LOSDATA.name, data, successCB, errorCB);
};


// "id" : the ObjectId of LOSDATA, must be 24 character hex string 
LOSDATA.get = function(id, success, error) {
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

    DBAdapter.get(LOSDATA.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
LOSDATA.read = function(data, success, error) {
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

    DBAdapter.read(LOSDATA.name, data, successCB, errorCB);
};

// "id" : the ObjectId of LOSDATA, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
LOSDATA.update = function(id, update, success, error) {
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

    DBAdapter.update(LOSDATA.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
LOSDATA.delete = function(data, success, error) {
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

    DBAdapter.delete(LOSDATA.name, data, successCB, errorCB);
};

// "id" : the ObjectId of LOSDATA, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in LOSDATA
LOSDATA.set = function(id, newData, success, error) {
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

    DBAdapter.update(LOSDATA.name, data, successCB, errorCB);
};

// Add the other functions here


