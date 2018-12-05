
var FLOOD_CERT_MISMO = {};

FLOOD_CERT_MISMO.name = "FLOOD_CERT_MISMO";              // Model name

FLOOD_CERT_MISMO.attributes = [            // Model attribute list
    "FloodCertID", "ProductCertifyDate", "LifeOfLoan", "FloodHazardIndicator", "NFIPCommunityName", "NFIPCounty", "NFIPState", "NFIPCommunityID", "NFIPCommunityStartDate", "NFIPMapID", "NFIPMapPanelID", "NFIPMapPanelSuffixID", "NFIPMapPanelDate", "NFIPLetterOfMapDate", "NFIPFloodZoneID", "NFIPMapIndicator", "NFIPCommunityPartStatusType", "ProtectedAreaIndicator", "ProtectedAreaDesignationDate", "FullfillmentPartyName", "FullfillmentPartyStreet", "FullfillmentPartyStreet2", "FullfillmentPartyCity", "FullfillmentPartyState", "FullfillmentPartyZip", "FullfillmentPartyCounty", "FullfillmentPartyPhone", "FullfillmentPartyFax", "FullfillmentPartyEmail", "BorrowerFirstName", "BorrowerLastName", "LenderCaseID", "PropertyStreet", "PropertyCity", "PropertyState", "PropertyZip", "PropertyCounty", "PropertyCountyFIPSCode", "PropertyCensusTractID", "PropertyLatitude", "PropertyLongitude", "PropertyStateFIPSCode", "PropertyMSAID", "Provider", "ProviderStatus", "Status", "Request", "RequestEmail", "StatusDescription", "FloodDisclaimer"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in FLOOD_CERT_MISMO
FLOOD_CERT_MISMO.create = function(data, success, error) {
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

    DBAdapter.create(FLOOD_CERT_MISMO.name, data, successCB, errorCB);
};


// "id" : the ObjectId of FLOOD_CERT_MISMO, must be 24 character hex string 
FLOOD_CERT_MISMO.get = function(id, success, error) {
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

    DBAdapter.get(FLOOD_CERT_MISMO.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
FLOOD_CERT_MISMO.read = function(data, success, error) {
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

    DBAdapter.read(FLOOD_CERT_MISMO.name, data, successCB, errorCB);
};

// "id" : the ObjectId of FLOOD_CERT_MISMO, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
FLOOD_CERT_MISMO.update = function(id, update, success, error) {
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

    DBAdapter.update(FLOOD_CERT_MISMO.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
FLOOD_CERT_MISMO.delete = function(data, success, error) {
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

    DBAdapter.delete(FLOOD_CERT_MISMO.name, data, successCB, errorCB);
};

// "id" : the ObjectId of FLOOD_CERT_MISMO, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in FLOOD_CERT_MISMO
FLOOD_CERT_MISMO.set = function(id, newData, success, error) {
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

    DBAdapter.update(FLOOD_CERT_MISMO.name, data, successCB, errorCB);
};

// Add the other functions here


