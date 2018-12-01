
var CoesterVMS = {};

CoesterVMS.name = "CoesterVMS";              // Model name

CoesterVMS.attributes = [            // Model attribute list
    "apiid", "username", "password", "action", "type", "loan_number", "fha_case_number", "requires_uad_compliance", "due_date", "fha", "intended_use", "settlement_date", "payment_method", "legal_description", "attachment"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in CoesterVMS
CoesterVMS.create = function(data, success, error) {
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

    DBAdapter.create(CoesterVMS.name, data, successCB, errorCB);
};


// "id" : the ObjectId of CoesterVMS, must be 24 character hex string 
CoesterVMS.get = function(id, success, error) {
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

    DBAdapter.get(CoesterVMS.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
CoesterVMS.read = function(data, success, error) {
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

    DBAdapter.read(CoesterVMS.name, data, successCB, errorCB);
};

// "id" : the ObjectId of CoesterVMS, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
CoesterVMS.update = function(id, update, success, error) {
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

    DBAdapter.update(CoesterVMS.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
CoesterVMS.delete = function(data, success, error) {
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

    DBAdapter.delete(CoesterVMS.name, data, successCB, errorCB);
};

// "id" : the ObjectId of CoesterVMS, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in CoesterVMS
CoesterVMS.set = function(id, newData, success, error) {
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

    DBAdapter.update(CoesterVMS.name, data, successCB, errorCB);
};

// Add the other functions here


