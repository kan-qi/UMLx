
var TRUSTEE = {};

TRUSTEE.name = "TRUSTEE";              // Model name

TRUSTEE.attributes = [            // Model attribute list
    "TrusteeName", "TrusteeStreet", "TrusteeCity", "TrusteeState", "TrusteeZip", "TrusteeOrganizationType", "TrusteeStateOfOrigin"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in TRUSTEE
TRUSTEE.create = function(data, success, error) {
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

    DBAdapter.create(TRUSTEE.name, data, successCB, errorCB);
};


// "id" : the ObjectId of TRUSTEE, must be 24 character hex string 
TRUSTEE.get = function(id, success, error) {
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

    DBAdapter.get(TRUSTEE.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
TRUSTEE.read = function(data, success, error) {
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

    DBAdapter.read(TRUSTEE.name, data, successCB, errorCB);
};

// "id" : the ObjectId of TRUSTEE, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
TRUSTEE.update = function(id, update, success, error) {
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

    DBAdapter.update(TRUSTEE.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
TRUSTEE.delete = function(data, success, error) {
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

    DBAdapter.delete(TRUSTEE.name, data, successCB, errorCB);
};

// "id" : the ObjectId of TRUSTEE, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in TRUSTEE
TRUSTEE.set = function(id, newData, success, error) {
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

    DBAdapter.update(TRUSTEE.name, data, successCB, errorCB);
};

// Add the other functions here


