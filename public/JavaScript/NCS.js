
var NCS = {};

NCS.name = "NCS";              // Model name

NCS.attributes = [            // Model attribute list
    "PlatformPartnerID", "PlatformPartnerEmailAddress", "PlatformPartnerPassword", "CustomerLastName", "CustomerEmailAddress", "DomainName", "TaxReturnTypeID", "NumberofTaxYears", "OrderedTaxYears", "SSN1", "FirstName1", "MiddleName1", "LastName1", "Suffix1", "SSN2", "FirstName2", "MiddleName2", "LastName2", "Suffix2", "Address1", "Address2", "City", "State", "ZipCode", "LoanNumber", "OrderDateTime", "SingleFileAttached", "OrderElectronicFile", "ProductBaseID", "FullAddress", "FullFiledAddress", "OrderBatchID", "ReportType", "VendorID", "PartnerOrderID"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in NCS
NCS.create = function(data, success, error) {
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

    DBAdapter.create(NCS.name, data, successCB, errorCB);
};


// "id" : the ObjectId of NCS, must be 24 character hex string 
NCS.get = function(id, success, error) {
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

    DBAdapter.get(NCS.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
NCS.read = function(data, success, error) {
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

    DBAdapter.read(NCS.name, data, successCB, errorCB);
};

// "id" : the ObjectId of NCS, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
NCS.update = function(id, update, success, error) {
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

    DBAdapter.update(NCS.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
NCS.delete = function(data, success, error) {
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

    DBAdapter.delete(NCS.name, data, successCB, errorCB);
};

// "id" : the ObjectId of NCS, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in NCS
NCS.set = function(id, newData, success, error) {
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

    DBAdapter.update(NCS.name, data, successCB, errorCB);
};

// Add the other functions here


