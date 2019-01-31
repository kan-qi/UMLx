
var FILLLIST = {};

FILLLIST.name = "FILLLIST";              // Model name

FILLLIST.attributes = [            // Model attribute list
    
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in FILLLIST
FILLLIST.create = function(data, success, error) {
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

    DBAdapter.create(FILLLIST.name, data, successCB, errorCB);
};


// "id" : the ObjectId of FILLLIST, must be 24 character hex string 
FILLLIST.get = function(id, success, error) {
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

    DBAdapter.get(FILLLIST.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
FILLLIST.read = function(data, success, error) {
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

    DBAdapter.read(FILLLIST.name, data, successCB, errorCB);
};

// "id" : the ObjectId of FILLLIST, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
FILLLIST.update = function(id, update, success, error) {
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

    DBAdapter.update(FILLLIST.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
FILLLIST.delete = function(data, success, error) {
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

    DBAdapter.delete(FILLLIST.name, data, successCB, errorCB);
};

// "id" : the ObjectId of FILLLIST, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in FILLLIST
FILLLIST.set = function(id, newData, success, error) {
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

    DBAdapter.update(FILLLIST.name, data, successCB, errorCB);
};

// Add the other functions here


