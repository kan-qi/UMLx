(function() {
	const mysql = require('@mysql/xdevapi');
	 
	module.exports = {
			setupModelStorage:function(callbackfunc){
				mysql.getSession({
			        host: 'localhost',
			        port: 33060,
			        dbUser: 'flyqk',
			        dbPassword: 'qk19910428'
			    })
			    .then(session => {
			        console.log('Session created');
			        return session.createSchema('model_info_schema');
			    })
			    .then(schema => {
			        console.log('Schema created');
			        schema.createCollection('model_info');
			        callbackfunc();
			    })
			},
			queryExistingModels:function(projectId, callbackfunc){
				return mysql.getSession({
				    host: 'localhost',
			        port: 33060,
			        dbUser: 'flyqk',
			        dbPassword: 'qk19910428'
					}).then(session => {
					  var schema = session.getSchema('model_info_schema');
					  return schema;
					}).then(schema => {
					  var coll = schema.getCollection('model_info');
					  return coll;
					}).then(coll => {
					 console.log(projectId);
					 coll.find("$._id=='f4e49520-5c80-47cb-9c3e-c6095bee'").limit(1).execute(function (row) {
//						  console.log(JSON.stringify(row.fileUrl));
//						  callbackfunc(row);
					 });

					}).catch(function (err) {
					  console.log(err.message);
					  console.log(err.stack);
					});
			},
			queryExistingModelsTest:function(projectId, callbackfunc){
				return mysql.getSession({
				    host: 'localhost',
			        port: 33060,
			        dbUser: 'flyqk',
			        dbPassword: 'qk19910428'
					}).then(session => {
					  var schema = session.getSchema('model_info_test_schema');
					  return schema;
					}).then(schema => {
					 var coll = schema.getCollection('model_info');
					 return coll;
					}).then(coll => {
					 console.log(projectId);
					 coll.find('$._id=="'+projectId+'"').limit(1).execute(row => {
		                    console.log(row);
		                    callbackfunc(row);
		                });
					}).catch(function (err) {
					  console.log(err.message);
					  console.log(err.stack);
					});
			},
		queryModelInfo: function(modelInfo){
			return mysql.getSession({
			    host: 'localhost',
		        port: 33060,
		        dbUser: 'flyqk',
		        dbPassword: 'qk19910428'
				}).then(function (session) {
				  var schema = session.getSchema('model_info_schema');
				  schema.existsInDatabase().then(function (exists) {
				    if (!exists) {
				      session.createSchema('model_info_schema').then(function(schema){
				        console.log('Schema created');
				     });
				    }
				    else {
				      console.log('Schema already exists');
				    }
				    
				  });
				  
				  var coll = schema.getCollection('model_info');
				  coll.existsInDatabase().then(function (exists) {
				    if(!exists){
				      schema.createCollection('model_info').then(function (coll) {
				        console.log('Collection created');
				      });
				    }
				    else{
				      console.log('Collection already exists');
				    }
				  });
				  
				 coll.find("_id='f4e49520-5c80-47cb-9c3e-c6095bee'").execute(function (doc) {
					  console.log(doc);
					});

				}).catch(function (err) {
				  console.log(err.message);
				  console.log(err.stack);
				});
		},
		deleteModelInfo: function(modelInfo) {
			mysql
		    .getSession({
		        host: 'localhost',
		        port: 33060,
		        dbUser: 'flyqk',
		        dbPassword: 'qk19910428'
		    })
		    .then(session => {
		        console.log('Session created');
		        
		        return session.createSchema('model_info_schema');
		    })
		    .then(schema => {
		        console.log('Model Info Schema created');
		        return schema.createCollection('model_info');
		    })
		    .then(collection => {
		        console.log('Collection created')
		        
		        return Promise.all([
		            collection
		                .remove(modelInfo)
		                .execute()
		                .then(() => {
		                    console.log('Document deleted');
		                })
		        ]);
		    })
		    .catch(err => {
		        console.log(err.stack);
		    });
		},
		saveModelInfoTest: function(modelInfo, callbackfunc){
			mysql.getSession({
			    host: 'localhost',
		        port: 33060,
		        dbUser: 'flyqk',
		        dbPassword: 'qk19910428'
				}).then(session => {
				  var schema = session.getSchema('model_info_test_schema');
				    return schema;
				  }).then(schema => {
				  var coll = schema.getCollection('model_info');
				 return coll;
				}).then(coll => {
					coll.add(modelInfo).execute();
					console.log(modelInfo);
					callbackfunc(modelInfo);
				}).catch(function (err) {
				  console.log(err.message);
				  console.log(err.stack);
				});
		},
		saveModelInfo: function(modelInfo){
			return mysql.getSession({
			    host: 'localhost',
		        port: 33060,
		        dbUser: 'flyqk',
		        dbPassword: 'qk19910428'
				}).then(session => {
				  var schema = session.getSchema('model_info_schema');
				  var exists = schema.existsInDatabase();
				    if (!exists) {
				      schema = session.createSchema('model_info_schema');
				      console.log('Schema created');
				    }
				    else {
				      console.log('Schema already exists');
				    }
				   return schema;
				}).then(schema => {
				  var coll = schema.getCollection('model_info');
				  var exists = coll.existsInDatabase();
				    if(!exists){
				      coll = schema.createCollection('model_info');
				      console.log('Collection created');
				    }
				    else{
				      console.log('Collection already exists');
				    }
				 return coll;
				}).then(coll => {
					var result = coll.add(modelInfo).execute();
					var documentId = result.getDocumentId();
					modelInfo['_id'] = documentId;
					return modelInfo;

				}).catch(function (err) {
				  console.log(err.message);
				  console.log(err.stack);
				});
		}
	}
}())