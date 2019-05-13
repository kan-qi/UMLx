
var InvoicePayments = {};

InvoicePayments.name = "InvoicePayments";              // Model name

InvoicePayments.attributes = [            // Model attribute list
    
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in InvoicePayments
InvoicePayments.create = function(data, success, error) {
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

    DBAdapter.create(InvoicePayments.name, data, successCB, errorCB);
};


// "id" : the ObjectId of InvoicePayments, must be 24 character hex string 
InvoicePayments.get = function(id, success, error) {
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

    DBAdapter.get(InvoicePayments.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
InvoicePayments.read = function(data, success, error) {
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

    DBAdapter.read(InvoicePayments.name, data, successCB, errorCB);
};

// "id" : the ObjectId of InvoicePayments, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
InvoicePayments.update = function(id, update, success, error) {
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

    DBAdapter.update(InvoicePayments.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
InvoicePayments.delete = function(data, success, error) {
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

    DBAdapter.delete(InvoicePayments.name, data, successCB, errorCB);
};

// "id" : the ObjectId of InvoicePayments, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in InvoicePayments
InvoicePayments.set = function(id, newData, success, error) {
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

    DBAdapter.update(InvoicePayments.name, data, successCB, errorCB);
};

// Add the other functions here


