
var DEAL = {};

DEAL.name = "DEAL";              // Model name

DEAL.attributes = [            // Model attribute list
    "MISMOLogicalDataDictionaryIdentifier", "MISMOReferenceModelIdentifier", "SequenceNumber", "ABOUT_VERSION", "ASSET", "COLLATERAL", "EXPENSE", "LIABILITY", "LOAN", "PARTY", "RELATIONSHIP", "SERVICE"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in DEAL
DEAL.create = function(data, success, error) {
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

    DBAdapter.create(DEAL.name, data, successCB, errorCB);
};


// "id" : the ObjectId of DEAL, must be 24 character hex string 
DEAL.get = function(id, success, error) {
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

    DBAdapter.get(DEAL.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
DEAL.read = function(data, success, error) {
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

    DBAdapter.read(DEAL.name, data, successCB, errorCB);
};

// "id" : the ObjectId of DEAL, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
DEAL.update = function(id, update, success, error) {
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

    DBAdapter.update(DEAL.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
DEAL.delete = function(data, success, error) {
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

    DBAdapter.delete(DEAL.name, data, successCB, errorCB);
};

// "id" : the ObjectId of DEAL, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in DEAL
DEAL.set = function(id, newData, success, error) {
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

    DBAdapter.update(DEAL.name, data, successCB, errorCB);
};

// Add the other functions here


