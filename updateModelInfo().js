 function updateModelInfo(modelInfo, repoId, callbackfunc){
        MongoClient.connect(url, function(err, db) {
            if (err) throw err;
            
             var o_id = new mongo.ObjectID(modelInfo._id);
            
            //adding model_id in domainModelInfo
            modelInfo.DomainModel.model_id = o_id;
            
            var domainObject = modelInfo.domainModel;
            var useCaseArray = modelInfo.UseCases;
            
            //adding model_id in domainModelInfo
            //domainObject.model_id = o_id;
            
            //removing domainModel and UseCase object from the model object 
            delete modelInfo.domainModel;
            delete modelInfo.UseCases;
            
            for(var useCaseObject in useCaseArray){
                useCaseObject.model_id = new mongo.ObjectID(modelInfo._id);   
            }
            
            //adding rep_id as an element in modelInfo
            modelInfo.rep_id = repoId;
            
            //updating domainModelInfo to add model_id element
            db.collection("domainModelInfo").update({_id: mongo.ObjectId(domainObject._id)}, domainObject, function(err, res) {
                if (err) throw err;
                console.log("updating domainModelInfo");
                
                //updating useCaseInfo to add model_id element
                db.collection("useCaseInfo").update({model_id: mongo.ObjectId(modelInfo._id)}, useCaseObject, function(err, res) {
                    if (err) throw err;
                    console.log("updating domainModelInfo");
           
                });
            });
            
            db.close();
                if(callbackfunc !== null){
                    callbackfunc("Success "+modelInfo);
                }
            });         
    }
