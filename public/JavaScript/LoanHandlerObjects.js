
var LoanHandlerObjects = {};

LoanHandlerObjects.name = "LoanHandlerObjects";              // Model name

LoanHandlerObjects.attributes = [            // Model attribute list
    
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in LoanHandlerObjects
LoanHandlerObjects.create = function(data, success, error) {
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

    DBAdapter.create(LoanHandlerObjects.name, data, successCB, errorCB);
};


// "id" : the ObjectId of LoanHandlerObjects, must be 24 character hex string 
LoanHandlerObjects.get = function(id, success, error) {
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

    DBAdapter.get(LoanHandlerObjects.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
LoanHandlerObjects.read = function(data, success, error) {
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

    DBAdapter.read(LoanHandlerObjects.name, data, successCB, errorCB);
};

// "id" : the ObjectId of LoanHandlerObjects, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
LoanHandlerObjects.update = function(id, update, success, error) {
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

    DBAdapter.update(LoanHandlerObjects.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
LoanHandlerObjects.delete = function(data, success, error) {
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

    DBAdapter.delete(LoanHandlerObjects.name, data, successCB, errorCB);
};

// "id" : the ObjectId of LoanHandlerObjects, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in LoanHandlerObjects
LoanHandlerObjects.set = function(id, newData, success, error) {
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

    DBAdapter.update(LoanHandlerObjects.name, data, successCB, errorCB);
};

// Add the other functions here


