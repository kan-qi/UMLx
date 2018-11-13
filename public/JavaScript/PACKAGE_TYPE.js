
var PACKAGE_TYPE = {};

PACKAGE_TYPE.name = "PACKAGE_TYPE";              // Model name

PACKAGE_TYPE.attributes = [            // Model attribute list
    "PackageType", "Description", "WebCode", "SaveGFEData", "FulfillmentBatchIndicator", "FulfillmentLenderAddressUsedInidicator", "FulfillmentIncludeBookletInidicator", "FulfillmentIncludeReturnEnvelopeInidicator", "AllowEPortalService", "Approved", "OrderType", "VersionEnabled", "DaysUntilPrint", "StartDateField", "FulfillmentIndicator", "WorksheetChecksIdentifier", "FulfillmentPriority"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in PACKAGE_TYPE
PACKAGE_TYPE.create = function(data, success, error) {
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

    DBAdapter.create(PACKAGE_TYPE.name, data, successCB, errorCB);
};


// "id" : the ObjectId of PACKAGE_TYPE, must be 24 character hex string 
PACKAGE_TYPE.get = function(id, success, error) {
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

    DBAdapter.get(PACKAGE_TYPE.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
PACKAGE_TYPE.read = function(data, success, error) {
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

    DBAdapter.read(PACKAGE_TYPE.name, data, successCB, errorCB);
};

// "id" : the ObjectId of PACKAGE_TYPE, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
PACKAGE_TYPE.update = function(id, update, success, error) {
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

    DBAdapter.update(PACKAGE_TYPE.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
PACKAGE_TYPE.delete = function(data, success, error) {
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

    DBAdapter.delete(PACKAGE_TYPE.name, data, successCB, errorCB);
};

// "id" : the ObjectId of PACKAGE_TYPE, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in PACKAGE_TYPE
PACKAGE_TYPE.set = function(id, newData, success, error) {
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

    DBAdapter.update(PACKAGE_TYPE.name, data, successCB, errorCB);
};

// Add the other functions here

