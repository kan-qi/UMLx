
var PROVIDER_TYPE = {};

PROVIDER_TYPE.name = "PROVIDER_TYPE";              // Model name

PROVIDER_TYPE.attributes = [            // Model attribute list
    "Description", "ApprovedForRelease", "WebCode", "ShowNMLSLicense", "ShowLicense", "ShowAddlLicense"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in PROVIDER_TYPE
PROVIDER_TYPE.create = function(data, success, error) {
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

    DBAdapter.create(PROVIDER_TYPE.name, data, successCB, errorCB);
};


// "id" : the ObjectId of PROVIDER_TYPE, must be 24 character hex string 
PROVIDER_TYPE.get = function(id, success, error) {
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

    DBAdapter.get(PROVIDER_TYPE.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
PROVIDER_TYPE.read = function(data, success, error) {
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

    DBAdapter.read(PROVIDER_TYPE.name, data, successCB, errorCB);
};

// "id" : the ObjectId of PROVIDER_TYPE, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
PROVIDER_TYPE.update = function(id, update, success, error) {
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

    DBAdapter.update(PROVIDER_TYPE.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
PROVIDER_TYPE.delete = function(data, success, error) {
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

    DBAdapter.delete(PROVIDER_TYPE.name, data, successCB, errorCB);
};

// "id" : the ObjectId of PROVIDER_TYPE, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in PROVIDER_TYPE
PROVIDER_TYPE.set = function(id, newData, success, error) {
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

    DBAdapter.update(PROVIDER_TYPE.name, data, successCB, errorCB);
};

// Add the other functions here


