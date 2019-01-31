
var EncompassSDKComplete = {};

EncompassSDKComplete.name = "EncompassSDKComplete";              // Model name

EncompassSDKComplete.attributes = [            // Model attribute list
    "PlanCode", "L351", "L352", "1065", "1012", "1298", "CASASRN_X14", "1884", "190", "19", "299", "307", "35", "1051", "CASASRN_X3", "1040", "995", "1109", "2", "305", "4", "608", "1172", "994", "1063", "3", "364", "2", "763", "1262", "677", "5", "1553", "1041", "423", "332", "SYS_X303", "BUYDOWNPAYMENT", "334", "561", "325", "425", "MORNET_X15", "CASASRN_X163", "CASASRN_X167", "1888", "1177", "420", "424", "748", "430", "698", "1713", "675", "1946", "1947", "1401", "1130", "682", "664", "663", "670", "1267", "325", "1961", "1719", "19", "967", "1093", "137", "1045", "969", "138", "136", "1092", "1134", "143", "140", "CASASRN_X78", "L244", "L770", "MS_FUN", "353", "762", "L724", "1962", "1134", "1107", "1039", "961", "1132", "MORNET_X33", "MORNET_X40", "VARRRWS_X6", "157", "1149", "100", "VASUMM_X3", "1147", "1148", "1325", "1398", "VASUMM_X2", "CASASRN_X145", "28", "319", "313", "321", "323", "1823", "479", "745", "247", "CASASRN_X135", "SYS_X1", "GLOBAL_S3", "690", "691", "2626", "1149", "1821", "356", "352", "364", "432", "358", "961", "1859", "1860", "1861", "2554", "1952", "1896", "L362", "L360", "L358", "L361", "L493", "1950", "1556", "1543", "1544", "740", "CASASRN_X98", "1545", "DU_LP_ID", "742", "REGZGFE_X8", "Enc_ItemizeTitleFeesWhenPrinted", "NEWHUD_X1139", "L74", "L75", "L76", "315", "L72", "126", "127", "L202", "L203"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in EncompassSDKComplete
EncompassSDKComplete.create = function(data, success, error) {
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

    DBAdapter.create(EncompassSDKComplete.name, data, successCB, errorCB);
};


// "id" : the ObjectId of EncompassSDKComplete, must be 24 character hex string 
EncompassSDKComplete.get = function(id, success, error) {
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

    DBAdapter.get(EncompassSDKComplete.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
EncompassSDKComplete.read = function(data, success, error) {
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

    DBAdapter.read(EncompassSDKComplete.name, data, successCB, errorCB);
};

// "id" : the ObjectId of EncompassSDKComplete, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
EncompassSDKComplete.update = function(id, update, success, error) {
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

    DBAdapter.update(EncompassSDKComplete.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
EncompassSDKComplete.delete = function(data, success, error) {
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

    DBAdapter.delete(EncompassSDKComplete.name, data, successCB, errorCB);
};

// "id" : the ObjectId of EncompassSDKComplete, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in EncompassSDKComplete
EncompassSDKComplete.set = function(id, newData, success, error) {
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

    DBAdapter.update(EncompassSDKComplete.name, data, successCB, errorCB);
};

// Add the other functions here


