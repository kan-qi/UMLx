
var MORTGAGEDATA = {};

MORTGAGEDATA.name = "MORTGAGEDATA";              // Model name

MORTGAGEDATA.attributes = [            // Model attribute list
    "BasisForLoanQualificationType", "DownPaymentType", "LoanPurposeType", "TitleMannerHeldType", "AlterationsImprovementsAndRepairsConventionalAmount", "ApplicationInterviewerSignedDate", "BaseLoanAmount", "BorrowerApplicationSignedDate", "BorrowerPaidConventionalDiscountPointsTotalAmount", "BorrowerRequestedLoanAmount", "DownPaymentAmount", "DownPaymentDescription", "DownPaymentSourceDescription", "EstimatedConventionalClosingCostsAmount", "LenderCaseIdentifier", "AgencyCaseIdentifier", "MortgageInsuranceAndFundingFeeFinancedAmount", "MortgageInsuranceAndFundingFeeTotalAmount", "OtherLoanPurposeDescription", "OtherPartyPaidConventionalClosingCostsAmount", "OtherPartyPaidConventionalDiscountPointsAmount", "PrepaidItemsEstimatedAmount", "PurchasePriceAmount", "PurposeOfRefinanceDescription", "RefinanceIncludingDebtsPaidOffAmount", "SellerPaidConventionalClosingCostsAmount", "PropertyLandAppraisedValueAmount", "PropertyLandOriginalCostAmount", "SubordinateLienAffordableSecondAmount", "SubordinateLienClosedEndSecondAmount", "SubordinateLienHELOCAmount", "SubordinateLienSellerTakeBackAmount", "TitleholderName", "FHAVAOriginatorIdentifier", "BuydownContributorType", "BuydownPermanentIndicator", "BuydownTemporarySubsidyIndicator", "BuydownDurationMonths", "BuydownInitialAdjustmentPercent", "BuydownPeriodToFirstAdjustmentMonths", "BuydownPeriodToSubsequentAdjustmentMonths", "BuydownRatePercent", "BuydownSubsequentAdjustmentPercent", "BuydownTermMonths", "BuydownPermanentIndicator", "CreditRequestType", "SalesConcessionAmount", "SectionOfActType"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in MORTGAGEDATA
MORTGAGEDATA.create = function(data, success, error) {
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

    DBAdapter.create(MORTGAGEDATA.name, data, successCB, errorCB);
};


// "id" : the ObjectId of MORTGAGEDATA, must be 24 character hex string 
MORTGAGEDATA.get = function(id, success, error) {
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

    DBAdapter.get(MORTGAGEDATA.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
MORTGAGEDATA.read = function(data, success, error) {
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

    DBAdapter.read(MORTGAGEDATA.name, data, successCB, errorCB);
};

// "id" : the ObjectId of MORTGAGEDATA, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
MORTGAGEDATA.update = function(id, update, success, error) {
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

    DBAdapter.update(MORTGAGEDATA.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
MORTGAGEDATA.delete = function(data, success, error) {
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

    DBAdapter.delete(MORTGAGEDATA.name, data, successCB, errorCB);
};

// "id" : the ObjectId of MORTGAGEDATA, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in MORTGAGEDATA
MORTGAGEDATA.set = function(id, newData, success, error) {
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

    DBAdapter.update(MORTGAGEDATA.name, data, successCB, errorCB);
};

// Add the other functions here


