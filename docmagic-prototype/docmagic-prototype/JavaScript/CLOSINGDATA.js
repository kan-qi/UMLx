
var CLOSINGDATA = {};

CLOSINGDATA.name = "CLOSINGDATA";              // Model name

CLOSINGDATA.attributes = [            // Model attribute list
    "_FirstName", "_MiddleName", "_LastName", "InterestRatePercent", "LoanAmount", "ScheduledFirstPaymentDate", "MaturityDateMonth", "MaturityDateDay", "MaturityDateYear", "LateFeeGracePeriod", "LateFeePercent", "PrincipalAndInterestAmount", "RemittanceDay", "_PayToStreetAddress", "_PayToCity", "_PayToState", "_PayToPostalCode", "LENDER__Name", "PROPERTY__StreetAddress", "PROPERTY__City", "PROPERTY__State", "PROPERTY__PostalCode", "EXECUTION__Month", "EXECUTION__Day", "EXECUTION__Year", "EXECUTION__City", "EXECUTION__State"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in CLOSINGDATA
CLOSINGDATA.create = function(data, success, error) {
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

    DBAdapter.create(CLOSINGDATA.name, data, successCB, errorCB);
};


// "id" : the ObjectId of CLOSINGDATA, must be 24 character hex string 
CLOSINGDATA.get = function(id, success, error) {
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

    DBAdapter.get(CLOSINGDATA.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
CLOSINGDATA.read = function(data, success, error) {
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

    DBAdapter.read(CLOSINGDATA.name, data, successCB, errorCB);
};

// "id" : the ObjectId of CLOSINGDATA, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
CLOSINGDATA.update = function(id, update, success, error) {
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

    DBAdapter.update(CLOSINGDATA.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
CLOSINGDATA.delete = function(data, success, error) {
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

    DBAdapter.delete(CLOSINGDATA.name, data, successCB, errorCB);
};

// "id" : the ObjectId of CLOSINGDATA, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in CLOSINGDATA
CLOSINGDATA.set = function(id, newData, success, error) {
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

    DBAdapter.update(CLOSINGDATA.name, data, successCB, errorCB);
};

// Add the other functions here


