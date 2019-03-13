(function(){
	var fs = require('fs');
	var exec = require('child_process').exec;
	var config = require("../config.js");
	var umlFileManager = require("./FileManagerUtils.js");
	
	function generateUMLDiagram(UMLDiagramInputPath, callbackfunc, type){
		
		 if(callbackfunc){
			  callbackfunc(UMLDiagramInputPath);
			 }
		 
		 return;
		// shuang's testing temporary code
		// return;

	    //to generate svg file.
	    var command = 'java -jar ./tools/plantuml.jar "'+UMLDiagramInputPath+'"';
	    if(type === "class_diagram"){
	    	command += ' -xmi';
	    }
		console.log(command);
		var child = exec(command, function(error, stdout, stderr) {
			if (error !== null) {
				console.log('exec error: ' + error);
			}
			console.log('The file was saved!');
			
			 if(callbackfunc){
			  callbackfunc(UMLDiagramInputPath);
			 }
		});
		


        var debug = require("./DebuggerOutput.js");
        debug.appendFile1("plant_uml_commands", command+"\n");
	    
}
	
	
	/*
	 * 
	 * The structure of the plantUML tools
	 * 
@startuml
skinparam classAttributeIconSize 0
class Dummy {
 -field1
 #field2
 ~method1()
 +method2()
}

@enduml
	 * 
	 * 
	 */
	
	function drawClassDiagramFunc(DomainModel, outputDir){
		
		var classElements = DomainModel.Elements;
		var classElementDic = {};
		
		var plantUMLString = '@startuml\nskinparam classAttributeIconSize 0\n\n';
		
        for(i = 0;  i < classElements.length; i++){
            var curClass = classElements[i];
            if(!curClass["Name"]){
            	continue;
            }
            
            classElementDic[curClass._id] = curClass;
            

            plantUMLString += "class ";
            
            plantUMLString += curClass["Name"].replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/\s]/gi, '');
            
            if (classElements[i]["Attributes"].length == 0 && classElements[i]["Operations"].length == 0){
            	 plantUMLString += " \n\n";
            	 continue;
            }

            plantUMLString += " {\n";

            var classAttributes = classElements[i]["Attributes"];
                for(j = 0; j < classAttributes.length; j++) {
                    plantUMLString += '- ' ;
                    plantUMLString += classAttributes[j]["Name"];
                    plantUMLString += ':'+classAttributes[j]["Type"];
                    plantUMLString += '\n';
                }

            var classOperations = classElements[i]["Operations"];
                for(j = 0; j < classOperations.length;j++) {
                    
               	 plantUMLString += '~ ' ;
                    plantUMLString += classOperations[j]["Name"] + '(';
                    var para_len = classOperations[j]["Parameters"].length;
                    for (k = 0; k < para_len - 1; k++) {
                   	 plantUMLString += classOperations[j]["Parameters"][k]["Type"]+" "+ classOperations[j]["Parameters"][k]["Name"];
                    }
                    plantUMLString += ')';

                    if(para_len > 0){
                    plantUMLString += ':'+classOperations[j]["Parameters"][para_len - 1]["Type"];
                    }
                    plantUMLString += "\n";
                }

            plantUMLString += '}\n\n';
		 }
        
       //create the links between the classes
//        Realizations:[],
//		Associations: [],
////		Inheritances: [],
//		Generalizations: [],
        
        for(var i in DomainModel.Realizations){
        	var realization = DomainModel.Realizations[i];
        	var supplier = classElementDic[realization.Supplier];
        	var client = classElementDic[realization.Client];
        	if(!supplier || !client){
        		continue;
        	}
        	
        	var supplierName = supplier["Name"].replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/\s]/gi, '');
        	var clientName = client["Name"].replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/\s]/gi, '');
        	
        	plantUMLString += clientName + " <|-- " + supplierName+"\n\n";
        	
        }
        
        for(var i in DomainModel.Associations){
        	var association = DomainModel.Associations[i];
        	
        	var supplier = classElementDic[association.Supplier];
        	var client = classElementDic[association.Client];
        	if(!supplier || !client){
        		continue;
        	}
        	
        	var supplierName = supplier["Name"].replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/\s]/gi, '');
        	var clientName = client["Name"].replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/\s]/gi, '');
        	
        	plantUMLString += supplierName + " .. " + clientName+"\n\n";
        }
        
        for(var i in DomainModel.Generalizations){
        	var generalization = DomainModel.Generalizations[i];
        	
        	var supplier = classElementDic[generalization.Supplier];
        	var client = classElementDic[generalization.Client];
        	if(!supplier || !client){
        		continue;
        	}
        	
        	var supplierName = supplier["Name"].replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/\s]/gi, '');
        	var clientName = client["Name"].replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/\s]/gi, '');
        	
        	plantUMLString += supplierName + " <|-- " + clientName+"\n\n";
        }
        
        for(var i in DomainModel.Usages){
        	var usage = DomainModel.Usages[i];
        	
        	var supplier = classElementDic[usage.Supplier];
        	var client = classElementDic[usage.Client];
        	if(!supplier || !client){
        		continue;
        	}
        	
        	var supplierName = supplier["Name"].replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/\s]/gi, '');
        	var clientName = client["Name"].replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/\s]/gi, '');
        	
        	plantUMLString += supplierName + " --> " + clientName+"\n\n";
        }
       
        
       plantUMLString += '@enduml';
       
       var files = [{fileName : "class_diagram.txt", content : plantUMLString}];
		umlFileManager.writeFiles(outputDir, files, function(err){
		 if(err){
			 console.log(err);
			 return;
		 }
		 
		 plantUMLUtil.generateUMLDiagram(outputDir+"/class_diagram.txt", function(outputDir){
			 console.log(outputDir);
		 }, 'class_diagram');
		});

        
        return plantUMLString;
	}
	
	
	/*
	 * 
	 * The structure of the plantUML tools
	 * 
	 * @startuml
skinparam sequenceArrowThickness 2
skinparam roundcorner 20
skinparam maxmessagesize 60
skinparam sequenceParticipant underline

actor User
participant "First Class" as A
participant "Second Class" as B
participant "Last Class" as C

User -> A: DoWork
activate A

A -> B: Create Request
activate B

B -> C: DoWork
activate C
C --> B: WorkDone
destroy C

B --> A: Request Created
deactivate B

A --> User: Done
deactivate A

@enduml
	 * 
	 * 
	 */
	
	
	function drawSequenceDiagramFunc(UseCase, DomainModel, outputDir){
//		UseCase.DiagramType = "sequence_diagram";
		
		var plantUMLString = "@startuml \nskinparam sequenceArrowThickness 2 \nskinparam roundcorner 20 \nskinparam maxmessagesize 60 \nskinparam sequenceParticipant underline\n\n"
		
		//logic to create actors
		var actorActivityDic = {};
		var componentDic = {};
		for(var i in UseCase.Activities){
			var activity = UseCase.Activities[i];
			if(activity.Stimulus){
				if(!actorActivityDic[activity.Group]){
					actorActivityDic[activity.Group] = [];
				}
				var actorActivities = actorActivityDic[activity.Group];
				actorActivities.push(activity);
			}
			
			if(activity.Component){
				var index = (i + 9).toString(36).toUpperCase();
				if(!componentDic[activity.Component.Name]){
				componentDic[activity.Component.Name] = index;
				}
			}
		}
		

//		var debug = require("../../utils/DebuggerOutput.js");
//		debug.writeJson("actor_activity_dic"+UseCase._id, actorActivityDic);	
		
		for(var i in actorActivityDic){
			console.log("actor: "+i);
			plantUMLString += "actor "+i;
			
		}

		plantUMLString += "\n";
		
//		for(var i in DomainModel.Elements){
//			var element = DomainModel.Elements[i];
//			var index = (i + 9).toString(36).toUpperCase();
//			plantUMLString += "participant \""+element.Name+"\" as "+index+"\n";
//			componentDic[element.Name] = index;
//		}
		
		for(var i in componentDic){
			console.log("actor: "+i);
			plantUMLString += "participant \""+i+"\" as "+componentDic[i]+"\n";
			
		}

		plantUMLString += "\n";
		
		var precedenceRelationDic = {};
		for(var i in UseCase.PrecedenceRelations){
			var precedenceRelation = UseCase.PrecedenceRelations[i];
			
			var start = precedenceRelation.start;
			if(!start){
				continue;
			}
			
			if(!precedenceRelationDic[start._id]){
				precedenceRelationDic[start._id] = [];
			}
			precedenceRelationDic[start._id].push(precedenceRelation);
		}
		
//		var debug = require("../../utils/DebuggerOutput.js");
//		debug.writeJson("precedence_relation_dic"+UseCase._id, precedenceRelationDic);
		
		var visitedPrecedenceRelations = {};
		var activatedComponents = {};
		
		function traverseActivitySequence(start){
//			var precedenceRelation = UseCase.PrecedenceRelations[i];
			
//			var start = precedenceRelation.start;
			
			var precedenceRelations = precedenceRelationDic[start._id];
			
			for(var i in precedenceRelations){
			
			var precedenceRelation = precedenceRelations[i];
			
			var end = precedenceRelation.end;
			
			if(visitedPrecedenceRelations[start._id+"__"+end._id]){
				continue;
			}
			
			visitedPrecedenceRelations[start._id+"__"+end._id] = "1";
			
			console.log(end);
			
			if(start.Stimulus){
				plantUMLString += start.Group;
			}
			else{
				if(start.Component){
				plantUMLString += componentDic[start.Component.Name];
				}
			}
			
			plantUMLString += " -> ";
			
			if(end.Stimulus){
				plantUMLString += end.Group;
			}
			else{
				if(end.Component){
				plantUMLString += componentDic[end.Component.Name];
				}
			}
			
			if(end.Component && end.Name){
				var labelComponents = end.Name.split(":");
				plantUMLString += ": "+labelComponents[labelComponents.length - 1].replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/\s]/gi, '')+"()\n";
				if(activatedComponents[componentDic[end.Component.Name]] == 0 || !activatedComponents[componentDic[end.Component.Name]]){
				plantUMLString += "activate "+componentDic[end.Component.Name]+"\n\n";
				activatedComponents[componentDic[end.Component.Name]] = 1;
				}
			}
			
			traverseActivitySequence(end)
			
			if(end.Component){
				if(activatedComponents[componentDic[end.Component.Name]] == 1){
					plantUMLString += "deactivate "+componentDic[end.Component.Name]+"\n\n";
//					activatedComponents[componentDic[end.Component.Name]]=1;
					activatedComponents[componentDic[end.Component.Name]] = 0;
				}
			}
			
			}
		}
	
		
		for(var i in actorActivityDic){
			var actorActivities = actorActivityDic[i];
			for(var j in actorActivities){
				//plantUMLString += "actor "+actorActivities[j].Name;
				var actorActivity = actorActivities[j];
				traverseActivitySequence(actorActivity);
			}
		}
		
		plantUMLString += "@enduml";
		
		var files = [{fileName : "sequence_diagram.txt", content : plantUMLString}];
		umlFileManager.writeFiles(outputDir, files, function(err){
		 if(err){
			 console.log(err);
			 return;
		 }
		 
		 plantUMLUtil.generateUMLDiagram(outputDir+"/sequence_diagram.txt", function(outputDir){
			 console.log(outputDir);
		 });
		});
		
		return plantUMLString;
	}
	
	/*
	 * 
	 * The structure of the plantUML tools
	 * 
@startuml
skinparam classAttributeIconSize 0
class Dummy {
 -field1
 #field2
 ~method1()
 +method2()
}
@enduml
	 * 
	 * 
	 */
	
	function drawClassDiagram(DomainModel, outputDir){
		
		var classElements = DomainModel.Elements;
		var classElementDic = {};
		
		var plantUMLString = '@startuml\nskinparam classAttributeIconSize 0\n\n';
		
        for(i = 0;  i < classElements.length; i++){
            var curClass = classElements[i];
            if(!curClass["Name"]){
            	continue;
            }
            
            classElementDic[curClass._id] = curClass;
            

            plantUMLString += "class ";
            
            plantUMLString += curClass["Name"].replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/\s]/gi, '');
            
            if (classElements[i]["Attributes"].length == 0 && classElements[i]["Operations"].length == 0){
            	 plantUMLString += " \n\n";
            	 continue;
            }

            plantUMLString += " {\n";

            var classAttributes = classElements[i]["Attributes"];
                for(j = 0; j < classAttributes.length; j++) {
                    plantUMLString += '- ' ;
                    plantUMLString += classAttributes[j]["Name"];
                    plantUMLString += ':'+classAttributes[j]["Type"];
                    plantUMLString += '\n';
                }

            var classOperations = classElements[i]["Operations"];
                for(j = 0; j < classOperations.length;j++) {
                    
               	 plantUMLString += '~ ' ;
                    plantUMLString += classOperations[j]["Name"] + '(';
                    var para_len = classOperations[j]["Parameters"].length;
                    for (k = 0; k < para_len - 1; k++) {
                   	 plantUMLString += classOperations[j]["Parameters"][k]["Type"]+" "+ classOperations[j]["Parameters"][k]["Name"];
                    }
                    plantUMLString += ')';

                    if(para_len > 0){
                    plantUMLString += ':'+classOperations[j]["Parameters"][para_len - 1]["Type"];
                    }
                    plantUMLString += "\n";
                }

            plantUMLString += '}\n\n';
		 }
        
        
        for(var i in DomainModel.Realizations){
        	var realization = DomainModel.Realizations[i];
        	var supplier = classElementDic[realization.Supplier];
        	var client = classElementDic[realization.Client];
        	if(!supplier || !client){
        		continue;
        	}
        	
        	var supplierName = supplier["Name"].replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/\s]/gi, '');
        	var clientName = client["Name"].replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/\s]/gi, '');
        	
        	plantUMLString += clientName + " <|-- " + supplierName+"\n\n";
        	
        }
        
        for(var i in DomainModel.Associations){
        	var association = DomainModel.Associations[i];
        	
        	var supplier = classElementDic[association.Supplier];
        	var client = classElementDic[association.Client];
        	if(!supplier || !client){
        		continue;
        	}
        	
        	var supplierName = supplier["Name"].replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/\s]/gi, '');
        	var clientName = client["Name"].replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/\s]/gi, '');
        	
        	plantUMLString += supplierName + " .. " + clientName+"\n\n";
        }
        
        for(var i in DomainModel.Generalizations){
        	var generalization = DomainModel.Generalizations[i];
        	
        	var supplier = classElementDic[generalization.Supplier];
        	var client = classElementDic[generalization.Client];
        	if(!supplier || !client){
        		continue;
        	}
        	
        	var supplierName = supplier["Name"].replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/\s]/gi, '');
        	var clientName = client["Name"].replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/\s]/gi, '');
        	
        	plantUMLString += supplierName + " <|-- " + clientName+"\n\n";
        }
        
        for(var i in DomainModel.Usages){
        	var usage = DomainModel.Usages[i];
        	
        	var supplier = classElementDic[usage.Supplier];
        	var client = classElementDic[usage.Client];
        	if(!supplier || !client){
        		continue;
        	}
        	
        	var supplierName = supplier["Name"].replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/\s]/gi, '');
        	var clientName = client["Name"].replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/\s]/gi, '');
        	
        	plantUMLString += supplierName + " --> " + clientName+"\n\n";
        }
       
        
       plantUMLString += '@enduml';
       
       var files = [{fileName : "class_diagram.txt", content : plantUMLString}];
		umlFileManager.writeFiles(outputDir, files, function(err){
		 if(err){
			 console.log(err);
			 return;
		 }
		 
		 plantUMLUtil.generateUMLDiagram(outputDir+"/class_diagram.txt", function(outputDir){
			 console.log(outputDir);
		 }, 'class_diagram');
		});

        
        return plantUMLString;
	}
	
	// draw the class diagram of the model
	function createClassDiagramFunc(classElements, graphFilePath, callbackfunc){
              
			var graph = 'digraph class_diagram {';
             graph += 'node [fontsize = 8 shape = "record"]';
             graph += ' edge [arrowhead = "ediamond"]'
             for(i = 0;  i < classElements.length; i++){
                 var curClass = classElements[i];
                 graph += curClass["_id"];
                 graph += '[ id = ' + curClass["_id"];
                 graph += ' label = "{';
                 graph += curClass["Name"];


                 var classAttributes = classElements[i]["Attributes"];
                 if (classAttributes.length != 0){
                     graph += '|';
                     for(j = 0; j < classAttributes.length; j++) {
                         graph += '-   ' ;
                         graph += classAttributes[j]["Name"];
                         graph += ':'+classAttributes[j]["Type"];
                         graph += '\\l';
                     }
                 }

                 // graph += '|';

                 var classOperations = classElements[i]["Operations"];
                 if (classOperations.length != 0){
                     graph += '|';
                     for(j = 0; j < classOperations.length;j++) {
                         
                    	 graph += '+   ' ;
                         graph += classOperations[j]["Name"] + '(';
                         var para_len = classOperations[j]["Parameters"].length;
                         for (k = 0; k < para_len - 1; k++) {
                        	 graph += classOperations[j]["Parameters"][k]["Type"]+" "+ classOperations[j]["Parameters"][k]["Name"];
                         }
                         graph += ')';

                         if(para_len > 0){
                         graph += ':'+classOperations[j]["Parameters"][para_len - 1]["Type"];
                         }
                         graph += "\\l";
                     }
                 }



                 graph += '}"]';
			 }
             
            graph += 'imagepath = \"./public\"}';
            
     		console.log("graph is:"+graph);
     		dottyUtil = require("../../utils/DottyUtil.js");
     		dottyUtil.drawDottyGraph(graph, graphFilePath, function(){
     			console.log("class Diagram is done");
     		});

             
             return graph;
		}
	
	
	
	module.exports = {
			generateUMLDiagram:generateUMLDiagram,
			createClassDiagram: createClassDiagramFunc,
			drawSequenceDiagram: drawSequenceDiagramFunc,
			drawClassDiagram: drawClassDiagram
	}
})();
