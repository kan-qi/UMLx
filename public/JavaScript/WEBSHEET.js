
var WEBSHEET = {};

WEBSHEET.name = "WEBSHEET";              // Model name

WEBSHEET.attributes = [            // Model attribute list
    "PackageType", "LoanType", "LoanPurpose", "LoanOriginatorType", "RefinanceCashOut", "Language", "LenderNumber", "PlanCode", "AlternateLenderNumber", "TrusteeCode", "TransferTo", "id", "BrokerName", "BrokerStreet", "BrokerCity", "BrokerState", "BrokerZip", "BrokerPhone", "BrokerContact", "Contact", "Phone", "Fax", "Email", "BrokerLicenseNumber", "Branch", "LoanRep", "LoanNumber", "MersNumber", "MersOrgID", "FHAVACaseNumber", "FHASectionNumber", "ApplicationDate", "DocumentDate", "ClosingDate", "CancelDate", "DisbursementDate", "SigningDate", "RateLockDate", "OriginationChannelType", "RateLockExpirationDate", "CommitmentExpirationDate"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in WEBSHEET
WEBSHEET.create = function(data, success, error) {
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

    DBAdapter.create(WEBSHEET.name, data, successCB, errorCB);
};


// "id" : the ObjectId of WEBSHEET, must be 24 character hex string 
WEBSHEET.get = function(id, success, error) {
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

    DBAdapter.get(WEBSHEET.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
WEBSHEET.read = function(data, success, error) {
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

    DBAdapter.read(WEBSHEET.name, data, successCB, errorCB);
};

// "id" : the ObjectId of WEBSHEET, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
WEBSHEET.update = function(id, update, success, error) {
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

    DBAdapter.update(WEBSHEET.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
WEBSHEET.delete = function(data, success, error) {
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

    DBAdapter.delete(WEBSHEET.name, data, successCB, errorCB);
};

// "id" : the ObjectId of WEBSHEET, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in WEBSHEET
WEBSHEET.set = function(id, newData, success, error) {
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

    DBAdapter.update(WEBSHEET.name, data, successCB, errorCB);
};

// Add the other functions here


