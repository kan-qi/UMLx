
var PREMIUM_CODE = {};

PREMIUM_CODE.name = "PREMIUM_CODE";              // Model name

PREMIUM_CODE.attributes = [            // Model attribute list
    "Code", "Description", "Approved", "KeyInDesc", "WebCode", "ExcludeFromHighCostIndicator"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in PREMIUM_CODE
PREMIUM_CODE.create = function(data, success, error) {
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

    DBAdapter.create(PREMIUM_CODE.name, data, successCB, errorCB);
};


// "id" : the ObjectId of PREMIUM_CODE, must be 24 character hex string 
PREMIUM_CODE.get = function(id, success, error) {
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

    DBAdapter.get(PREMIUM_CODE.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
PREMIUM_CODE.read = function(data, success, error) {
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

    DBAdapter.read(PREMIUM_CODE.name, data, successCB, errorCB);
};

// "id" : the ObjectId of PREMIUM_CODE, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
PREMIUM_CODE.update = function(id, update, success, error) {
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

    DBAdapter.update(PREMIUM_CODE.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
PREMIUM_CODE.delete = function(data, success, error) {
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

    DBAdapter.delete(PREMIUM_CODE.name, data, successCB, errorCB);
};

// "id" : the ObjectId of PREMIUM_CODE, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in PREMIUM_CODE
PREMIUM_CODE.set = function(id, newData, success, error) {
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

    DBAdapter.update(PREMIUM_CODE.name, data, successCB, errorCB);
};

// Add the other functions here


