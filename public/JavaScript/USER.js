
var USER = {};

USER.name = "USER";              // Model name

USER.attributes = [            // Model attribute list
    "User", "FullName___", "SecurityLevel", "TopLevelMenu", "AutoLogoffMinutes"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in USER
USER.create = function(data, success, error) {
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

    DBAdapter.create(USER.name, data, successCB, errorCB);
};


// "id" : the ObjectId of USER, must be 24 character hex string 
USER.get = function(id, success, error) {
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

    DBAdapter.get(USER.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
USER.read = function(data, success, error) {
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

    DBAdapter.read(USER.name, data, successCB, errorCB);
};

// "id" : the ObjectId of USER, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
USER.update = function(id, update, success, error) {
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

    DBAdapter.update(USER.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
USER.delete = function(data, success, error) {
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

    DBAdapter.delete(USER.name, data, successCB, errorCB);
};

// "id" : the ObjectId of USER, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in USER
USER.set = function(id, newData, success, error) {
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

    DBAdapter.update(USER.name, data, successCB, errorCB);
};

// Add the other functions here


