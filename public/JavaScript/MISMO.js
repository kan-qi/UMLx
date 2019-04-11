
var MISMO = {};

MISMO.name = "MISMO";              // Model name

MISMO.attributes = [            // Model attribute list
    "xml"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in MISMO
MISMO.create = function(data, success, error) {
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

    DBAdapter.create(MISMO.name, data, successCB, errorCB);
};


// "id" : the ObjectId of MISMO, must be 24 character hex string 
MISMO.get = function(id, success, error) {
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

    DBAdapter.get(MISMO.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
MISMO.read = function(data, success, error) {
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

    DBAdapter.read(MISMO.name, data, successCB, errorCB);
};

// "id" : the ObjectId of MISMO, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
MISMO.update = function(id, update, success, error) {
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

    DBAdapter.update(MISMO.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
MISMO.delete = function(data, success, error) {
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

    DBAdapter.delete(MISMO.name, data, successCB, errorCB);
};

// "id" : the ObjectId of MISMO, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in MISMO
MISMO.set = function(id, newData, success, error) {
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

    DBAdapter.update(MISMO.name, data, successCB, errorCB);
};

// Add the other functions here


