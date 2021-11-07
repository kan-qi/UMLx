
var DataResearch = {};

DataResearch.name = "DataResearch";              // Model name

DataResearch.attributes = [            // Model attribute list
    "DRLoanPurpose", "DRMers", "DRApplicationDate", "DRDocDate", "DRClosingDate", "DRCancelDate", "DRDisbursementDate", "DRSigningDate", "DRApprovalExpirationDate", "DRCommitmentExpirationDate", "DRLockExpirationDate", "DRTotalSalesPrice", "DRApproved2ndLien", "DRSalesPrice", "DRLoanAmount", "DRInterestRate", "DRClosingCounty", "DRLTV", "DRCLTV", "DRLockDays", "DRPurchaseAgreementDate", "DRDownPaymentType", "DRBaseLoanAmount", "DRPurchasePriceAmount", "DRPurposeOfRefinanceDescription", "DRInitialInterestRate", "DRConstructionImprovementCosts", "DRRefiCompletedImprovementsAmount", "DRRefiProposedImprovementsAmount", "DRType", "DRRateType", "DRGpmType", "DRBuydownType", "DRPrepaymentPenaltyIndicator", "DRAssumableIndicator", "DRTerm", "DRInterestFirstChangeDate", "DRInterestRateFloor", "DRPaymentChangeDate", "DRInterestRateCeiling", "DRLifetimeInterestChangeCap", "DRIndexType", "DRARMFirstPaymentChangeMonths", "DRARMPaymentChangeMonths", "DRHELOCMinimumAdvanceAmount", "DRHELOCMinimumAdvanceBalance", "DRHELOCMinimumPayment", "DRBiWeeklyPaymentIndicator", "DRBorrowerMonthlyIncomeAmount", "DRBorrowerFICOScore", "DRBorrowerAssetValueAmount", "DRBorrowerHomeownerPastThreeYearsIndicator", "DRBorrowedDownPaymentIndicator", "DRBorrowerCitizenshipResidencyType", "DRBorrowerIntentToOccupyIndicator", "DRBorrowerVeteranStatusIndicator", "DRBorrowerMaritalStatus", "DRBorrowerDOB", "DRBorrowerGender", "DRBorrowerRaceNationalOriginRefusalIndicator", "DRBorrowerOtherRaceNationalDescription", "DRBorrowerAgeAtApplication", "DRBorrowerRace", "DRBorrowerEthnicity", "DRPropertyType", "DRPropertyResidencyType", "DRPropertyFloodZoneIndicator", "DRPropertyStreetAddress", "DRPropertyCity", "DRPropertyState", "DRPropertyZip", "DRPropertyCounty", "DRPropertyAppraisedValue", "DRPropertyAssessorParcelIdentifier", "DRPropertyProjectName", "DRPropertyManufacuturedHomeYearBuilt", "DRPropertyManufacturerName", "DRPropertyManufacturedHomeModelNumber", "DRPropertyLandAppraisedValue", "DRPropertyLandOriginalCost", "DRPropertyRightsType", "DRPropertyUsageType", "DRPropertyOwnershipType", "DRPropertyMetropolitanStatisticalAreaIdentifier", "DRPropertyAcquiredYear", "DRPropertyNumberOfUnitsFinancedBySubjectProperty", "DRPropertyLeaseholdExpirationDate", "DRPropertyOriginalCost", "DRPropertyStructureBuiltYear", "DRPropertyEstimatedValueAmount", "DRPropertyNFIPFloodZoneIdentifier", "DRPropertyNFIPCommunityName", "DRPropertyNFIPCounty", "DRPropertyNFIPState", "DRPropertyMSANumber", "DRPropertyFIPSCodeIdentifier", "DRPropertyCensusTractIdentifier", "DRBrokerName", "DRBrokerCity", "DRBrokerState", "DRBrokerZip", "DRBranchCity", "DRBranchZip", "DRLendersBranchID", "DROriginationPaidTo", "DROriginationPoints", "DROriginationFixedAmount", "DROriginationTotalAmount", "DRDiscountPaidTo", "DRDiscountPoints", "DRDiscountFixedAmount", "DRDiscountTotalAmount", "DRYieldSpreadPremiumPoints", "DRYieldSpreadPremiumFixedAmount", "DRYieldSpreadPremiumTotalAmount", "DRHazardAnnualAmount", "DRHazardInsuranceCoverageAmount", "DRHazardMonthlyAmount", "DRHazardCollectedMonths", "DRCountyTaxAnnualAmount", "DRCountyTaxInsuranceCoverageAmount", "DRCountyTaxMonthlyAmount", "DRCountyTaxCollectedMonths", "DRS32OtherBrokerCompensationAmount", "DRS32CostsFinancedAmount", "DRS32TotalLoanAmount", "DRS32PointsFeesPercentage", "DRS32APRThreshold", "DRCAOtherBrokerCompensationAmount", "DRCACostsFinancedAmount", "DRCATotalLoanAmount", "DRCAPointsFeesPercentage", "DRCAAPRThreshold", "DRFNMAOtherBrokerCompensationAmount", "DRFNMACostsFinancedAmount", "DRFNMATotalLoanAmount", "DRFNMAPointsFeesPercentage", "DRFNMAAPRThreshold", "DRFREOtherBrokerCompensationAmount", "DRFRECostsFinancedAmount", "DRFRETotalLoanAmount", "DRFREPointsFeesPercentage", "DRFREAPRThreshold", "DRHPMLOtherBrokerCompensationAmount", "DRHPMLCostsFinancedAmount", "DRHPMLTotalLoanAmount", "DRHPMLPointsFeesPercentage", "DRHPMLAPRThreshold", "DRInvestorName", "DRInvestorShortName", "DRInvestorPaymentTo", "DRInvestorRecording", "DRMIInitialPremium", "DRMIRenewalRate1", "DRMIRenewalTerm1", "DRMIRenewalRate2", "DRMIRenewalTerm2", "DRMIMonthlyAmount", "DRSettlementClosingCity", "DRSettlementClosingState", "DRSettlementClosingZip", "DRTitleInsuranceCity", "DRTitleInsuranceState", "DRTitleInsuranceZip", "DRCreditorState", "DRCreditorCounty", "DRCreditorZip", "DRCreditorOrgType", "DRCreditorBeneficiary", "DRCreditorTrustee", "DRCreditorLossPayee", "DRCreditorPaymentsMadeTo", "DRCreditorServicingTransferName", "DRServicerName", "DRServicerCity", "DRServicerState"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in DataResearch
DataResearch.create = function(data, success, error) {
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

    DBAdapter.create(DataResearch.name, data, successCB, errorCB);
};


// "id" : the ObjectId of DataResearch, must be 24 character hex string 
DataResearch.get = function(id, success, error) {
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

    DBAdapter.get(DataResearch.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
DataResearch.read = function(data, success, error) {
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

    DBAdapter.read(DataResearch.name, data, successCB, errorCB);
};

// "id" : the ObjectId of DataResearch, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
DataResearch.update = function(id, update, success, error) {
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

    DBAdapter.update(DataResearch.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
DataResearch.delete = function(data, success, error) {
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

    DBAdapter.delete(DataResearch.name, data, successCB, errorCB);
};

// "id" : the ObjectId of DataResearch, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in DataResearch
DataResearch.set = function(id, newData, success, error) {
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

    DBAdapter.update(DataResearch.name, data, successCB, errorCB);
};

// Add the other functions here


