(function() {
	// your module code goes here
	var aapt_path_windows = "\\bins\\android-sdk-windows\\aapt.exe";
	var aapt_path_mac = "/bins/android-sdk-mac/aapt";
	var aapt_path_linux = "/bins/android-sdk-linux/aapt";

	var exec = require('child_process').exec;

	module.exports = {
		parse : function(filePath, onParseFinished) {
			//change app_path_* the one of three variables above according to the operating system you run this service.
			var child = exec(__dirname + aapt_path_mac + " d --values badging "
					+ filePath, function(error, stdout, stderr) {

				if (error !== null) {
					console.log('exec error: ' + error);
					onParseFinished(false);
				} else {
					var array = stdout.replace(/'/g, "").split("\n");
					var apkInfo = {};
					// console.log(array[0]);
					array.forEach(function(entry) {
								// console.log(entry);
								var parts = entry.split(": ");
								var key = parts[0];
								// apkInfo[parts[0]]= parts.length > 0 ?
								// parts[1] : "";
								// console.log(parts[0]);
								if (key == "package") {
									var packageItems = parts[1].split(" ");
									apkInfo.packageName = (packageItems[0]
											.split("="))[1];
									apkInfo.versionCode = (packageItems[1]
											.split("="))[1];
									apkInfo.versionName = (packageItems[2]
											.split("="))[1];
								} else if (key == "application") {
									var segments = parts[1].match(/label=(.*) icon=(.*)/);

									apkInfo.label = segments[1];
									apkInfo.iconEntry = segments[2];
									console.log(apkInfo.iconEntry);
									
								}

							});
					apkInfo.manifest = stdout;
					onParseFinished(apkInfo);
				}
			});
		}
	}
}());