
var SS_REG = {};

SS_REG.name = "SS_REG";              // Model name

SS_REG.attributes = [            // Model attribute list
    "LicenseeName", "Title", "CompanyName", "StreetAddr", "City", "State", "Zip", "CreditCardType", "CreditCardNum", "CreditCardExp", "CreditCardSecurityCode", "CreditCardNameonCard", "CreditCardStreet", "CreditCardCity", "CreditCardState", "CreditCardZip", "TransID", "SeminarCode", "Attendee_", "Account"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in SS_REG
SS_REG.create = function(data, success, error) {
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

    DBAdapter.create(SS_REG.name, data, successCB, errorCB);
};


// "id" : the ObjectId of SS_REG, must be 24 character hex string 
SS_REG.get = function(id, success, error) {
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

    DBAdapter.get(SS_REG.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
SS_REG.read = function(data, success, error) {
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

    DBAdapter.read(SS_REG.name, data, successCB, errorCB);
};

// "id" : the ObjectId of SS_REG, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
SS_REG.update = function(id, update, success, error) {
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

    DBAdapter.update(SS_REG.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
SS_REG.delete = function(data, success, error) {
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

    DBAdapter.delete(SS_REG.name, data, successCB, errorCB);
};

// "id" : the ObjectId of SS_REG, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in SS_REG
SS_REG.set = function(id, newData, success, error) {
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

    DBAdapter.update(SS_REG.name, data, successCB, errorCB);
};

// Add the other functions here


