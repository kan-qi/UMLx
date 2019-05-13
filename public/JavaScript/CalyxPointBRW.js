
var CalyxPointBRW = {};

CalyxPointBRW.name = "CalyxPointBRW";              // Model name

CalyxPointBRW.attributes = [            // Model attribute list
    "11", "12", "13", "3190", "14", "57", "7000", "527", "528", "552", "553", "554", "560", "562", "563", "1198", "555", "556", "2190", "2185", "2159", "2186", "6061", "6062", "6063", "12790", "2710", "2767", "2768", "2769", "6070", "26", "27", "28", "29", "2177", "2178", "2179", "9309", "327", "901", "7403", "14818", "966", "11979", "13511", "13049", "2173", "2174", "2175", "2176", "6075", "6035", "6063", "12869", "12870", "12871", "12861", "31", "32", "33", "34", "35", "12524", "5721", "36", "37", "38", "39", "8313", "8314", "5732", "12829", "12832", "911", "12833", "2700", "2701", "2702", "2838", "2839", "2840", "2841", "2842", "2843", "13853", "9087", "2703", "2704", "13884", "2706", "2707", "13885", "12983", "5860", "14003", "2437", "11415", "2423", "2424", "2425", "2426", "2428", "2429", "2430", "2431", "2432", "2433", "5859", "5862", "5863", "5864", "5865", "12835", "12830", "2051", "2052", "2060", "2057", "12836", "7501", "5756", "12659", "22", "561", "2322", "2324", "2325", "2326", "2327", "2329", "2331", "2330", "2332", "2333", "2338", "2334", "2335", "2336", "2337", "2414", "2415", "11230", "2335", "2327", "7638", "7639", "7640", "7641", "7642", "7643", "7647", "7648", "20", "13892", "13891", "13893", "13996", "13999", "13998", "1039", "2131", "_99", "13671", "13672", "13673", "13674", "2283", "12857", "5710", "12827", "12858", "12859", "2434", "7071", "12853", "12855", "12856", "13045", "210", "211", "212", "213", "215", "245", "246", "247", "255", "256", "257", "421", "550", "800", "801", "802", "803", "804", "805", "806", "807", "808", "809", "810", "818", "819", "820", "821", "822", "830", "831", "832", "834", "835", "836", "837", "838", "839", "860", "861", "862", "863", "870", "871", "872", "873", "874", "875", "876", "879", "880", "881", "882", "883", "884", "896", "897", "906", "907", "908", "911", "912", "915", "916", "917", "921", "923", "924", "929", "930", "931", "932", "933", "934", "935", "936", "937", "938", "939", "940", "2813", "942", "943", "2790", "2792", "2793", "2794", "2795", "2796", "2797", "2798", "2799", "2819", "2836", "8870", "947", "949", "950", "951", "952", "953", "954", "955", "956", "957", "958", "959", "1180", "1181", "1190", "1191", "1192", "1193", "1194", "1195", "1196", "1197", "1206", "1207", "14708", "1208", "1209", "1210", "1211", "1212", "1213", "1214", "1215", "12657", "12658", "7675", "8326", "1217", "1218", "1219", "1220", "1221", "1224", "1227", "1228", "1229", "1505", "1506", "1507", "1508", "1509", "381", "383", "384", "385", "386", "382", "387", "1518", "4116", "1294", "1295", "1296", "1297", "1298", "1299", "19", "13680", "13679", "13681", "6367", "2181", "13600", "13601", "13602", "13604", "13621", "13615", "13968", "2161", "2195", "2197", "1050", "1051", "14270", "14297"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in CalyxPointBRW
CalyxPointBRW.create = function(data, success, error) {
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

    DBAdapter.create(CalyxPointBRW.name, data, successCB, errorCB);
};


// "id" : the ObjectId of CalyxPointBRW, must be 24 character hex string 
CalyxPointBRW.get = function(id, success, error) {
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

    DBAdapter.get(CalyxPointBRW.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
CalyxPointBRW.read = function(data, success, error) {
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

    DBAdapter.read(CalyxPointBRW.name, data, successCB, errorCB);
};

// "id" : the ObjectId of CalyxPointBRW, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
CalyxPointBRW.update = function(id, update, success, error) {
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

    DBAdapter.update(CalyxPointBRW.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
CalyxPointBRW.delete = function(data, success, error) {
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

    DBAdapter.delete(CalyxPointBRW.name, data, successCB, errorCB);
};

// "id" : the ObjectId of CalyxPointBRW, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in CalyxPointBRW
CalyxPointBRW.set = function(id, newData, success, error) {
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

    DBAdapter.update(CalyxPointBRW.name, data, successCB, errorCB);
};

// Add the other functions here


