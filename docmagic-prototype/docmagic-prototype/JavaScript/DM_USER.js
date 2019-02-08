
var DM_USER = {};

DM_USER.name = "DM_USER";              // Model name

DM_USER.attributes = [            // Model attribute list
    "Software", "DAVersionNumber", "DAVersionDate", "UserLoginID", "UserName", "UserDepartment", "UserEmail", "WindowsVersion", "NetworkType", "NetworkVersion", "WorkingDirectory"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in DM_USER
DM_USER.create = function(data, success, error) {
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

    DBAdapter.create(DM_USER.name, data, successCB, errorCB);
};


// "id" : the ObjectId of DM_USER, must be 24 character hex string 
DM_USER.get = function(id, success, error) {
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

    DBAdapter.get(DM_USER.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
DM_USER.read = function(data, success, error) {
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

    DBAdapter.read(DM_USER.name, data, successCB, errorCB);
};

// "id" : the ObjectId of DM_USER, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
DM_USER.update = function(id, update, success, error) {
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

    DBAdapter.update(DM_USER.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
DM_USER.delete = function(data, success, error) {
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

    DBAdapter.delete(DM_USER.name, data, successCB, errorCB);
};

// "id" : the ObjectId of DM_USER, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in DM_USER
DM_USER.set = function(id, newData, success, error) {
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

    DBAdapter.update(DM_USER.name, data, successCB, errorCB);
};

// Add the other functions here

