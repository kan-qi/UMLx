
var MISMOClosingV2_EncompassAddOn = {};

MISMOClosingV2_EncompassAddOn.name = "MISMOClosingV2_EncompassAddOn";              // Model name

MISMOClosingV2_EncompassAddOn.attributes = [            // Model attribute list
    
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in MISMOClosingV2_EncompassAddOn
MISMOClosingV2_EncompassAddOn.create = function(data, success, error) {
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

    DBAdapter.create(MISMOClosingV2_EncompassAddOn.name, data, successCB, errorCB);
};


// "id" : the ObjectId of MISMOClosingV2_EncompassAddOn, must be 24 character hex string 
MISMOClosingV2_EncompassAddOn.get = function(id, success, error) {
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

    DBAdapter.get(MISMOClosingV2_EncompassAddOn.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
MISMOClosingV2_EncompassAddOn.read = function(data, success, error) {
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

    DBAdapter.read(MISMOClosingV2_EncompassAddOn.name, data, successCB, errorCB);
};

// "id" : the ObjectId of MISMOClosingV2_EncompassAddOn, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
MISMOClosingV2_EncompassAddOn.update = function(id, update, success, error) {
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

    DBAdapter.update(MISMOClosingV2_EncompassAddOn.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
MISMOClosingV2_EncompassAddOn.delete = function(data, success, error) {
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

    DBAdapter.delete(MISMOClosingV2_EncompassAddOn.name, data, successCB, errorCB);
};

// "id" : the ObjectId of MISMOClosingV2_EncompassAddOn, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in MISMOClosingV2_EncompassAddOn
MISMOClosingV2_EncompassAddOn.set = function(id, newData, success, error) {
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

    DBAdapter.update(MISMOClosingV2_EncompassAddOn.name, data, successCB, errorCB);
};

// Add the other functions here


