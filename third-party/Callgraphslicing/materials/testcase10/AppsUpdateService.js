var express = require('express');
var app = express();
var fs = require("fs");
var admZip = require('adm-zip');
var apkDBHelper = require("./ApkDBHelper.js");
var apkParser = require("./ApkParser.js");
var apkFileManager = require("./ApkFileManager.js");
var multer = require('multer');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
	var date = new Date();
    var uploadDate = date.getFullYear() + "-" + date.getMonth()+ "-" + date.getDate();
    var fileDestination = 'public/uploads/'+uploadDate+"@"+Date.now()+"/";
    	 var stat = null;
    try {
	        stat = fs.statSync(fileDestination);
	    } catch (err) {
	        fs.mkdirSync(fileDestination);
	    }
	    if (stat && !stat.isDirectory()) {
	        throw new Error('Directory cannot be created because an inode of a different type exists at "' + dest + '"');
	    }
        cb(null, fileDestination);
    }
})

var upload = multer({ storage: storage })

app.use(express.static('public'));

app.set('views', './views');
app.set('view engine', 'jade');

app.get('/getAppInfoList', function (req, res){
	apkDBHelper.getAppInfoList(function(appInfoList){
		res.end(JSON.stringify(appInfoList));
	});
})

app.post('/updateVersion',upload.fields([{name:'version_info_id', maxCount:1},{name:'app_info_id', maxCount:1}]), function(req, res){
	var appInfoId = req.body.app_info_id;
	var versionInfoId = req.body.version_info_id;
	apkDBHelper.updateVersion(versionInfoId, appInfoId, function(succeed){
		if(succeed){
			apkDBHelper.getAppInfoList(function(appInfoList){
				res.render('index', { appInfoList: appInfoList, message:"successful"});
			});
		}
		else{
			apkDBHelper.getAppInfoList(function(appInfoList){
				res.render('index', { appInfoList: appInfoList, message:"failed"});
			});
		}
	});
})

app.post('/addApp',upload.fields([{name:'version_info_id', maxCount:1}]), function(req, res){
	var versionInfoId = req.body.version_info_id;
	apkDBHelper.addAppInfo(versionInfoId, function(result){
		apkDBHelper.getAppInfoList(function(appInfoList){
//			res.redirect('/?e=' + encodeURIComponent(result));
			res.redirect('/?e=' + encodeURIComponent(result));
		});
	});
})

app.post('/uploadApp', upload.fields([{name:'app_file',maxCount:1}]), function (req, res){
	var appFile = req.files['app_file'][0];
	apkParser.parse(appFile.path, function(apkInfo){
   if(apkInfo == false){
    res.end("false");
   }
   else{
   apkFileManager.setFileInfo(appFile.path, apkInfo);
   apkFileManager.extractMeta(appFile, apkInfo, function(manifestPath, iconPath){
	   apkInfo.iconUrl = iconPath.match(/public\/(.*)/)[1];
	   apkInfo.manifestUrl = manifestPath.match(/public\/(.*)/)[1];
	   apkDBHelper.insertVersionInfo(apkInfo, function(apkInfo){
		   apkInfo.manifest = "";
	       res.render('apkInfo', {apkInfo: apkInfo});
	    });
   });
  }
  });
  
})

app.post('/uploadVersion', upload.fields([{name:'app_file',maxCount:1},{name:'app_info_id', maxCount:1}]), function (req, res){
	var appFile = req.files['app_file'][0];
	var appInfoId = req.body.app_info_id;
	apkParser.parse(appFile.path, function(versionInfo){
   if(versionInfo == false){
    res.end("false");
   }
   else{
   apkFileManager.setFileInfo(appFile.path, versionInfo);
   apkFileManager.extractMeta(appFile, versionInfo, function(manifestPath, iconPath){
	   versionInfo.iconUrl = iconPath.match(/public\/(.*)/)[1];
	   versionInfo.manifestUrl = manifestPath.match(/public\/(.*)/)[1];
	   apkDBHelper.insertVersionInfo(versionInfo, function(versionInfo){
		   versionInfo.manifest = "";
	       res.render('versionInfo', {versionInfo: versionInfo, appInfoId: appInfoId});
	    });
   });
  }
  });
  
})


app.post('/removeVersion', upload.fields([{name:'version_info_id', maxCount:1}]), function(req, res){
	var versionInfoId = req.body.version_info_id;
	 apkDBHelper.removeVersionInfo(versionInfoId, function(result){
		 apkDBHelper.getAppInfoList(function(appInfoList){
				res.redirect('/?e=' + encodeURIComponent(result));
			});
	    });
})

app.post('/removeApp', upload.fields([{name:'app_info_id', maxCount:1}]), function(req, res){
	var appInfoId = req.body.app_info_id;
	 apkDBHelper.removeAppInfo(appInfoId, function(result){
		 apkDBHelper.getAppInfoList(function(appInfoList){
				res.redirect('/?e=' + encodeURIComponent(result));
			});
	    });
})

app.get('/', function(req, res){
	var message = req.query.e;
	apkDBHelper.getAppInfoList(function(appInfoList){
		res.render('index', { appInfoList: appInfoList, message: message});
	});
})

var server = app.listen(8081,'192.168.1.12', function () {

  var host = server.address().address
  var port = server.address().port

  console.log("Example app listening at http://%s:%s", host, port)

})