var mysql = require("mysql");
var connection = createConnection({
  host     : "localhost",
  user     : "root",
  password : "qk19910428",
  database : "update_service_database"
});

//check if the table exists in the database. If doesn"t exist, create a new table for app_info.
var CREATE_VERSION_INFO_TABLE_SQL = "CREATE TABLE IF NOT EXISTS version_info \
(version_info_id INTEGER AUTO_INCREMENT,\
package_name TEXT NOT NULL,\
version_code INTEGER NOT NULL,\
version_name TEXT NOT NULL,\
file_size FLOAT NOT NULL,\
creation_time DATETIME NOT NULL,\
label TEXT NOT NULL,\
icon_url TEXT NOT NULL,\
file_url TEXT NOT NULL,\
manifest_url TEXT, \
PRIMARY KEY(version_info_id))";

var CREATE_APP_INFO_TABLE_SQL = "CREATE TABLE IF NOT EXISTS app_info \
	(app_info_id INTEGER PRIMARY KEY AUTO_INCREMENT,\
	current_version_id INTEGER NOT NULL,\
	package_name TEXT NOT NULL,\
	FOREIGN KEY (current_version_id) \
	REFERENCES version_info(version_info_id),\
    UNIQUE (package_name(512)))";

//check if the table exists in the database. If doesn"t exist, create a new table for update_package_info.
var CREATE_UPDATE_PACKAGE_INFO_TABLE_SQL = "CREATE TABLE IF NOT EXISTS update_package_version_info \
(update_package_id INTEGER AUTO_INCREMENT,\
target_code INTEGER NOT NULL,\
version_code TEXT NOT NULL,\
file_size FLOAT NOT NULL,\
creation_time DATETIME NOT NULL,\
label TEXT NOT NULL,\
file_url TEXT NOT NULL,\
PRIMARY KEY(update_package_id))";

connection.query( CREATE_VERSION_INFO_TABLE_SQL, function(err, rows, fields) {
  	if (err) throw err;
	});

connection.query( CREATE_APP_INFO_TABLE_SQL, function(err, rows, fields) {
  	if (err) throw err;
	});

connection.query( CREATE_UPDATE_PACKAGE_INFO_TABLE_SQL, function(err, rows, fields) {
  	if (err) throw err;
	});

function updateVersion(versionInfoId, appInfoId, onVersionUpdated){
		connection.query("UPDATE app_info, version_info SET app_info.current_version_id="+ versionInfoId + " WHERE app_info.package_name=version_info.package_name AND app_info.app_info_id="+appInfoId + " AND version_info.version_info_id="+versionInfoId, function(err, rows, fields){
			if(err) throw err;
			onVersionUpdated(true);
			});
}

function updateVersion(versionInfoId, appInfoId, onVersionUpdated){
		connection.query("UPDATE app_info, version_info SET app_info.current_version_id="+ versionInfoId + " WHERE app_info.package_name=version_info.package_name AND app_info.app_info_id="+appInfoId + " AND version_info.version_info_id="+versionInfoId, function(err, rows, fields){
			if(err) throw err;
			onVersionUpdated(true);
			});
	}
	
function addAppInfo(versionInfoId, onAppAdded){
		connection.query("SELECT version_info.package_name AS version_package_name, app_info.package_name AS app_package_name \
				FROM version_info \
				LEFT JOIN app_info \
				ON (version_info.package_name = app_info.package_name) \
				WHERE version_info.version_info_id="+versionInfoId, function(err, rows, fields) {
				if(rows[0].app_package_name == undefined){
				connection.query("INSERT INTO app_info (current_version_id, package_name) VALUES("+versionInfoId+",\'"+rows[0].version_package_name+"\')", function(err, rows, fields){
				if(err) throw err;
				onAppAdded("app is inserted");
				});
				}
				else{
				onAppAdded("app already exists");
				}
			});
	}
	
function removeVersionInfo(versionInfoId, onVersionInfoRemoved){
		query("delete from version_info where version_info_id="+versionInfoId, function(err, rows, fields) {
		  	if (err) throw err;
			onVersionInfoRemoved(true);
			});
	}
	
