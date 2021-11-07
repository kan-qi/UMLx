
var WEB_USER_TOKEN = {};

WEB_USER_TOKEN.name = "WEB_USER_TOKEN";              // Model name

WEB_USER_TOKEN.attributes = [            // Model attribute list
    "User", "CreateDate", "ExpirationDate"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in WEB_USER_TOKEN
WEB_USER_TOKEN.create = function(data, success, error) {
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

    DBAdapter.create(WEB_USER_TOKEN.name, data, successCB, errorCB);
};


// "id" : the ObjectId of WEB_USER_TOKEN, must be 24 character hex string 
WEB_USER_TOKEN.get = function(id, success, error) {
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

    DBAdapter.get(WEB_USER_TOKEN.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
WEB_USER_TOKEN.read = function(data, success, error) {
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

    DBAdapter.read(WEB_USER_TOKEN.name, data, successCB, errorCB);
};

// "id" : the ObjectId of WEB_USER_TOKEN, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
WEB_USER_TOKEN.update = function(id, update, success, error) {
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

    DBAdapter.update(WEB_USER_TOKEN.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
WEB_USER_TOKEN.delete = function(data, success, error) {
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

    DBAdapter.delete(WEB_USER_TOKEN.name, data, successCB, errorCB);
};

// "id" : the ObjectId of WEB_USER_TOKEN, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in WEB_USER_TOKEN
WEB_USER_TOKEN.set = function(id, newData, success, error) {
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

    DBAdapter.update(WEB_USER_TOKEN.name, data, successCB, errorCB);
};

// Add the other functions here


