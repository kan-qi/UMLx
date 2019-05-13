
var UnpaidInvoices = {};

UnpaidInvoices.name = "UnpaidInvoices";              // Model name

UnpaidInvoices.attributes = [            // Model attribute list
    
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in UnpaidInvoices
UnpaidInvoices.create = function(data, success, error) {
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

    DBAdapter.create(UnpaidInvoices.name, data, successCB, errorCB);
};


// "id" : the ObjectId of UnpaidInvoices, must be 24 character hex string 
UnpaidInvoices.get = function(id, success, error) {
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

    DBAdapter.get(UnpaidInvoices.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
UnpaidInvoices.read = function(data, success, error) {
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

    DBAdapter.read(UnpaidInvoices.name, data, successCB, errorCB);
};

// "id" : the ObjectId of UnpaidInvoices, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
UnpaidInvoices.update = function(id, update, success, error) {
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

    DBAdapter.update(UnpaidInvoices.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
UnpaidInvoices.delete = function(data, success, error) {
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

    DBAdapter.delete(UnpaidInvoices.name, data, successCB, errorCB);
};

// "id" : the ObjectId of UnpaidInvoices, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in UnpaidInvoices
UnpaidInvoices.set = function(id, newData, success, error) {
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

    DBAdapter.update(UnpaidInvoices.name, data, successCB, errorCB);
};

// Add the other functions here


