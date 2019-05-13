
var CD_DSC = {};

CD_DSC.name = "CD_DSC";              // Model name

CD_DSC.attributes = [            // Model attribute list
    "AppraisedValue", "BaseLoanAmount", "InterestRate", "LoanAmount", "MersMinNumber", "LoanManualUnderwritingIndicator", "AutomatedUnderwriting", "Charge", "LoanFee", "Impound", "Liability", "Payoff", "AggregateAdjustment", "ImpoundAccountCushionAmount", "ImpoundAccountInitialBalanceAmount", "ImpoundAccountMonthlyPaymentAmount", "ImpoundAccountLowBalanceAmount", "GFEDisclosedInitialDeposit", "ImpoundsRequired", "PrepaidItem", "ServiceProvider", "Amortization", "BiWeeklyIndicator", "ConstructionTermMonths", "DeficiencyRightsPreservedIndicator", "DocumentDate", "DaysPrepaidInterest", "InitialPayment", "InterestRateDeterminationDate", "InterestStartDate", "LateChargePercentage", "LateChargeDays", "LateChargeAmount", "LateChargeCode", "LienHolderSameAsSubjectLoanIndicator", "LienPriorityType", "LoanPurpose", "MICertificateIdentifier", "PartialPaymentAcceptanceType", "PMIEndDate", "PrepaidInterest", "PerDiemInterestDays", "PropertyEstimatedValueAmount", "RateLockDate", "SubjectLoanResubordinationIndicator", "SubordinateFinancingIsNewIndicator", "Section32", "LoanIdentifier", "LOSProgramFeature", "ParsedName"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in CD_DSC
CD_DSC.create = function(data, success, error) {
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

    DBAdapter.create(CD_DSC.name, data, successCB, errorCB);
};


// "id" : the ObjectId of CD_DSC, must be 24 character hex string 
CD_DSC.get = function(id, success, error) {
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

    DBAdapter.get(CD_DSC.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
CD_DSC.read = function(data, success, error) {
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

    DBAdapter.read(CD_DSC.name, data, successCB, errorCB);
};

// "id" : the ObjectId of CD_DSC, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
CD_DSC.update = function(id, update, success, error) {
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

    DBAdapter.update(CD_DSC.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
CD_DSC.delete = function(data, success, error) {
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

    DBAdapter.delete(CD_DSC.name, data, successCB, errorCB);
};

// "id" : the ObjectId of CD_DSC, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in CD_DSC
CD_DSC.set = function(id, newData, success, error) {
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

    DBAdapter.update(CD_DSC.name, data, successCB, errorCB);
};

// Add the other functions here


