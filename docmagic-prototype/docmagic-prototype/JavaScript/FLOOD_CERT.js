
var FLOOD_CERT = {};

FLOOD_CERT.name = "FLOOD_CERT";              // Model name

FLOOD_CERT.attributes = [            // Model attribute list
    "FloodStatusCode", "FloodOrderId", "NFIPCommunityName", "NFIPCommunityNumber", "NFIPMapOrPanel", "FloodZoneCode", "NFIPEntryDate", "NFIPEffectiveDate", "NFIPCounty", "NFIPState", "CensusTract", "MSANumber", "FIPSNumber", "NSAStreet", "NSACity", "NSAState", "NSAZip", "NSAZipAdd4", "FloodClause", "CommunityParticipatesInNFIP", "NFIPProgram", "LOMADate", "FloodMapNumber", "CBRADate", "FloodCertificateIssueDate", "FloodCompanyName", "LifeOfLoanTracking", "FloodComment", "PreparerName", "PreparerStreet", "PreparerCity", "PreparerState", "PreparerZip", "PreparerPhone"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in FLOOD_CERT
FLOOD_CERT.create = function(data, success, error) {
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

    DBAdapter.create(FLOOD_CERT.name, data, successCB, errorCB);
};


// "id" : the ObjectId of FLOOD_CERT, must be 24 character hex string 
FLOOD_CERT.get = function(id, success, error) {
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

    DBAdapter.get(FLOOD_CERT.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
FLOOD_CERT.read = function(data, success, error) {
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

    DBAdapter.read(FLOOD_CERT.name, data, successCB, errorCB);
};

// "id" : the ObjectId of FLOOD_CERT, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
FLOOD_CERT.update = function(id, update, success, error) {
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

    DBAdapter.update(FLOOD_CERT.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
FLOOD_CERT.delete = function(data, success, error) {
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

    DBAdapter.delete(FLOOD_CERT.name, data, successCB, errorCB);
};

// "id" : the ObjectId of FLOOD_CERT, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in FLOOD_CERT
FLOOD_CERT.set = function(id, newData, success, error) {
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

    DBAdapter.update(FLOOD_CERT.name, data, successCB, errorCB);
};

// Add the other functions here


