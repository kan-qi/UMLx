
var PreviousPayments = {};

PreviousPayments.name = "PreviousPayments";              // Model name

PreviousPayments.attributes = [            // Model attribute list
    
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in PreviousPayments
PreviousPayments.create = function(data, success, error) {
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

    DBAdapter.create(PreviousPayments.name, data, successCB, errorCB);
};


// "id" : the ObjectId of PreviousPayments, must be 24 character hex string 
PreviousPayments.get = function(id, success, error) {
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

    DBAdapter.get(PreviousPayments.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
PreviousPayments.read = function(data, success, error) {
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

    DBAdapter.read(PreviousPayments.name, data, successCB, errorCB);
};

// "id" : the ObjectId of PreviousPayments, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
PreviousPayments.update = function(id, update, success, error) {
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

    DBAdapter.update(PreviousPayments.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
PreviousPayments.delete = function(data, success, error) {
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

    DBAdapter.delete(PreviousPayments.name, data, successCB, errorCB);
};

// "id" : the ObjectId of PreviousPayments, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in PreviousPayments
PreviousPayments.set = function(id, newData, success, error) {
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

    DBAdapter.update(PreviousPayments.name, data, successCB, errorCB);
};

// Add the other functions here


