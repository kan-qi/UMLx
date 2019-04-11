
var CHARGE = {};

CHARGE.name = "CHARGE";              // Model name

CHARGE.attributes = [            // Model attribute list
    "Description", "PartOfFinanceCharge", "PartOfSection32", "Hud1Number", "LenderNumber", "SendCharge", "KeyInDesc", "FHAAllowable", "ServiceProviderType", "TIL4C7charge_", "CreditInsuranceRelated", "OtherExcludableCharges", "TIL4DCharge", "TIL4ECharge", "WebCode", "WebCodeDefault", "RESPARuleType", "ExcludeNCUpfrontMortgageInsuranceIndicator", "ExcludeFromHighCostIndicator", "IntegratedDisclosureSectionType", "OptionalCostIndicator", "TitleRelatedFeeIndicator"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in CHARGE
CHARGE.create = function(data, success, error) {
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

    DBAdapter.create(CHARGE.name, data, successCB, errorCB);
};


// "id" : the ObjectId of CHARGE, must be 24 character hex string 
CHARGE.get = function(id, success, error) {
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

    DBAdapter.get(CHARGE.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
CHARGE.read = function(data, success, error) {
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

    DBAdapter.read(CHARGE.name, data, successCB, errorCB);
};

// "id" : the ObjectId of CHARGE, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
CHARGE.update = function(id, update, success, error) {
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

    DBAdapter.update(CHARGE.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
CHARGE.delete = function(data, success, error) {
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

    DBAdapter.delete(CHARGE.name, data, successCB, errorCB);
};

// "id" : the ObjectId of CHARGE, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in CHARGE
CHARGE.set = function(id, newData, success, error) {
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

    DBAdapter.update(CHARGE.name, data, successCB, errorCB);
};

// Add the other functions here


