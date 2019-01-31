
var WEB_USER_ACCOUNT = {};

WEB_USER_ACCOUNT.name = "WEB_USER_ACCOUNT";              // Model name

WEB_USER_ACCOUNT.attributes = [            // Model attribute list
    "Admin", "Role", "ProcessPackageEmpty", "LMLastSyncDate", "ProcessPackage"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in WEB_USER_ACCOUNT
WEB_USER_ACCOUNT.create = function(data, success, error) {
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

    DBAdapter.create(WEB_USER_ACCOUNT.name, data, successCB, errorCB);
};


// "id" : the ObjectId of WEB_USER_ACCOUNT, must be 24 character hex string 
WEB_USER_ACCOUNT.get = function(id, success, error) {
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

    DBAdapter.get(WEB_USER_ACCOUNT.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
WEB_USER_ACCOUNT.read = function(data, success, error) {
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

    DBAdapter.read(WEB_USER_ACCOUNT.name, data, successCB, errorCB);
};

// "id" : the ObjectId of WEB_USER_ACCOUNT, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
WEB_USER_ACCOUNT.update = function(id, update, success, error) {
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

    DBAdapter.update(WEB_USER_ACCOUNT.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
WEB_USER_ACCOUNT.delete = function(data, success, error) {
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

    DBAdapter.delete(WEB_USER_ACCOUNT.name, data, successCB, errorCB);
};

// "id" : the ObjectId of WEB_USER_ACCOUNT, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in WEB_USER_ACCOUNT
WEB_USER_ACCOUNT.set = function(id, newData, success, error) {
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

    DBAdapter.update(WEB_USER_ACCOUNT.name, data, successCB, errorCB);
};

// Add the other functions here


