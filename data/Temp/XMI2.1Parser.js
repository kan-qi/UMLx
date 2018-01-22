/**
 * This module is used to parse different XMI modelf files.
 */

(function() {
	var fs = require('fs');
	var xml2js = require('xml2js');
	var parser = new xml2js.Parser();

	function SequenceDiagram(name) {
		this.Name = name;
		this.Elements = {};
	}

	function ClassDiagram(name) {
		this.Name = name;
		this.Elements = {};
	}

	function RobustnessDiagram(name) {
		this.Name = name;
		this.Elements = {};
		// this.findElementByID = function(id){
		// for(var i=0; i<Elements.length; i++){
		// var element = this.Elements[i];
		// if(element.ElementID == id){
		// return element;
		// }
		// }
		// return null;
		// };
		// this.putElement = function(element){
		// var id = element.ElementID;
		// if(id === undefined || id === null){
		// return;
		// }
		// for(var i=0; i<this.Elements.length; i++){
		// var e = this.Elements[i];
		// if(e.ElementID == id){
		// e.Name = element.Name;
		// e.Type = element.Type;
		// e.Connetors = e.Connectors;
		// return;
		// }
		// }
		// this.Elements.push(element);
		// }
	}

	module.exports = {
			// pass a file path as string to the XMI model file.
			parseXMIModel : function(file) {
				fs.readFile(file, function(err, data) {
					parser.parseString(data, function(err, result) {console.dir(result['xmi:XMI']['xmi:Extension'][0]['elements'][0]['element'][9]['links'][0]['Association'][0]['$']['start']);
					console.dir(result['xmi:XMI']['xmi:Extension'][0]['elements'][0]['element'][2]['properties'][0]['$']['sType']);
					console.log('Done');
					});
				});
			},
			extractClassDiagrams: function(file, func){
				fs.readFile(file, function(err, data) {
					parser.parseString(data, function(err, result) {
						var xmiExtension = result['xmi:XMI']['xmi:Extension'];
						var classDiagrams = {};
						var elements = xmiExtension[0]['elements'][0]['element'];
						for (var i = 0; i < elements.length; i++) {
							var element = elements[i];
							var xmiType = element['$']['xmi:type'];
							var elementID = element['$']['xmi:idref'];
							if (xmiType === undefined) {
								continue;
							}
							if (xmiType === 'uml:UseCase') {
								var classDiagram = classDiagrams[element['$']['xmi:idref']];
								// console.log("use
								// case--------------------"+element['$'].name);
								if (classDiagram === undefined) {
									classDiagrams[elementID] = new ClassDiagram(
											element['$'].name);
								} else {
									// refresh the
									// name and
									// other aspects
									// about the
									// data of
									// robustness
									// diagram.
									classDiagram.Name = element['$'].name;
								}

							} else if (xmiType === 'uml:Class') {
								var type = element['properties'][0]['$']['sType'];
								if (type !== 'undefined' && element['model'] !== undefined && element['model'][0]['$']['owner'] !== 'undefined') {
									var ownerId = element['model'][0]['$']['owner'];
									if (!classDiagrams.hasOwnProperty(ownerId)) {
										classDiagrams[ownerId] = new ClassDiagram("");
									}
									var owner = classDiagrams[ownerId];
									var parameters = new Array();


									if (element['templateParameters'] !== undefined
											&& element['templateParameters'][0] != undefined
											&& element['templateParameters'][0]['parameter'] != undefined) {

										for (var j = 0; j < element['templateParameters'][0]['parameter'].length; j++) {
											var cls = element['templateParameters'][0]['parameter'][j];
											parameters
											.push({
												Name : cls['$']['name'],
												Type : cls['$']['type']
											});
										}

									}
									var classDiagramElement = {
											Name : element['$']['name'],
											Type : type,
											Parameters : parameters
									};
									owner.Elements[elementID] = classDiagramElement;
								}
							}
						}
//						console.dir(robustnessDiagrams);
						func(classDiagrams);
					})
				});
			},
			extractSequenceDiagrams : function(file, func) {
				// robustnessDiagram
				// contained in the
				// xmi model file
				fs.readFile(file, function(err, data) {
					parser.parseString(data, function(err, result) {
						//get the order of the message from message elements uml:Model
						var umlModel = result['xmi:XMI']['uml:Model'];
						var searchForUseCaseInfo = function(packagedElement){
							var useCaseInfo = {};
//							console.log(packagedElement);
							if(packagedElement['$']['xmi:type'] === 'uml:UseCase'){
								var useCaseName = packagedElement['$']['name'];
								var id =  packagedElement['$']['xmi:id'];
								var messages = packagedElement['nestedClassifier'][0]['ownedBehavior'][0]['message'];
								var fragments = packagedElement['nestedClassifier'][0]['ownedBehavior'][0]['fragment'];
								var lifelines = packagedElement['nestedClassifier'][0]['ownedBehavior'][0]['lifeline'];
								var ownedAttributes = packagedElement['nestedClassifier'][0]['ownedAttribute'];
								
								var lifelineAttributes = {};
								for(var i=0; i<ownedAttributes.length; i++){
									var attribute = ownedAttributes[i];
									if(attribute['$']['xmi:type'] === 'uml:Property'){
										var refId = undefined;
										if(attribute['type']){
//											console.log(attribute['type']);
											refId = attribute['type'][0]['$']['xmi:idref'];
										}
										lifelineAttributes[attribute['$']['xmi:id']] = refId; 
									}
								}
								
//								console.log('life line attributes');
//								console.log(lifelineAttributes);
								
								var lifelineToElement = {};
								for(var i=0; i<lifelines.length;i++){
									var lifeline = lifelines[i];
//									console.log(lifeline['$']['xmi:type']);
									if(lifeline['$']['xmi:type'] === 'uml:Lifeline'){
										var elementId = lifeline['$']['xmi:id'];
										if(lifelineAttributes[lifeline['$']['represents']]){
											elementId = lifelineAttributes[lifeline['$']['represents']];
										}
										lifelineToElement[lifeline['$']['xmi:id']] = elementId;
//										console.log(lifelineToElement);
									}
								}
//								console.log('lifelinetoElement');
//								console.log(lifelineToElement);
								
								var fragmentCoverage = {};
								for(var i=0; i<fragments.length; i++){
									var fragment = fragments[i]['$'];
									fragmentCoverage[fragment['xmi:id']] = lifelineToElement[fragment['covered']];
								}
								
//								console.log('coverage');
//								console.log(fragmentCoverage);
								var orderedMessages = [];
								
								for(var i = 0; i < messages.length; i++){
									var message = messages[i]['$'];
//									console.log(fragmentCoverage[message['sendEvent']]+"->"+fragmentCoverage[message['receiveEvent']]);
//									var messageTag = fragmentCoverage[message['sendEvent']]+"->"+fragmentCoverage[message['receiveEvent']];
//									messageOrder[messageTag] = i;
									orderedMessages.push({
										SupplierID:fragmentCoverage[message['sendEvent']],
										ClientID:fragmentCoverage[message['receiveEvent']]
									});
								}
								useCaseInfo[id] = {
										OrderedMessages : orderedMessages,
										Name: useCaseName
								}
//								console.log(useCaseName);
//								console.log(orderedMessages);
//								console.log(useCaseInfo);
							}
							else if(packagedElement['$']['xmi:type'] === 'uml:Package'){
								for(var i in packagedElement['packagedElement']){
										var returnedUseCaseInfo = searchForUseCaseInfo(packagedElement['packagedElement'][i]);
										for(var j in returnedUseCaseInfo){
											useCaseInfo[j] = returnedUseCaseInfo[j];
										}
								}
								
							}
							
							return useCaseInfo;
						}
						
						var useCaseInfo = {};
						for(var i in umlModel){
							var packagedElement = umlModel[i]['packagedElement'];
							for(var j in packagedElement){
							var returnedUseCaseInfo = searchForUseCaseInfo(packagedElement[j]);
							for(var k in returnedUseCaseInfo){
								useCaseInfo[k] = returnedUseCaseInfo[k];
							}
							}
						}
						
//						console.log(useCaseInfo);
						
						var xmiExtension = result['xmi:XMI']['xmi:Extension'];
						var sequenceDiagrams = {};
						var elements = xmiExtension[0]['elements'][0]['element'];
						for (var i = 0; i < elements.length; i++) {
							var element = elements[i];
							var xmiType = element['$']['xmi:type'];
							var elementID = element['$']['xmi:idref'];
							if (xmiType === undefined) {
								continue;
							}
							if (xmiType === 'uml:UseCase') {
								var sequenceDiagram = sequenceDiagrams[element['$']['xmi:idref']];
								// console.log("use
								// case--------------------"+element['$'].name);
								if (sequenceDiagram === undefined) {
									sequenceDiagrams[elementID] = new SequenceDiagram(
											element['$'].name);
								} else {
									// refresh the
									// name and
									// other aspects
									// about the
									// data of
									// robustness
									// diagram.
									sequenceDiagram.Name = element['$'].name;
								}

							} else if (xmiType === 'uml:Sequence') {
								var type = element['properties'][0]['$']['stereotype'];
								if (type !== 'undefined'
									&& element['model'] !== undefined
									&& element['model'][0]['$']['owner'] !== 'undefined') {
									var ownerId = element['model'][0]['$']['owner'];
									if (!sequenceDiagrams.hasOwnProperty(ownerId)) {
										sequenceDiagrams[ownerId] = new SequenceDiagram("");
									}
									var owner = sequenceDiagrams[ownerId];
									var connectors = new Array();

									if (element['links'] !== undefined
											&& element['links'][0] != undefined
											&& element['links'][0]['Sequence'] != undefined) {

										for (var j = 0; j < element['links'][0]['Sequence'].length; j++) {
											var sequence = element['links'][0]['Sequence'][j];
//											console.log(sequence['$']['start']+"->"+sequence['$']['end']);
//											var order = messageOrder[sequence['$']['start']+"->"+sequence['$']['end']];
											connectors.push({
												ClientID : sequence['$']['start'],
												SupplierID : sequence['$']['end']
											});
										}

									}
									var sequenceDiagramElement = {
											Name : element['$']['name'],
											Type : type,
											Connectors : connectors
									};
//									console.log(sequenceDiagramElement);
									owner.Elements[elementID] = sequenceDiagramElement;
								}
							} else if (xmiType === 'uml:Actor') {
								if (element['model'][0]['$']['owner'] !== undefined
										&& element['links'] !== undefined
										&& element['links'][0]['Sequence'] !== undefined) {// preconditions
									// : as
									// actor
									var ownerId = element['model'][0]['$']['owner'];
									if (!sequenceDiagrams.hasOwnProperty(ownerId)) {
										sequenceDiagrams[ownerId] = new RobustnessDiagram("");
									}
									var owner = sequenceDiagrams[ownerId];
									var connectors = new Array();
									// console.dir(element['links'][0]);
									for (var j = 0; j < element['links'][0]['Sequence'].length; j++) {
										var sequence = element['links'][0]['Sequence'][j];
										connectors
										.push({
											ClientID : sequence['$']['start'],
											SupplierID : sequence['$']['end']
										});
									}
									var sequenceDiagramElement = {
											Name : element['$']['name'],
											Type : 'actor',
											Connectors : connectors
									};
									owner.Elements[elementID] = sequenceDiagramElement;
								}
							}
						}

						for(var i in sequenceDiagrams){
							sequenceDiagrams[i]['Messages'] = useCaseInfo[i]['OrderedMessages'];
//
//							console.log(useCaseInfo[i]);
						}
						func(sequenceDiagrams);
//						console.log(sequenceDiagrams);
					})
				});
			},
			extractRobustnessDiagrams : function(file, func) { // return a list of
				// robustnessDiagram
				// contained in the
				// xmi model file
				fs.readFile(file, function(err, data) {parser.parseString(data, function(err, result) {
					var xmiExtension = result['xmi:XMI']['xmi:Extension'];
					var robustnessDiagrams = [];
					var elements = xmiExtension[0]['elements'][0]['element'];
					for (var i = 0; i < elements.length; i++) {
						var element = elements[i];
						var xmiType = element['$']['xmi:type'];
						var elementID = element['$']['xmi:idref'];
						if (xmiType === undefined) {
							continue;
						}
						if (xmiType === 'uml:UseCase') {
							var robustnessDiagram = robustnessDiagrams[element['$']['xmi:idref']];
							// console.log("use
							// case--------------------"+element['$'].name);
							if (robustnessDiagram === undefined) {
								robustnessDiagrams[elementID] = new RobustnessDiagram(element['$'].name);
							} else {
								// refresh the
								// name and
								// other aspects
								// about the
								// data of
								// robustness
								// diagram.
								robustnessDiagram.Name = element['$'].name;
							}

						} else if (xmiType === 'uml:Object') {
							var type = element['properties'][0]['$']['stereotype'];
							if (type !== 'undefined'
								&& element['model'] !== undefined
								&& element['model'][0]['$']['owner'] !== 'undefined') {
								var ownerId = element['model'][0]['$']['owner'];
								if (!robustnessDiagrams
										.hasOwnProperty(ownerId)) {
									robustnessDiagrams[ownerId] = new RobustnessDiagram(
											"");
								}
								var owner = robustnessDiagrams[ownerId];
								var connectors = new Array();

								if (element['links'] !== undefined
										&& element['links'][0] != undefined
										&& element['links'][0]['Association'] != undefined) {

									for (var j = 0; j < element['links'][0]['Association'].length; j++) {
										var association = element['links'][0]['Association'][j];
										connectors
										.push({
											ClientID : association['$']['start'],
											SupplierID : association['$']['end']
										});
									}

								}
								var robustnessDiagramElement = {
										Name : element['$']['name'],
										Type : type,
										Connectors : connectors
								};
								owner.Elements[elementID] = robustnessDiagramElement;
							}
						} else if (xmiType === 'uml:Actor') {
							if (element['model'][0]['$']['owner'] !== undefined
									&& element['links'] !== undefined
									&& element['links'][0]['Association'] !== undefined) {// preconditions
								// : as
								// actor
								var ownerId = element['model'][0]['$']['owner'];
								if (!robustnessDiagrams
										.hasOwnProperty(ownerId)) {
									robustnessDiagrams[ownerId] = new RobustnessDiagram(
											"");
								}
								var owner = robustnessDiagrams[ownerId];
								var connectors = new Array();
								// console.dir(element['links'][0]);
								for (var j = 0; j < element['links'][0]['Association'].length; j++) {
									var association = element['links'][0]['Association'][j];
									connectors
									.push({
										ClientID : association['$']['start'],
										SupplierID : association['$']['end']
									});
								}
								var robustnessDiagramElement = {
										Name : element['$']['name'],
										Type : 'actor',
										Connectors : connectors
								};
								owner.Elements[elementID] = robustnessDiagramElement;
							}
						}
					}
//					console.dir(robustnessDiagrams);
					func(robustnessDiagrams);
				})
				});
			}
	}
}());