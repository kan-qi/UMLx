
var ALT_LENDER = {};

ALT_LENDER.name = "ALT_LENDER";              // Model name

ALT_LENDER.attributes = [            // Model attribute list
    "LENDERID", "LenderName", "Street", "City", "State", "Zip", "OrgType", "LendOrgState", "DisbursePeriod", "TaxServiceCustomer_", "CountyRecorderused", "TrusteeName", "OrgType", "TrustOrgState", "Beneficiary", "OrgType", "BeneOrgState", "DeedStreet", "DeedCity", "State", "Zip", "AssigneeInfo", "LossPayeeName", "LossPayeeSt", "LossPayCity", "State", "Zip", "PaymentName", "PaymentStreet", "PaymentCity", "State", "Zip", "RecordingName", "RecordStreet", "RecordCity", "State", "Zip", "CreditIns", "PropertyIns", "FloodIns", "TaxSrvBlTy", "ServType", "MERSClientID", "AttachEscIns", "NoteVerbiage", "Deed_Verbiage", "EscrowInstructions", "MortgageID", "PerDiemInterestdays", "ParentAccount", "FNMATestMinimumLoanAmount", "FNMATest_Paid_TosinServicesRend", "FaxNumber", "BarcodeFormula", "TrusteeType", "IncludePrepaidDaysinAPRTerm_", "ShortName", "DAAutoUpdate", "CFL_DRE_", "AltDelStreet", "AltDelCity", "AltDelState", "AltDelZip", "IsclientaBroker", "AllowAdd_A_Planuse_", "CushionMonths", "AbletoService", "PercentRngeOfChanc", "RegulatedBy", "PMICushionMos", "FDICNumber", "TrusteeStreet", "TrusteeCity", "State", "Zip", "ClosingDocList", "UserName", "UsenewFormListsystem_", "InstrumentPreparedBy", "CheckSum", "DSILocked", "QualiFax_", "DocMailAddr", "SetupVersion", "Howdidyouhear_", "CompanyType", "CompanyDivisions", "No_ofLocations", "No_ofLOs", "LOSType", "Est_Mo_Closings", "LENDEREMAILFROMACCTSETUP", "InterimFunderID", "Howdidyouhear_", "FloodServicetoUse", "FloodCustomer_", "DisableLMVirtualPlans_", "ClientprinteDisclosure", "LEND_ED_TIME_TO_PRINT", "SystemStatusAlerts", "SystemStatusEmail", "LEND_CONSENT_OPTION", "BarcodeType", "BarcodePages", "eDisclosurefulfillmentemail", "eDisclosurenotifycodes"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in ALT_LENDER
ALT_LENDER.create = function(data, success, error) {
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

    DBAdapter.create(ALT_LENDER.name, data, successCB, errorCB);
};


// "id" : the ObjectId of ALT_LENDER, must be 24 character hex string 
ALT_LENDER.get = function(id, success, error) {
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

    DBAdapter.get(ALT_LENDER.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
ALT_LENDER.read = function(data, success, error) {
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

    DBAdapter.read(ALT_LENDER.name, data, successCB, errorCB);
};

// "id" : the ObjectId of ALT_LENDER, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
ALT_LENDER.update = function(id, update, success, error) {
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

    DBAdapter.update(ALT_LENDER.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
ALT_LENDER.delete = function(data, success, error) {
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

    DBAdapter.delete(ALT_LENDER.name, data, successCB, errorCB);
};

// "id" : the ObjectId of ALT_LENDER, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in ALT_LENDER
ALT_LENDER.set = function(id, newData, success, error) {
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

    DBAdapter.update(ALT_LENDER.name, data, successCB, errorCB);
};

// Add the other functions here


