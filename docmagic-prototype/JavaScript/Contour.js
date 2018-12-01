
var Contour = {};

Contour.name = "Contour";              // Model name

Contour.attributes = [            // Model attribute list
    "1", "2", "3", "18", "189", "32", "1050", "4", "681", "762", "697", "422", "3658", "3659", "3660", "419", "420", "1040", "1294", "1011", "1297", "760", "761", "3528", "331", "332", "352", "607", "1171", "363", "1039", "135", "3641", "355", "431", "351", "990", "1132", "1150", "1084", "", "3151", "983", "739", "741", "975", "1085", "2867", "2865", "2866", "557"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in Contour
Contour.create = function(data, success, error) {
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

    DBAdapter.create(Contour.name, data, successCB, errorCB);
};


// "id" : the ObjectId of Contour, must be 24 character hex string 
Contour.get = function(id, success, error) {
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

    DBAdapter.get(Contour.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
Contour.read = function(data, success, error) {
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

    DBAdapter.read(Contour.name, data, successCB, errorCB);
};

// "id" : the ObjectId of Contour, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
Contour.update = function(id, update, success, error) {
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

    DBAdapter.update(Contour.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
Contour.delete = function(data, success, error) {
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

    DBAdapter.delete(Contour.name, data, successCB, errorCB);
};

// "id" : the ObjectId of Contour, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in Contour
Contour.set = function(id, newData, success, error) {
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

    DBAdapter.update(Contour.name, data, successCB, errorCB);
};

// Add the other functions here


