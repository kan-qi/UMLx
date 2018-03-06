  function updateModelInfo(modelInfo, repoId, callbackfunc){
        MongoClient.connect(url, function(err, db) {
            if (err) throw err;
            
            var o_id = new mongo.ObjectID(modelInfo._id);
            
            var domainObject = modelInfo.DomainModel;
            var useCaseArray = modelInfo.UseCases;
           
            //adding model_id in domainModelInfo
            domainObject.model_id = o_id;
            
            //removing domainModel and UseCase object from the model object 
            delete modelInfo.DomainModel;
            delete modelInfo.UseCases;
            
           /* for(var useCaseObject in useCaseArray){
                useCaseObject.model_id = new mongo.ObjectID(modelInfo._id);   
            }*/
            
            //adding rep_id as an element in modelInfo
            modelInfo.rep_id = repoId;
            
             
            //updating domainModelInfo to add model_id element
            db.collection("domainModelInfo").update({_id: mongo.ObjectId(domainObject._id)}, domainObject, function(err, res) {
                if (err) throw err;
                console.log("updating domainModelInfo");
                         
            });
            
            //updating useCaseInfo to add model_id element
                db.collection("useCaseInfo").update({}, {$set : {"model_id": o_id}}, {multi:true}, function(err, res) {
                    if (err) throw err;
                    console.log("updating useCaseInfo");
                    
              });
            
             db.close();
                if(callbackfunc !== null){
                    callbackfunc(modelInfo);
                }
        });         
    }
