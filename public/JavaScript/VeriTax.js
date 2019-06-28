
var VeriTax = {};

VeriTax.name = "VeriTax";              // Model name

VeriTax.attributes = [            // Model attribute list
    "login", "password", "type", "TranscriptType", "loanNumber", "SSN", "firstName", "middleInitial", "lastName", "address", "city", "state", "zipCode", "previousAddress", "PreviousCity", "PreviousState", "PreviousZip", "DOB", "gender", "int", "orderNote", "uploadedForm", "eSignOption", "EmailAddress1", "EmailAddress2", "zipFilePassword"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in VeriTax
VeriTax.create = function(data, success, error) {
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

    DBAdapter.create(VeriTax.name, data, successCB, errorCB);
};


// "id" : the ObjectId of VeriTax, must be 24 character hex string 
VeriTax.get = function(id, success, error) {
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

    DBAdapter.get(VeriTax.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
VeriTax.read = function(data, success, error) {
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

    DBAdapter.read(VeriTax.name, data, successCB, errorCB);
};

// "id" : the ObjectId of VeriTax, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
VeriTax.update = function(id, update, success, error) {
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

    DBAdapter.update(VeriTax.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
VeriTax.delete = function(data, success, error) {
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

    DBAdapter.delete(VeriTax.name, data, successCB, errorCB);
};

// "id" : the ObjectId of VeriTax, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in VeriTax
VeriTax.set = function(id, newData, success, error) {
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

    DBAdapter.update(VeriTax.name, data, successCB, errorCB);
};

// Add the other functions here


