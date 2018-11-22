
var MESSAGE = {};

MESSAGE.name = "MESSAGE";              // Model name

MESSAGE.attributes = [            // Model attribute list
    "MISMOReferenceModelIdentifier", "MISMOLogicalDataDictionaryIdentifier", "ABOUT_VERSION", "DOCUMENT_SET", "RELATIONSHIP", "SYSTEM_SIGNATURE"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in MESSAGE
MESSAGE.create = function(data, success, error) {
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

    DBAdapter.create(MESSAGE.name, data, successCB, errorCB);
};


// "id" : the ObjectId of MESSAGE, must be 24 character hex string 
MESSAGE.get = function(id, success, error) {
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

    DBAdapter.get(MESSAGE.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
MESSAGE.read = function(data, success, error) {
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

    DBAdapter.read(MESSAGE.name, data, successCB, errorCB);
};

// "id" : the ObjectId of MESSAGE, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
MESSAGE.update = function(id, update, success, error) {
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

    DBAdapter.update(MESSAGE.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
MESSAGE.delete = function(data, success, error) {
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

    DBAdapter.delete(MESSAGE.name, data, successCB, errorCB);
};

// "id" : the ObjectId of MESSAGE, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in MESSAGE
MESSAGE.set = function(id, newData, success, error) {
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

    DBAdapter.update(MESSAGE.name, data, successCB, errorCB);
};

// Add the other functions here


