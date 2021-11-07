
var NOTIFICATION = {};

NOTIFICATION.name = "NOTIFICATION";              // Model name

NOTIFICATION.attributes = [            // Model attribute list
    "Description", "Message", "Destination", "DestinationLabel"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in NOTIFICATION
NOTIFICATION.create = function(data, success, error) {
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

    DBAdapter.create(NOTIFICATION.name, data, successCB, errorCB);
};


// "id" : the ObjectId of NOTIFICATION, must be 24 character hex string 
NOTIFICATION.get = function(id, success, error) {
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

    DBAdapter.get(NOTIFICATION.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
NOTIFICATION.read = function(data, success, error) {
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

    DBAdapter.read(NOTIFICATION.name, data, successCB, errorCB);
};

// "id" : the ObjectId of NOTIFICATION, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
NOTIFICATION.update = function(id, update, success, error) {
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

    DBAdapter.update(NOTIFICATION.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
NOTIFICATION.delete = function(data, success, error) {
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

    DBAdapter.delete(NOTIFICATION.name, data, successCB, errorCB);
};

// "id" : the ObjectId of NOTIFICATION, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in NOTIFICATION
NOTIFICATION.set = function(id, newData, success, error) {
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

    DBAdapter.update(NOTIFICATION.name, data, successCB, errorCB);
};

// Add the other functions here


