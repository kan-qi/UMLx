
var COUNTY = {};

COUNTY.name = "COUNTY";              // Model name

COUNTY.attributes = [            // Model attribute list
    
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in COUNTY
COUNTY.create = function(data, success, error) {
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

    DBAdapter.create(COUNTY.name, data, successCB, errorCB);
};


// "id" : the ObjectId of COUNTY, must be 24 character hex string 
COUNTY.get = function(id, success, error) {
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

    DBAdapter.get(COUNTY.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
COUNTY.read = function(data, success, error) {
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

    DBAdapter.read(COUNTY.name, data, successCB, errorCB);
};

// "id" : the ObjectId of COUNTY, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
COUNTY.update = function(id, update, success, error) {
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

    DBAdapter.update(COUNTY.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
COUNTY.delete = function(data, success, error) {
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

    DBAdapter.delete(COUNTY.name, data, successCB, errorCB);
};

// "id" : the ObjectId of COUNTY, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in COUNTY
COUNTY.set = function(id, newData, success, error) {
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

    DBAdapter.update(COUNTY.name, data, successCB, errorCB);
};

// Add the other functions here