function removeAppInfo(appInfoId, onAppInfoRemoved){

	query("DELETE FROM app_info, version_info WHERE app_info.package_name=version_info.package_name AND app_info.app_info_id="+appInfoId, function(err, rows, fields) {

  	if (err) throw err;
	onAppInfoRemoved(true);
	});

	}
	
function getAppInfoList(onAppInfoListSelected){
		query("SELECT t2.app_info_id AS app_info_id, t1.label AS label,t2.package_name AS package_name,t1.file_size AS file_size, t1.version_code AS version_code, t1.version_name as version_name, t1.icon_url As icon_url, t1.file_url AS file_url,t1.manifest_url AS mainifest_url \
				FROM version_info AS t1, app_info AS t2\
				WHERE t1.version_info_id = t2.current_version_id AND t1.package_name = t2.package_name", function(err, rows, fields) {
	  	if (err) throw err;
	  	//console.log("The solution is: ", rows[0].solution);
		onAppInfoListSelected(rows);
		});
	}
	
function getAppBriefInfo(appInfoId, onAppBriefInfoSelected){
	connect();

	query("SELECT label,package,size,version_code,icon_url,file_url from app_info where app_info_id"+appInfoId, function(err, rows, fields) {
  	if (err) throw err;
  	//console.log("The solution is: ", rows[0].solution);
	});
}

function insertVersionInfo(versionInfo, onInsertVersionInfoFinished){

	var INSERT_VERSION_INFO_SQL = "INSERT INTO version_info (package_name, version_code, version_name, file_size, creation_time, label, icon_url, file_url, manifest_url) VALUES (\'"
	+versionInfo.packageName+
	"\', "+versionInfo.versionCode+
	", \'"+versionInfo.versionName+
	"\', "+versionInfo.fileSize+
	", \'"+versionInfo.creationTime+
	"\', \'"+versionInfo.label+
	"\', \'"+versionInfo.iconUrl+
	"\', \'"+versionInfo.fileUrl+
	"\', \'"+versionInfo.manifestUrl+
	"\')" ;

	query(INSERT_VERSION_INFO_SQL, function(err, result) {
  	if (err) {
  		throw err;
  		}
  	versionInfo.versionInfoId = result.insertId;
	onInsertVersionInfoFinished(versionInfo);
	});
	}

	var exports = {
	/*
	 * to select updage packages available for certain system versions. If an empty system version code array is input, then return all the available update packages within the system.
	 */
	getUpdatePackageInfo: function(systemVersionCodeArray, onUpdatePackageInfoSelected){
		connect();
		var selectSql;
		if(systemVersionCodeArray.length == 0){
			selectSQL = "SELECT * from update_package_info";
		}
		else{
			selectSQL = "SELECT * from update_package_info where target_code"+systemVersionCodeArray.join();
		}
		
		query(selectSQL, function(err, rows, fields) {
	  	if (err) throw err;
	  	//console.log("The solution is: ", rows[0].solution);
		onUpdatePackageInfoSelected(rows);
		});
	},
	
	insertUpdatePackageInfo: function(updatePackageInfo, onUpdatePcakgeInfoInserted){
		var INSERT_UPDATE_PACKAGE_INFO_SQL = "INSERT INTO update_package_info (target_code, version_code, file_size, label, file_url) VALUES (\'"
			+updatePackageInfo.targetCode+
			"\', "+updatePackageInfo.versionCode+
			", \'"+updatePackageInfo.fileSize+
			"\', "+updatePackageInfo.label+
			", \'"+updatePackageInfo.fileUrl+
			"\')" ;

			query(INSERT_UPDATE_PACKAGE_INFO_SQL, function(err, result) {
		  	if (err) {
		  		throw err;
		  		}
		  	updatePackageInfo.updatePackageId = result.updatePackageId;
			onUpdatePackageInfoInserted(updatePackageInfo);
			});
	},
	
	removeUpdatePackageInfo: function(updatePackageInfoId, onUpdatePackageInfoRemoved){
		connection.query("DELETE FROM update_package_info WHERE update_package_info.update_package_id ="+updatePackageInfoId, function(err, rows, fields) {
		  	if (err) throw err;
			onUpdatePackageInfoRemoved(true);
		});
	}
 	
}
