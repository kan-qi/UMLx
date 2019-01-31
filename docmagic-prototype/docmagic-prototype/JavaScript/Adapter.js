// Change the url as required

var server_ip = "ec2-52-14-181-31.us-east-2.compute.amazonaws.com";
var port = "2001";
var dm_name = "DocMagic20181024";
var url = "http://" + server_ip + ":" + port + "/" + dm_name + "/";

function is_defined(x) {
    return typeof x !== 'undefined';
}

function is_object(x) {
    return Object.prototype.toString.call(x) === "[object Object]";
}

function is_array(x) {
    return Object.prototype.toString.call(x) === "[object Array]";
}

var DBAdapter = {};

// CRUD: create
// "collection" must be specified by the first parameter.
// "data" must be specified as an object passed in by the second parameter.
DBAdapter.create = function(collection, data, successCB, errorCB) {
    if (is_defined(collection) && is_defined(data) && (is_array(data) || is_object(data))) {
        ajaxCall(collection, "POST", "", data, successCB, errorCB);
    } else {
        // Error handling
        errorCB("Error: " + "Invalid Parameters");
    }
};

// CRUD: ReadOne.
// "collection" must be specified in by the first parameter.
// "param" must be specified as an object by the second parameter.
DBAdapter.get = function(collection, param, successCB, errorCB) {
    if (is_defined(collection) && is_defined(param)) {
        var data = "/" + param;
        ajaxCall(collection, "GET", data, null, successCB, errorCB);
    } else {
        // Error handling
        errorCB("Error: " + "Invalid Parameters");
    }
};

// CRUD: readMany.
// "collection" must be specified in by the first parameter.
// "param" must be specified as an object by the second parameter.
DBAdapter.read = function(collection, param, successCB, errorCB) {
    if (is_defined(collection) && is_defined(param)) {

        var data = Object.keys(param).map(function(k) {
            return encodeURIComponent(k) + '=' + encodeURIComponent(param[k])
        }).join('&');
        data = "?" + data;

        ajaxCall(collection, "GET", data, null, successCB, errorCB);
    } else {
        // Error handling
        errorCB("Error: " + "Invalid Parameters");
    }
};

// CRUD: replace.
// "collection" must be specified in by the first parameter.
// "data" must be specified as an object by the second parameter.
DBAdapter.set = function(collection, data, successCB, errorCB) {
    if (is_defined(collection) && is_defined(data) && 
        is_defined(data._id) && is_defined(data.newData)) {
        var param = "/" + data._id;
        var newData = data.newData;
        ajaxCall(collection, "PUT", param, newData, successCB, errorCB);
    } else {
        // Error handling
        errorCB("Error: " + "Invalid Parameters");
    }
};

// CRUD: modify.
// "collection" must be specified in by the first parameter.
// "data" must be specified as an object by the second parameter.
DBAdapter.update = function(collection, data, successCB, errorCB) {
    if (is_defined(collection) && is_defined(data) && 
        is_defined(data._id) && is_defined(data.newData)) {
        var param = "/" + data._id;
        var newData = data.newData;
        ajaxCall(collection, "PATCH", param, newData, successCB, errorCB);
    } else {
        // Error handling
        errorCB("Error: " + "Invalid Parameters");
    }
};

// CRUD: delete.
// "collection" must be specified in by the first parameter.
// "data" must be specified as an object by the second parameter.
DBAdapter.delete = function(collection, data, successCB, errorCB) {
   if (is_defined(collection) && is_defined(data) && is_object(data)) {
        ajaxCall(collection, "DELETE", "", data, successCB, errorCB);
    } else {
        // Error handling
        errorCB("Error: " + "Invalid Parameters");
    }
};

function ajaxCall(collection, method, param, body, successCB, errorCB) {
    $.ajax({
        "url": url + collection + param,
        "method": method,
        "headers": {
            "content-type": "application/json; charset=utf-8"
        },
        "data": body ? JSON.stringify(body) : "",
        "success": function(result){
            successCB(result);
        },
        "error":  function(xhr, ajaxOptions, thrownError) {
            errorCB("Error: " + thrownError);
        }
    });
}





