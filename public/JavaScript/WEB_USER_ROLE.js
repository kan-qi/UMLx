
var WEB_USER_ROLE = {};

WEB_USER_ROLE.name = "WEB_USER_ROLE";              // Model name

WEB_USER_ROLE.attributes = [            // Model attribute list
    "Name", "Description"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in WEB_USER_ROLE
WEB_USER_ROLE.create = function(data, success, error) {
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

    DBAdapter.create(WEB_USER_ROLE.name, data, successCB, errorCB);
};


// "id" : the ObjectId of WEB_USER_ROLE, must be 24 character hex string 
WEB_USER_ROLE.get = function(id, success, error) {
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

    DBAdapter.get(WEB_USER_ROLE.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
WEB_USER_ROLE.read = function(data, success, error) {
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

    DBAdapter.read(WEB_USER_ROLE.name, data, successCB, errorCB);
};

// "id" : the ObjectId of WEB_USER_ROLE, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
WEB_USER_ROLE.update = function(id, update, success, error) {
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

    DBAdapter.update(WEB_USER_ROLE.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
WEB_USER_ROLE.delete = function(data, success, error) {
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

    DBAdapter.delete(WEB_USER_ROLE.name, data, successCB, errorCB);
};

// "id" : the ObjectId of WEB_USER_ROLE, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in WEB_USER_ROLE
WEB_USER_ROLE.set = function(id, newData, success, error) {
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

    DBAdapter.update(WEB_USER_ROLE.name, data, successCB, errorCB);
};

// Add the other functions here


