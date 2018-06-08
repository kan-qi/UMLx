app.post('/uploadUMLFile', upload.fields([{name:'uml-file',maxCount:1},{name:'uml-model-name', maxCount:1},{name:'uml-model-type', maxCount:1}, {name:'repo-id', maxCount:1}]), function (req, res){
	console.log(req.body);
	var umlFilePath = req.files['uml-file'][0].path;
	var umlModelName = req.body['uml-model-name'];
	var umlModelType = req.body['uml-model-type'];
	var repoId = req.userInfo.repoId;
	var uuidVal = req.body['uuid'];
	var formInfo = req.body;
	umlModelInfoManager.queryRepoInfo(repoId, function(repoInfo){
		var umlFileInfo = umlFileManager.getUMLFileInfo(repoInfo, umlFilePath, umlModelType, formInfo);
		console.log('umlFileInfo => ' + JSON.stringify(umlFileInfo));
		var modelInfo = umlModelInfoManager.initModelInfo(umlFileInfo, umlModelName,repoInfo);
		console.log('updated model info');
		console.log(modelInfo);
		umlModelExtractor.extractModelInfo(modelInfo, function(modelInfo){
			//update model analytics.
			console.log("model is extracted");
			if(!modelInfo){
				res.end("error");
				return;
			}
			umlEvaluator.evaluateModel(modelInfo, function(){
				console.log("model analysis complete");
			});
//			console.log(modelInfo);

			umlModelInfoManager.saveModelInfo(modelInfo, repoId, function(modelInfo){
//				console.log(modelInfo);
				umlModelInfoManager.queryRepoInfo(repoId, function(repoInfo){
					console.log("=============repoInfo==========");
					console.log(repoInfo);
					res.render('mainPanel', {repoInfo:repoInfo});
				}, true);
			});
		});
	});
});