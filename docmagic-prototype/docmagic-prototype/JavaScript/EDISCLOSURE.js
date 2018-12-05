
var EDISCLOSURE = {};

EDISCLOSURE.name = "EDISCLOSURE";              // Model name

EDISCLOSURE.attributes = [            // Model attribute list
    "DisclosureID", "WorksheetNumber", "LoanNumber", "ClientID", "LenderName", "DateRequested", "TimeRequested", "BorrowerName", "BorrowerSSN", "ConsentDate", "ConsentTime", "SnailMailDate", "SnailMailTime", "LastVersionNumber", "TenderCodes", "DateExpired", "TimeExpired", "IsPrimary", "EmailChange", "SigningProviderID", "SigningProviderPackageID"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in EDISCLOSURE
EDISCLOSURE.create = function(data, success, error) {
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

    DBAdapter.create(EDISCLOSURE.name, data, successCB, errorCB);
};


// "id" : the ObjectId of EDISCLOSURE, must be 24 character hex string 
EDISCLOSURE.get = function(id, success, error) {
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

    DBAdapter.get(EDISCLOSURE.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
EDISCLOSURE.read = function(data, success, error) {
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

    DBAdapter.read(EDISCLOSURE.name, data, successCB, errorCB);
};

// "id" : the ObjectId of EDISCLOSURE, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
EDISCLOSURE.update = function(id, update, success, error) {
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

    DBAdapter.update(EDISCLOSURE.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
EDISCLOSURE.delete = function(data, success, error) {
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

    DBAdapter.delete(EDISCLOSURE.name, data, successCB, errorCB);
};

// "id" : the ObjectId of EDISCLOSURE, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in EDISCLOSURE
EDISCLOSURE.set = function(id, newData, success, error) {
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

    DBAdapter.update(EDISCLOSURE.name, data, successCB, errorCB);
};

// Add the other functions here


