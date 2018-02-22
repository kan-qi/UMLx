function saveModelInfo(modelInfo, useCaseInfo, domainModelInfo, modelId, useCaseId, domainModelId, callbackfunc) {
        MongoClient.connect(url, function(err, db) {
            if (err) throw err;
//			console.log(modelInfo);
            var fs = require("fs");
            fs.writeFile('./temp/modelInfo1.json', JSON.stringify(modelInfo, null, 2) , 'utf-8');
            console.log(repoId);
			var o_id = new mongo.ObjectID(repoId);
            
			
			db.collection("repos").update({_id:o_id}, {$push: {Model_id: model_id}}, function(err, res) {
				if (err) throw err;
                console.log("1 record inserted");
                db.close();
                if(callbackfunc !== null){
                    callbackfunc(modelInfo);
                }
            });
                
          
			//retrieve use case id’s of modelInfo
			var useCaseIdArray=new Array();
			db.modelInfo.find().forEach(function(x)
			{
				x.UseCases.forEach(function(y)
				{
					
					y.UseCases.forEach(function(userobj)
					{
						useCaseIdArray.push(userobj.userId);
					})
				})
			})
			
			//retrieve domainModelId’s of modelInfo
			var domainid;
			
			var model_id = new mongo.ObjectID(modelId);
			domainid=db.modelInfo.find( { DomainModel._id: { _id: model_id } } )
			
			
			//removing usecase array
			db.modelInfo.find().forEach(function(x)
			{
				var model_id = new mongo.ObjectID(x._id);
				db.modelInfo.update({_id:model_id}, { $set : {x.UseCases: [] }} , {multi:true} )
			})
			
			//removing domainmodel
			db.modelInfo.find().forEach(function(x)
			{
				var model_id = new mongo.ObjectID(x._id);
				db.modelInfo.update({_id:model_id}, { $pull : {DomainModel:{{_id:model_id}}}} )
			})
			
			
			
			var model_id = new mongo.ObjectID(modelId);
			var UseCaseUUID= new mongo.ObjectID(useCaseId);
			var domainModelUUID = new mongo.ObjectID(domainModelId);
		
			//updating modelInfo with usecase id array and domain id
			db.collection("modelInfo").update({_id:model_id}, {UseCases:useCaseIdArray},{DomainModelId:domainid}}, function(err, res) {
                if (err) throw err;
                console.log("1 record inserted");
                db.close();
                if(callbackfunc !== null){
                    callbackfunc(modelInfo);
                }
            }	);
			
			
			db.collection("useCaseInfo").update({_id:UseCaseUUID}, {$push: {Models: useCaseInfo}}, function(err, res) {
                if (err) throw err;
                console.log("1 record inserted");
                db.close();
                if(callbackfunc !== null){
                    callbackfunc(modelInfo);
                }
            });
			db.collection("domainModelInfo").update({_id:domainModelUUID}, {$push: {Models: domainModelInfo}}, function(err, res) {
                if (err) throw err;
                console.log("1 record inserted");
                db.close();
                if(callbackfunc !== null){
                    callbackfunc(modelInfo);
                }
            });
        });
    }