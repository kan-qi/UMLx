
var INVENTORY = {};

INVENTORY.name = "INVENTORY";              // Model name

INVENTORY.attributes = [            // Model attribute list
    "Description", "Type", "State", "FNMANumber", "AltNumber", "RevisionDate", "LastUsedDate", "PageSize", "InvestorCode", "ShortDescription", "Logic", "Protect", "PageCount", "FormType", "MISMOClass", "MISMOSubClass", "RecordingType", "NotaryRequired", "NotarizationType", "ExcludeFromSearch", "ObsoleteDate", "DoNotPurge", "CitationRef", "ARMPeriodicCap", "PrepayProvision", "PackageType", "OriginationType", "LicenseType", "EffectiveDate", "ExpirationDate", "RepsAndWarrants", "ModelForm", "FooterName", "FooterFormId"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in INVENTORY
INVENTORY.create = function(data, success, error) {
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

    DBAdapter.create(INVENTORY.name, data, successCB, errorCB);
};


// "id" : the ObjectId of INVENTORY, must be 24 character hex string 
INVENTORY.get = function(id, success, error) {
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

    DBAdapter.get(INVENTORY.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
INVENTORY.read = function(data, success, error) {
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

    DBAdapter.read(INVENTORY.name, data, successCB, errorCB);
};

// "id" : the ObjectId of INVENTORY, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
INVENTORY.update = function(id, update, success, error) {
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

    DBAdapter.update(INVENTORY.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
INVENTORY.delete = function(data, success, error) {
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

    DBAdapter.delete(INVENTORY.name, data, successCB, errorCB);
};

// "id" : the ObjectId of INVENTORY, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in INVENTORY
INVENTORY.set = function(id, newData, success, error) {
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

    DBAdapter.update(INVENTORY.name, data, successCB, errorCB);
};

// Add the other functions here


