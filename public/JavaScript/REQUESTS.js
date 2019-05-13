
var REQUESTS = {};

REQUESTS.name = "REQUESTS";              // Model name

REQUESTS.attributes = [            // Model attribute list
    "CustomerId", "Software", "UpdatesDisabled", "Version", "VersionDate", "Environment", "UserId", "UserLoginId", "UserFullName", "UserEmail", "UserDepartment", "Host", "Type", "Date", "Time", "WorksheetId", "SendProcessConfirmation", "QualifaxData", "RegisterMERS"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in REQUESTS
REQUESTS.create = function(data, success, error) {
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

    DBAdapter.create(REQUESTS.name, data, successCB, errorCB);
};


// "id" : the ObjectId of REQUESTS, must be 24 character hex string 
REQUESTS.get = function(id, success, error) {
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

    DBAdapter.get(REQUESTS.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
REQUESTS.read = function(data, success, error) {
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

    DBAdapter.read(REQUESTS.name, data, successCB, errorCB);
};

// "id" : the ObjectId of REQUESTS, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
REQUESTS.update = function(id, update, success, error) {
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

    DBAdapter.update(REQUESTS.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
REQUESTS.delete = function(data, success, error) {
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

    DBAdapter.delete(REQUESTS.name, data, successCB, errorCB);
};

// "id" : the ObjectId of REQUESTS, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in REQUESTS
REQUESTS.set = function(id, newData, success, error) {
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

    DBAdapter.update(REQUESTS.name, data, successCB, errorCB);
};

// Add the other functions here


