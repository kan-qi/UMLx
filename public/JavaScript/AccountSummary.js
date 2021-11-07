
var AccountSummary = {};

AccountSummary.name = "AccountSummary";              // Model name

AccountSummary.attributes = [            // Model attribute list
    "PastDueBalance", "PreviousBalance", "PaymentsReceived", "UnpaidBalance", "CurrentAmountDue"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in AccountSummary
AccountSummary.create = function(data, success, error) {
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

    DBAdapter.create(AccountSummary.name, data, successCB, errorCB);
};


// "id" : the ObjectId of AccountSummary, must be 24 character hex string 
AccountSummary.get = function(id, success, error) {
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

    DBAdapter.get(AccountSummary.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
AccountSummary.read = function(data, success, error) {
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

    DBAdapter.read(AccountSummary.name, data, successCB, errorCB);
};

// "id" : the ObjectId of AccountSummary, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
AccountSummary.update = function(id, update, success, error) {
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

    DBAdapter.update(AccountSummary.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
AccountSummary.delete = function(data, success, error) {
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

    DBAdapter.delete(AccountSummary.name, data, successCB, errorCB);
};

// "id" : the ObjectId of AccountSummary, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in AccountSummary
AccountSummary.set = function(id, newData, success, error) {
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

    DBAdapter.update(AccountSummary.name, data, successCB, errorCB);
};

// Add the other functions here


