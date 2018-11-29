
var WEB_PARTNER = {};

WEB_PARTNER.name = "WEB_PARTNER";              // Model name

WEB_PARTNER.attributes = [            // Model attribute list
    "CompanyName", "Password", "Customer", "DMOnlinePageTitle", "Phone", "Email", "OverrideClientServicePermissions", "EmailHeader", "AdminInclude", "DisableAddingExistingClients", "HideServices", "HidePricing", "EnableIDEntry", "ExistingClientBehavior", "LeadType", "IDPreFix", "BrandingId", "SetupClientAddPlan", "SetupClientParentAccount", "VendorServiceId", "DataSourceId"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in WEB_PARTNER
WEB_PARTNER.create = function(data, success, error) {
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

    DBAdapter.create(WEB_PARTNER.name, data, successCB, errorCB);
};


// "id" : the ObjectId of WEB_PARTNER, must be 24 character hex string 
WEB_PARTNER.get = function(id, success, error) {
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

    DBAdapter.get(WEB_PARTNER.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
WEB_PARTNER.read = function(data, success, error) {
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

    DBAdapter.read(WEB_PARTNER.name, data, successCB, errorCB);
};

// "id" : the ObjectId of WEB_PARTNER, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
WEB_PARTNER.update = function(id, update, success, error) {
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

    DBAdapter.update(WEB_PARTNER.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
WEB_PARTNER.delete = function(data, success, error) {
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

    DBAdapter.delete(WEB_PARTNER.name, data, successCB, errorCB);
};

// "id" : the ObjectId of WEB_PARTNER, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in WEB_PARTNER
WEB_PARTNER.set = function(id, newData, success, error) {
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

    DBAdapter.update(WEB_PARTNER.name, data, successCB, errorCB);
};

// Add the other functions here


