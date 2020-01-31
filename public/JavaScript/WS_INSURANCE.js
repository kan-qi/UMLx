
var WS_INSURANCE = {};

WS_INSURANCE.name = "WS_INSURANCE";              // Model name

WS_INSURANCE.attributes = [            // Model attribute list
    "InsurancePolicyID", "CustomerName", "LogDate", "TransactionDate", "LoanAmount", "LoanNumber", "ProductCode", "LogNumber", "PropertyStreet", "PropertyCity", "PropertyState", "PropertyZip"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in WS_INSURANCE
WS_INSURANCE.create = function(data, success, error) {
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

    DBAdapter.create(WS_INSURANCE.name, data, successCB, errorCB);
};


// "id" : the ObjectId of WS_INSURANCE, must be 24 character hex string 
WS_INSURANCE.get = function(id, success, error) {
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

    DBAdapter.get(WS_INSURANCE.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
WS_INSURANCE.read = function(data, success, error) {
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

    DBAdapter.read(WS_INSURANCE.name, data, successCB, errorCB);
};

// "id" : the ObjectId of WS_INSURANCE, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
WS_INSURANCE.update = function(id, update, success, error) {
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

    DBAdapter.update(WS_INSURANCE.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
WS_INSURANCE.delete = function(data, success, error) {
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

    DBAdapter.delete(WS_INSURANCE.name, data, successCB, errorCB);
};

// "id" : the ObjectId of WS_INSURANCE, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in WS_INSURANCE
WS_INSURANCE.set = function(id, newData, success, error) {
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

    DBAdapter.update(WS_INSURANCE.name, data, successCB, errorCB);
};

// Add the other functions here


