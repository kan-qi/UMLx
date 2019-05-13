
var WS_TRID = {};

WS_TRID.name = "WS_TRID";              // Model name

WS_TRID.attributes = [            // Model attribute list
    "ChangeOfCircumstance", "LastFeeId", "BaselineFee", "EstimatedClosingCostsExpirationDate", "TotalLenderCreditAmount", "FirstLEDisclosedDate", "DisclosureDelivery", "ChargeFeePrepaid", "AmountOverZero", "AmountOver10"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in WS_TRID
WS_TRID.create = function(data, success, error) {
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

    DBAdapter.create(WS_TRID.name, data, successCB, errorCB);
};


// "id" : the ObjectId of WS_TRID, must be 24 character hex string 
WS_TRID.get = function(id, success, error) {
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

    DBAdapter.get(WS_TRID.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
WS_TRID.read = function(data, success, error) {
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

    DBAdapter.read(WS_TRID.name, data, successCB, errorCB);
};

// "id" : the ObjectId of WS_TRID, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
WS_TRID.update = function(id, update, success, error) {
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

    DBAdapter.update(WS_TRID.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
WS_TRID.delete = function(data, success, error) {
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

    DBAdapter.delete(WS_TRID.name, data, successCB, errorCB);
};

// "id" : the ObjectId of WS_TRID, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in WS_TRID
WS_TRID.set = function(id, newData, success, error) {
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

    DBAdapter.update(WS_TRID.name, data, successCB, errorCB);
};

// Add the other functions here


