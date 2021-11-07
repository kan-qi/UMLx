
var InvoiceProcessing = {};

InvoiceProcessing.name = "InvoiceProcessing";              // Model name

InvoiceProcessing.attributes = [            // Model attribute list
    "ShowTotal", "StartPageNumber"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in InvoiceProcessing
InvoiceProcessing.create = function(data, success, error) {
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

    DBAdapter.create(InvoiceProcessing.name, data, successCB, errorCB);
};


// "id" : the ObjectId of InvoiceProcessing, must be 24 character hex string 
InvoiceProcessing.get = function(id, success, error) {
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

    DBAdapter.get(InvoiceProcessing.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
InvoiceProcessing.read = function(data, success, error) {
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

    DBAdapter.read(InvoiceProcessing.name, data, successCB, errorCB);
};

// "id" : the ObjectId of InvoiceProcessing, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
InvoiceProcessing.update = function(id, update, success, error) {
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

    DBAdapter.update(InvoiceProcessing.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
InvoiceProcessing.delete = function(data, success, error) {
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

    DBAdapter.delete(InvoiceProcessing.name, data, successCB, errorCB);
};

// "id" : the ObjectId of InvoiceProcessing, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in InvoiceProcessing
InvoiceProcessing.set = function(id, newData, success, error) {
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

    DBAdapter.update(InvoiceProcessing.name, data, successCB, errorCB);
};

// Add the other functions here


