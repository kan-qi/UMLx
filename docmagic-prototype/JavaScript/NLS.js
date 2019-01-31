
var NLS = {};

NLS.name = "NLS";              // Model name

NLS.attributes = [            // Model attribute list
    "CommitBlock", "EnforceTagExistence"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in NLS
NLS.create = function(data, success, error) {
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

    DBAdapter.create(NLS.name, data, successCB, errorCB);
};


// "id" : the ObjectId of NLS, must be 24 character hex string 
NLS.get = function(id, success, error) {
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

    DBAdapter.get(NLS.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
NLS.read = function(data, success, error) {
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

    DBAdapter.read(NLS.name, data, successCB, errorCB);
};

// "id" : the ObjectId of NLS, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
NLS.update = function(id, update, success, error) {
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

    DBAdapter.update(NLS.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
NLS.delete = function(data, success, error) {
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

    DBAdapter.delete(NLS.name, data, successCB, errorCB);
};

// "id" : the ObjectId of NLS, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in NLS
NLS.set = function(id, newData, success, error) {
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

    DBAdapter.update(NLS.name, data, successCB, errorCB);
};

// Add the other functions here


