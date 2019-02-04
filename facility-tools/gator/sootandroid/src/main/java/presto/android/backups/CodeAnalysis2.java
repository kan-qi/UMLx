/*
 * AnalysisEntrypoint.java - part of the GATOR project
 *
 * Copyright (c) 2018 The Ohio State University
 *
 * This file is distributed under the terms described in LICENSE in the
 * root directory.
 */
package presto.android;

import presto.android.gui.GUIAnalysis;
import soot.Body;
import soot.Scene;
import soot.SootClass;
import soot.SootMethod;
import soot.Unit;
import soot.Value;
import soot.ValueBox;
import soot.jimple.FieldRef;
import soot.jimple.InvokeExpr;
import soot.jimple.Stmt;
import soot.jimple.internal.JAssignStmt;
import soot.jimple.toolkits.callgraph.CallGraph;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

/**
 * var dicClassUnits = {};
	var dicMethodUnits = {};
	var dicCompositeClasses = {};
	var dicCompositeClass = {}; // {subclass.uuid, compositeClassUnit.uuid}
	var dicCompositeSubclasses = {}; // {compositeClassUnit.uuid, [subclass.uuid]}
	var dicMethodClass = {};	 // {method.uuid, class.uuid}
	var dicActionElementMethod = {};
	
	Output the code dictionaries by soot.
	
	var ActionElement = {
						name:XMIActionElement['$']['name'],
						uuid:XMIActionElement['$']['uuid'],
						kind:XMIActionElement['$']['kind'],
						type:XMIActionElement['$']['xsi:type'],,
						StorableUnits: [],
						ClassUnits: [],
						Addresses: [],
						Reads:[],
						Calls:[],
						Creates:[],
						ActionElements:[],
						attachment:XMIActionElement
		}
		
			var MethodUnit = {
				uuid: XMIMethodUnit['$']['uuid'],
				Signature: null,
				BlockUnit : {
					ActionElements: []
				},
				attachment: XMIMethodUnit
		}


// those elements store all the same type of elements in the sub classes.
		var ClassUnit = {
				name: XMIClassUnit['$']['name'],
				isAbstract: XMIClassUnit['$']['isAbstract'],
				Source: null,
				MethodUnits : [],
				StorableUnits: [],
				InterfaceUnits : [],
				Imports : [],
				ClassUnits: [],
				uuid: XMIClassUnit['$']['uuid'],
				attachment: XMIClassUnit
		}
		
		
		var call = {
				to: XMICall['$']['to'],
				from:XMICall['$']['from']
			}
			
			
       var extend = {
				to: XMIExtend['$']['to'],
				from: XMIExtend['$']['from']
			};
			
		var storableUnit = {
				name: XMIStorableUnit['$']['name'],
				type: XMIStorableUnit['$']['type'] // this is a path to the class
			};
			
			
		var externalClassUnit = {
					name: XMIExternalClassUnit['$']['name'],
					type: XMIExternalClassUnit['$']['xsi:type'],
				}
	
	
 * @author Kan Qi
 *
 */
public class CodeAnalysis2 {
  private static CodeAnalysis2 theInstance;

  private CodeAnalysis2() {
  }

  public static synchronized CodeAnalysis2 v() {
    if (theInstance == null) {
      theInstance = new CodeAnalysis2();
    }
    return theInstance;
  }
  
  
  /**
   * // those elements store all the same type of elements in the sub classes.
		var ClassUnit = {
				name: XMIClassUnit['$']['name'],
				isAbstract: XMIClassUnit['$']['isAbstract'],
				Source: null,
				MethodUnits : [],
				StorableUnits: [],
				InterfaceUnits : [],
				Imports : [],
				ClassUnits: [],
				uuid: XMIClassUnit['$']['uuid'],
				attachment: XMIClassUnit
		}
		
		
   * @return
   */
//  private List<> identifyClassUnits(){
//	  Scene.v().getFastHierarchy().get
//  }
//  
//  
//  private List<> identifyMethodUnits(){
//	  
//  }
//  
//  
//  private void createCallGraph() {
//	    SetupApplication app = new SetupApplication
//                (androidPlatformPath,
//                        appPath);
//        app.calculateSourcesSinksEntrypoints("D:\\Arbeit\\Android Analyse\\soot-infoflow-android\\SourcesAndSinks.txt");
//        soot.G.reset();
//
//        Options.v().set_src_prec(Options.src_prec_apk);
//        Options.v().set_process_dir(Collections.singletonList(appPath));
//        Options.v().set_android_jars(androidPlatformPath);
//        Options.v().set_whole_program(true);
//        Options.v().set_allow_phantom_refs(true);
//        Options.v().setPhaseOption("cg.spark", "on");
//
//        Scene.v().loadNecessaryClasses();
//
//        SootMethod entryPoint = app.getEntryPointCreator().createDummyMain();
//        Options.v().set_main_class(entryPoint.getSignature());
//        Scene.v().setEntryPoints(Collections.singletonList(entryPoint));
//        System.out.println(entryPoint.getActiveBody());
//
//        PackManager.v().runPacks();
//
//        CallGraph appCallGraph = Scene.v().getCallGraph();
//        
//  }
//  
//  
//  private void constructTypeDependencyGraph() {
//
//		// var edges = [];
//		// var nodes = [];
//		// var nodesByName = {};
//
//		var edgesAttr = [];
//		var nodesAttr = [];
//		var nodesByNameAttr = {};
//
//		var edgesLocal = [];
//		var nodesLocal = [];
//		var nodesByNameLocal = {};
//
//		var edgesPara = [];
//		var nodesPara = [];
//		var nodesByNamePara = {};
//
//		var nodesP = [];
//		var edgesP = [];
//		var nodesByNameP = {};
//
//		var edgesAttrComposite = [];
//		var nodesAttrComposite = [];
//		var nodesByNameAttrComposite = {};
//
//		var nodesPComposite = [];
//		var edgesPComposite = [];
//		var nodesByNamePComposite = {};
//
//		// console.log("top classes");
//		// console.log(topClassUnits);
//
//		for (var i in dicClassUnits) {
//			var classUnit = dicClassUnits[i];
//			//			console.log('test');
//			//			console.log(classUnit);
//			// var xmiClassUnit = classUnit.attachment;
//			var XMIClassStorableUnits = classUnit.StorableUnits
//			for (var q in XMIClassStorableUnits) {
//				var XMIClassStorableUnit = XMIClassStorableUnits[q];
//				if (XMIClassStorableUnit.type == undefined) {
//					continue;
//				}
//				var XMIClassStorableUnitType = jp.query(xmiString, kdmModelUtils.convertToJsonPath(XMIClassStorableUnit.type));
//				var targetClassUnit = null;
//				// console.log('StorableUnit');
//				// console.log(XMIClassStorableUnitType[0]['$']['uuid']);
//
//				if (!XMIClassStorableUnitType || XMIClassStorableUnitType.length < 1) {
//					continue;
//				}
//
//				for (var j in dicClassUnits) {
//					var classUnitCandidate = dicClassUnits[j];
//					if (classUnitCandidate.uuid == XMIClassStorableUnitType[0]['$']['uuid']) {
//						targetClassUnit = classUnitCandidate;
//					}
//				}
//				console.log("targetClassUnit");
//				console.log(targetClassUnit);
//				if (!targetClassUnit || !targetClassUnit.isWithinBoundary) { // the type of the parameter is not within dicClassUnits, like string, int...
//					continue;
//				}
//
//				var compositeClassUnitUUID = dicCompositeClass[classUnit.uuid];
//				var targetCompositeClassUnitUUID = dicCompositeClass[targetClassUnit.uuid];
//				var compositeClassUnit = dicCompositeClasses[compositeClassUnitUUID];
//				var compositeTargetClassUnit = dicCompositeClasses[targetCompositeClassUnitUUID];
//
//				// eliminate the composite classes which are not composite (only containing one original class) and not related to other classes
//				if ((compositeClassUnit != compositeTargetClassUnit) || compositeClassUnit.isComposite) {
//					if (!referencedClassUnitsComposite.includes(compositeClassUnit)) {
//						referencedClassUnitsComposite.push(compositeClassUnit);
//					}
//
//					if (!referencedClassUnitsComposite.includes(compositeTargetClassUnit)) {
//						referencedClassUnitsComposite.push(compositeTargetClassUnit);
//					}
//				}
//				else {
//					continue;
//				}
//
//				var startNodeComposite = nodesByNameAttrComposite[compositeClassUnit.uuid];
//				if (!startNodeComposite) {
//					startNodeComposite = {
//						name: compositeClassUnit.name,
//						// isResponse: methodUnit.isResponse,
//						component: {
//							name: compositeClassUnit.name,
//							classUnit: compositeClassUnit.uuid
//						},
//						uuid: compositeClassUnit.uuid
//						//							isWithinBoundary: targetClassUnit.isWithinBoundary
//					};
//					nodesAttrComposite.push(startNodeComposite);
//					nodesByNameAttrComposite[compositeClassUnit.uuid] = startNodeComposite;
//				}
//
//				var endNodeComposite = nodesByNameAttrComposite[compositeTargetClassUnit.uuid];
//				if (!endNodeComposite) {
//					endNodeComposite = {
//						name: compositeTargetClassUnit.name,
//						// isResponse: targetMethodUnit.isResponse,
//						component: {
//							name: compositeTargetClassUnit.name,
//							classUnit: compositeTargetClassUnit.uuid,
//						},
//						uuid: compositeTargetClassUnit.uuid
//						//							isWithinBoundary: targetClassUnit.isWithinBoundary
//					};
//					nodesAttrComposite.push(endNodeComposite);
//					nodesByNameAttrComposite[compositeTargetClassUnit.uuid] = endNodeComposite;
//				}
//				//				var end = targetClassUnit.name;
//				edgesAttrComposite.push({ start: startNodeComposite, end: endNodeComposite });
//
//
//
//				if (classUnit != targetClassUnit) {
//					if (!referencedClassUnits.includes(classUnit)) {
//						referencedClassUnits.push(classUnit);
//					}
//
//					if (!referencedClassUnits.includes(targetClassUnit)) {
//						referencedClassUnits.push(targetClassUnit);
//					}
//				}
//				else {
//					continue;
//				}
//
//				var startNode = nodesByNameAttr[classUnit.uuid];
//				if (!startNode) {
//					startNode = {
//						name: classUnit.name + ":" + XMIClassStorableUnit.name,
//						// isResponse: methodUnit.isResponse,
//						component: {
//							name: classUnit.name,
//							classUnit: classUnit.uuid
//						},
//						uuid: XMIClassStorableUnit.uuid,
//						attributeName: XMIClassStorableUnit.name
//						//							isWithinBoundary: targetClassUnit.isWithinBoundary
//					};
//					nodesAttr.push(startNode);
//					nodesByNameAttr[classUnit.uuid] = startNode;
//				}
//
//				var endNode = nodesByNameAttr[targetClassUnit.uuid];
//				if (!endNode) {
//					endNode = {
//						name: targetClassUnit.name,
//						// isResponse: targetMethodUnit.isResponse,
//						component: {
//							name: targetClassUnit.name,
//							classUnit: targetClassUnit.uuid,
//						},
//						uuid: targetClassUnit.uuid
//						//							isWithinBoundary: targetClassUnit.isWithinBoundary
//					};
//					nodesAttr.push(endNode);
//					nodesByNameAttr[targetClassUnit.uuid] = endNode;
//				}
//				//				var end = targetClassUnit.name;
//				edgesAttr.push({ start: startNode, end: endNode });
//				
//			}
//			// var calls = kdmModelUtils.identifyCalls(xmiClassUnit);
//			// var XMIMethodUnits = jp.query(xmiClassUnit, '$.codeElement[?(@[\'$\'][\'xsi:type\']==\'code:MethodUnit\')]');
//			var XMIMethodUnits = classUnit.MethodUnits;
//			for (var i in XMIMethodUnits) {
//				// var XMIMethodUnit = XMIMethodUnits[i];
//				// var methodUnit = kdmModelUtils.identifyMethodUnit(XMIMethodUnit, xmiString);
//				var methodUnit = XMIMethodUnits[i];
//				var methodParameters = methodUnit.Signature.parameterUnits; // the parameters of the method, including input and return
//				// var methodClassUnit = locateClassUnitForMethod(methodUnit, topClassUnits); // the class which owns the method
//				var methodClassUnit = classUnit;
//
//				if (!methodParameters || !methodClassUnit || !methodClassUnit.isWithinBoundary) {
//					continue;
//				}
//
//				// To find the local variable
//				var methodActionElements = methodUnit.BlockUnit.ActionElements;
//				for (var k in methodActionElements) {
//					var methodActionElement = methodActionElements[k];
//					var methodLocalVariables = methodActionElement.StorableUnits;
//					for (var p in methodLocalVariables) {
//						var methodLocalVariable = methodLocalVariables[p];
//						var localVariableType = jp.query(xmiString, kdmModelUtils.convertToJsonPath(methodLocalVariable.type));
//						if (!localVariableType || localVariableType.length < 1) {
//							continue;
//						}
//						var targetClassUnit = null;
//						for (var j in dicClassUnits) {
//							var classUnitCandidate = dicClassUnits[j];
//							if (classUnitCandidate.uuid == localVariableType[0]['$']['uuid']) {
//								targetClassUnit = classUnitCandidate;
//							}
//						}
//						if (!targetClassUnit || !targetClassUnit.isWithinBoundary) { // the type of the parameter is not within dicClassUnits, like string, int...
//							continue;
//						}
//
//						var compositeClassUnitUUID = dicCompositeClass[methodClassUnit.uuid];
//						var targetCompositeClassUnitUUID = dicCompositeClass[targetClassUnit.uuid];
//						var compositeClassUnit = dicCompositeClasses[compositeClassUnitUUID];
//						var compositeTargetClassUnit = dicCompositeClasses[targetCompositeClassUnitUUID];
//
//
//						if ((compositeClassUnit != compositeTargetClassUnit) || compositeClassUnit.isComposite) {
//							if (!referencedClassUnitsComposite.includes(compositeClassUnit)) {
//								referencedClassUnitsComposite.push(compositeClassUnit);
//							}
//
//							if (!referencedClassUnitsComposite.includes(compositeTargetClassUnit)) {
//								referencedClassUnitsComposite.push(compositeTargetClassUnit);
//							}
//						}
//						else {
//							continue;
//						}
//
//						var startNodeComposite = nodesByNamePComposite[methodUnit.uuid];
//						if (!startNodeComposite) {
//							startNodeComposite = {
//								name: compositeClassUnit.name + ":" + methodUnit.Signature.name + ":" + methodLocalVariable.name,
//								// isResponse: methodUnit.isResponse,
//								component: {
//									name: compositeClassUnit.name,
//									classUnit: compositeClassUnit.uuid
//								},
//								// uuid: compositeClassUnit.uuid
//								//							isWithinBoundary: targetClassUnit.isWithinBoundary
//							};
//							nodesPComposite.push(startNodeComposite);
//							nodesByNamePComposite[methodUnit.uuid] = startNodeComposite;
//						}
//
//						var endNodeComposite = nodesByNamePComposite[compositeTargetClassUnit.uuid];
//						if (!endNodeComposite) {
//							endNodeComposite = {
//								name: compositeTargetClassUnit.name,
//								// isResponse: targetMethodUnit.isResponse,
//								component: {
//									name: compositeTargetClassUnit.name,
//									classUnit: compositeTargetClassUnit.uuid,
//								},
//								uuid: compositeTargetClassUnit.uuid
//								//							isWithinBoundary: targetClassUnit.isWithinBoundary
//							};
//							nodesPComposite.push(endNodeComposite);
//							nodesByNamePComposite[compositeTargetClassUnit.uuid] = endNodeComposite;
//						}
//						//				var end = targetClassUnit.name;
//						edgesPComposite.push({ start: startNodeComposite, end: endNodeComposite });
//
//						if (methodClassUnit != targetClassUnit) {
//							if (!referencedClassUnits.includes(methodClassUnit)) {
//								referencedClassUnits.push(methodClassUnit);
//							}
//
//							if (!referencedClassUnits.includes(targetClassUnit)) {
//								referencedClassUnits.push(targetClassUnit);
//							}
//						}
//						else {
//							continue;
//						}
//
//						if (!(dicMethodParameters.hasOwnProperty(methodUnit.uuid))) {
//							var methodParameters = methodUnit.Signature.parameterUnits;
//							var name = null;
//							var dicParameters = [];
//							for (var l in methodParameters) {
//								if (methodParameters[l].hasOwnProperty('name')) {
//									name = methodParameters[l].name;
//								}
//								//								var type = jp.query(xmiString, kdmModelUtils.convertToJsonPath(methodParameters[l].type));
//								var type = methodParameters[l].type;
//								var typeClass = null;
//								for (var j in dicClassUnits) {
//									var classUnitCandidate = dicClassUnits[j];
//									if (classUnitCandidate.uuid == type.uuid) {
//										typeClass = classUnitCandidate;
//									}
//								}
//								if (!typeClass) {
//									continue;
//								}
//								var parameter = {
//									Name: name,
//									// kind: methodParameters[l].kind,
//									Type: typeClass.name,
//									Typeuuid: typeClass.uuid,
//								};
//								dicParameters.push(parameter);
//							}
//							dicMethodParameters[methodUnit.uuid] = dicParameters;
//						}
//
//						var startNode = nodesByNameLocal[methodUnit.uuid];
//						if (!startNode) {
//							startNode = {
//								name: methodClassUnit.name + ":" + methodUnit.Signature.name + ":" + methodLocalVariable.name,
//								// isResponse: methodUnit.isResponse,
//								component: {
//									name: methodClassUnit.name,
//									classUnit: methodClassUnit.uuid
//								},
//								// uuid: methodLocalVariable.uuid
//								//							isWithinBoundary: targetClassUnit.isWithinBoundary
//							};
//							nodesLocal.push(startNode);
//							nodesByNameLocal[methodUnit.uuid] = startNode;
//							nodesP.push(startNode);
//							nodesByNameP[methodUnit.uuid] = startNode;
//						}
//
//						var endNode = nodesByNameLocal[targetClassUnit.uuid];
//						if (!endNode) {
//							endNode = {
//								name: targetClassUnit.name,
//								// isResponse: targetMethodUnit.isResponse,
//								component: {
//									name: targetClassUnit.name,
//									classUnit: targetClassUnit.uuid
//								},
//								uuid: targetClassUnit.uuid
//								//							isWithinBoundary: targetClassUnit.isWithinBoundary
//							};
//							nodesLocal.push(endNode);
//							nodesByNameLocal[targetClassUnit.uuid] = endNode;
//							nodesP.push(endNode);
//							nodesByNameP[targetClassUnit.uuid] = endNode;
//						}
//						//				var end = targetClassUnit.name;
//						edgesLocal.push({ start: startNode, end: endNode });
//						edgesP.push({ start: startNode, end: endNode });
//
//
//
//						// console.log("checkcheckcheck!");
//						// console.log({start: startNodeComposite, end: endNodeComposite});
//						// console.log({start: startNode, end: endNode});
//
//					}
//				}
//
//				// targeted at input and return parameters of this method
//				for (var i in methodParameters) {
//					var methodParameter = methodParameters[i];
//					//					var XMIParameterType = jp.query(xmiString, kdmModelUtils.convertToJsonPath(methodParameter.type));
//					var type = methodParameter.type;
//					//					
//					//					if(!XMIParameterType || XMIParameterType.length < 1){
//					//						continue;
//					//					}
//
//					//					console.log(XMIParameterType);
//
//					var targetClassUnit = null;
//					for (var j in dicClassUnits) {
//						var classUnitCandidate = dicClassUnits[j];
//						if (classUnitCandidate.uuid == type.uuid) {
//							targetClassUnit = classUnitCandidate;
//						}
//					}
//
//					if (!targetClassUnit || !targetClassUnit.isWithinBoundary) { // the type of the parameter is not within dicClassUnits, like string, int...
//						continue;
//					}
//
//					var compositeClassUnitUUID = dicCompositeClass[methodClassUnit.uuid];
//					var targetCompositeClassUnitUUID = dicCompositeClass[targetClassUnit.uuid];
//					var compositeClassUnit = dicCompositeClasses[compositeClassUnitUUID];
//					var compositeTargetClassUnit = dicCompositeClasses[targetCompositeClassUnitUUID];
//
//
//					if ((compositeClassUnit != compositeTargetClassUnit) || compositeClassUnit.isComposite) {
//						if (!referencedClassUnitsComposite.includes(compositeClassUnit)) {
//							referencedClassUnitsComposite.push(compositeClassUnit);
//						}
//
//						if (!referencedClassUnitsComposite.includes(compositeTargetClassUnit)) {
//							referencedClassUnitsComposite.push(compositeTargetClassUnit);
//						}
//					}
//					else {
//						continue;
//					}
//
//					var startNodeComposite = nodesByNamePComposite[methodUnit.uuid];
//					if (!startNodeComposite) {
//						startNodeComposite = {
//							name: compositeClassUnit.name + ":" + methodUnit.Signature.name + ":" + methodParameter.name,
//							// isResponse: methodUnit.isResponse,
//							component: {
//								name: compositeClassUnit.name,
//								classUnit: compositeClassUnit.uuid
//							},
//							// uuid: compositeClassUnit.uuid
//							//							isWithinBoundary: targetClassUnit.isWithinBoundary
//						};
//						nodesPComposite.push(startNodeComposite);
//						nodesByNamePComposite[methodUnit.uuid] = startNodeComposite;
//					}
//
//					var endNodeComposite = nodesByNamePComposite[compositeTargetClassUnit.uuid];
//					if (!endNodeComposite) {
//						endNodeComposite = {
//							name: compositeTargetClassUnit.name,
//							// isResponse: targetMethodUnit.isResponse,
//							component: {
//								name: compositeTargetClassUnit.name,
//								classUnit: compositeTargetClassUnit.uuid,
//							},
//							uuid: compositeTargetClassUnit.uuid
//							//							isWithinBoundary: targetClassUnit.isWithinBoundary
//						};
//						nodesPComposite.push(endNodeComposite);
//						nodesByNamePComposite[compositeTargetClassUnit.uuid] = endNodeComposite;
//					}
//					//				var end = targetClassUnit.name;
//					edgesPComposite.push({ start: startNodeComposite, end: endNodeComposite });
//
//					if (methodClassUnit != targetClassUnit) {
//						if (!referencedClassUnits.includes(methodClassUnit)) {
//							referencedClassUnits.push(methodClassUnit);
//						}
//
//						if (!referencedClassUnits.includes(targetClassUnit)) {
//							referencedClassUnits.push(targetClassUnit);
//						}
//					}
//					else {
//						continue;
//					}
//
//					var startNode = nodesByNamePara[methodUnit.uuid];
//					if (!startNode) {
//						startNode = {
//							name: methodClassUnit.name + ":" + methodUnit.Signature.name + ":" + methodParameter.name,
//							// isResponse: methodUnit.isResponse,
//							component: {
//								name: methodClassUnit.name,
//								classUnit: methodClassUnit.uuid
//							},
//							method: {
//								name: methodUnit.Signature.name,
//								uuid: methodUnit.uuid,
//								parameter: {
//									name: methodParameter.name,
//									uuid: methodParameter.uuid
//								}
//							},
//							uuid: methodParameter.uuid
//							//							isWithinBoundary: targetClassUnit.isWithinBoundary
//						};
//						nodesPara.push(startNode);
//						nodesByNamePara[methodUnit.uuid] = startNode;
//						nodesP.push(startNode);
//						nodesByNameP[methodUnit.uuid] = startNode;
//					}
//
//					var endNode = nodesByNamePara[targetClassUnit.uuid];
//					if (!endNode) {
//						endNode = {
//							name: targetClassUnit.name,
//							// isResponse: targetMethodUnit.isResponse,
//							component: {
//								name: targetClassUnit.name,
//								classUnit: targetClassUnit.uuid
//							},
//							uuid: targetClassUnit.uuid
//							//							isWithinBoundary: targetClassUnit.isWithinBoundary
//						};
//						nodesPara.push(endNode);
//						nodesByNamePara[targetClassUnit.uuid] = endNode;
//						nodesP.push(endNode);
//						nodesByNameP[targetClassUnit.uuid] = endNode;
//					}
//					//				var end = targetClassUnit.name;
//					edgesPara.push({ start: startNode, end: endNode });
//					edgesP.push({ start: startNode, end: endNode });
//
//
//
//					// console.log("checkcheckcheck!")
//					// console.log({start: startNodeComposite, end: endNodeComposite})
//					// console.log({start: startNode, end: endNode})
//
//
//				}
//			}
//		}
//
//		// console.log("edgesPComposite");
//		// console.log(edgesPComposite);
//
//		return { nodesAttr: nodesAttr, edgesAttr: edgesAttr, nodesP: nodesP, edgesP: edgesP, nodesPara: nodesPara, edgesPara: edgesPara, nodesAttrComposite: nodesAttrComposite, edgesAttrComposite: edgesAttrComposite, nodesPComposite: nodesPComposite, edgesPComposite: edgesPComposite };
//
//	}
//  
  class ClassUnit extends SootClass{
	  public ClassUnit(SootClass sootClass, boolean isWithinBoundary) {
		super(sootClass.getName());
		// TODO Auto-generated constructor stub
		this.attachment = sootClass;
		this.uuid = UUID.randomUUID().toString();
		this.isWithinBoundary = isWithinBoundary;
		
	}
	  String uuid;
	  SootClass attachment;
	  boolean isWithinBoundary;
	  
	  public List<SootMethod> getMethods(){	
		 return attachment.getMethods();
	  }
	  
	  public String toJSONString() {
		  return "{uuid:\""+ 
				  this.uuid+"\","+
				  "name:\""+
				  this.name+"\","+
				  "isWithinBoundary:\""+
				  this.isWithinBoundary+"\"}";
				  
	  }

	@Override
	public void checkLevel(int level) {
		this.attachment.checkLevel(level);
	}

	@Override
	public boolean isInterface() {
		return this.attachment.isInterface();
	}
	  
	  
  }
  
  class CompositeClassUnit implements Set<ClassUnit>{
	  Set<ClassUnit> classUnits;
	  String name;
	  String uuid;
	  
	  public CompositeClassUnit(String name) {
		  this.classUnits = new HashSet<ClassUnit>();
//		  this.classUnits.add(classUnit);
//		  this.name = classUnit.getName();
		  this.name = name;
		  this.uuid = UUID.randomUUID().toString();
	  }
	  
	  public boolean contains(ClassUnit classUnit) {
		  return classUnits.contains(classUnit);
	  }
	 
	  public String toJSONString() {
		  Iterator<ClassUnit> iterator = classUnits.iterator();
		  StringBuilder Json = new StringBuilder();
		  Json.append("{name: \""+name+"\",");
		  Json.append("uuid: \""+uuid+"\",");
		  Json.append("classUnits: [");
		  while(iterator.hasNext()) {
			  ClassUnit classUnit = iterator.next();
//			  Json.append(classUnit.toJSONString());
//			  Json.append("\""+classUnit.getName()+"\"");
			  Json.append("\""+classUnit.uuid+"\"");
			  if(iterator.hasNext()) {
				  Json.append(",");
			  }
		  }
		  Json.append("]}");
		  return Json.toString();
	  }

	@Override
	public boolean add(ClassUnit e) {
		// TODO Auto-generated method stub
		return this.classUnits.add(e);
	}

	@Override
	public boolean addAll(Collection<? extends ClassUnit> c) {
		// TODO Auto-generated method stub
//		Iterator<ClassUnit> iterator = c.iterator();
//		while(iterator.hasNext()) {
//			this.classUnits.add(iterator.next());
//		}
//		return true;
		return this.classUnits.addAll(c);
	}

	@Override
	public void clear() {
		this.classUnits.clear();
		
	}

	@Override
	public boolean contains(Object o) {
		// TODO Auto-generated method stub
		return this.classUnits.contains(o);
	}

	@Override
	public boolean containsAll(Collection<?> c) {
		// TODO Auto-generated method stub
		return this.classUnits.containsAll(c);
	}

	@Override
	public boolean isEmpty() {
		// TODO Auto-generated method stub
		return this.classUnits.isEmpty();
	}

	@Override
	public Iterator<ClassUnit> iterator() {
		// TODO Auto-generated method stub
		return this.classUnits.iterator();
	}

	@Override
	public boolean remove(Object o) {
		// TODO Auto-generated method stub
		return this.classUnits.remove(0);
	}

	@Override
	public boolean removeAll(Collection<?> c) {
		// TODO Auto-generated method stub
		return this.classUnits.removeAll(c);
	}

	@Override
	public boolean retainAll(Collection<?> c) {
		// TODO Auto-generated method stub
		return this.classUnits.retainAll(c);
	}

	@Override
	public int size() {
		// TODO Auto-generated method stub
		return this.classUnits.size();
	}

	@Override
	public Object[] toArray() {
		// TODO Auto-generated method stub
		return this.classUnits.toArray();
	}

	@Override
	public <T> T[] toArray(T[] a) {
		// TODO Auto-generated method stub
		return this.classUnits.toArray(a);
	}
  }
  
  
public String constructAccessGraph(List<ClassUnit> classUnits, List<CompositeClassUnit> compositeClassUnits, Map<String, ClassUnit> classUnitByName, Map<String, ClassUnit> classUnitByUUID, Map<String, CompositeClassUnit> compositeClassUnitByUUID, Map<String, String> classUnitToCompositeClassDic) {

	  	List<ClassUnit[]> edges = new ArrayList<ClassUnit[]>(); // call relation
//	  	List<Node> nodes = new ArrayList<Node>(); // classes
//		Map<String, Node> nodesByName = new HashMap<String, Node>();

		List<CompositeClassUnit[]> compositeEdges = new ArrayList<CompositeClassUnit[]>(); // call relation
//		List<NodeCompoiste> nodesComposite = new ArrayList<NodeComposite>(); // classes
		
		for (ClassUnit classUnit : classUnits) {
//			var classUnit = dicClassUnits.g;
//			var xmiClassUnit = classUnit.attachment;
			
			System.out.printf("class unit id:%s\n", classUnit.uuid);
			String compositeClassUnitUUID = classUnitToCompositeClassDic.get(classUnit.uuid);
			System.out.printf("composite class unit id:%s\n", compositeClassUnitUUID);
			CompositeClassUnit compositeClassUnit = compositeClassUnitByUUID.get(compositeClassUnitUUID);
			System.out.printf("composite class unit:%s\n", compositeClassUnit.name);

			Set<ClassUnit> referencedClassUnits = new HashSet<ClassUnit>();
			
			List<SootMethod> methodUnits = classUnit.getMethods();
			for (SootMethod methodUnit : methodUnits) {
//				var methodUnit = methodUnits[q];

//				if (!methodUnit || !classUnit.isWithinBoundary) {
//					continue;
//				}
				
				System.out.printf("method:%s\n", methodUnit.getName());
//				Debug2.v().printf("method:%s", methodUnit.getName());
				
//				if(!methodUnit.hasActiveBody()) {
//					continue;
//				}
				
//				Body methodBlockUnit = methodUnit.getActiveBody();
				
//				if(!methodUnit.getName().equals("onCreate")) {
//					continue;
//				}
				
//				if(methodUnit.getSource() == null) {
//					continue;
//				}
				
				
				Body methodBlockUnit = null;
				
				try{
					methodBlockUnit = methodUnit.retrieveActiveBody();
				}catch(Exception e) {
					e.printStackTrace();
					continue;
				}
				
				System.out.printf("active body:%s\n", methodUnit.getName());
//				Debug2.v().printf("active body:%s", methodUnit.getName());
				
//				if( s.containsFieldRef() ) {
//	                FieldRef fr = s.getFieldRef();
//	                if( fr instanceof StaticFieldRef ) {
//	                    SootClass cl = fr.getFieldRef().declaringClass();
//	                    for (SootMethod clinit : EntryPoints.v().clinitsOf(cl)) {
//	                        addEdge( source, s, clinit, Kind.CLINIT );
//	                    }
//	                }
//	            }
				
				for (Unit u : methodBlockUnit.getUnits()) {
					System.out.printf("unit:%s\n", u.toString());
					Stmt s = (Stmt) u;
//					if(SootUtilities.isInvoke(s)) {
//						InvokeExpr invokeExpr = s.getInvokeExpr();
//						invokeExpr.getArgs();
//					}
//					else 
						if(s.containsFieldRef()) {
						FieldRef fieldRef = s.getFieldRef();
//					}
//				      List<ValueBox> useBoxes = s.getUseBoxes();
//				      for (ValueBox useBox : useBoxes) {
//				        Value val = useBox.getValue();
//				        System.out.printf("value:%s\n", val.toString());
//				        if(val instanceof FieldRef) {
				         System.out.printf("field:%s\n", fieldRef.toString());
////				        Debug2.v().printf("field:%s\n", val.toString());
//				          FieldRef fieldRef = (FieldRef) val;
				          SootClass targetClassUnitType = fieldRef.getFieldRef().declaringClass();
				          System.out.printf("target class:%s\n", targetClassUnitType.getName());
					        
								ClassUnit targetClassUnit = classUnitByName.get(targetClassUnitType.getName());
								referencedClassUnits.add(targetClassUnit);
					}

				
			  }
			}
			
			for(ClassUnit targetClassUnit : referencedClassUnits) {
				System.out.printf("target class unit:%s\n", targetClassUnit.getName());
				String targetCompositeClassUnitUUID = classUnitToCompositeClassDic.get(targetClassUnit.uuid);
				CompositeClassUnit targetCompositeClassUnit = compositeClassUnitByUUID.get(targetCompositeClassUnitUUID);
				System.out.printf("target composite class unit:%s\n", targetCompositeClassUnit.name);
//				SootClass compositeTargetClassUnit = dicCompositeClasses[targetCompositeClassUnitUUID];

//				if (compositeClassUnit != targetCompositeClassUnit) {
//					if (!referencedClassUnitsComposite.includes(compositeClassUnit)) {
//						referencedClassUnitsComposite.push(compositeClassUnit);
//					}
//
//					if (!referencedClassUnitsComposite.includes(compositeTargetClassUnit)) {
//						referencedClassUnitsComposite.push(compositeTargetClassUnit);
//					}
//				}
//				else {
//					continue;
//				}

//				Node startNodeComposite = nodesByNameComposite[compositeClassUnitUUID];
//				if (!startNodeComposite) {
//					Node startNodeComposite = {
//						name: compositeClassUnit.name + ":" + methodUnit.Signature.name,
//						// isResponse: methodUnit.isResponse,
//						component: {
//							name: compositeClassUnit.name,
//							classUnit: compositeClassUnit.uuid
//						},
//						uuid: methodUnit.uuid
//						// uuid: compositeClassUnit.uuid
//						//							isWithinBoundary: targetClassUnit.isWithinBoundary
//					};
//					nodesComposite.push(startNodeComposite);
//					nodesByNameComposite[methodUnit.uuid] = startNodeComposite;
//				}
//
//				Node endNodeComposite = nodesByNameComposite[targetStorableUnit.uuid];
//				if (!endNodeComposite) {
//					Node endNodeComposite = {
//						name: compositeTargetClassUnit.name,
//						// isResponse: targetMethodUnit.isResponse,
//						component: {
//							name: compositeTargetClassUnit.name,
//							classUnit: compositeTargetClassUnit.uuid,
//						},
//						uuid: targetStorableUnit.uuid
//						//							isWithinBoundary: targetClassUnit.isWithinBoundary
//					};
//					nodesComposite.push(endNodeComposite);
//					nodesByNameComposite[targetStorableUnit.uuid] = endNodeComposite;
//				}
				//				var end = targetClassUnit.name;
				if(classUnit != targetClassUnit) {
				edges.add(new ClassUnit[] {classUnit, targetClassUnit});
				}
				
				if(compositeClassUnit != targetCompositeClassUnit) {
				compositeEdges.add(new CompositeClassUnit[]{compositeClassUnit, targetCompositeClassUnit});
				}
				
				}

//				if (classUnit != targetClassUnit) {
//					if (!referencedClassUnits.includes(classUnit)) {
//						referencedClassUnits.push(classUnit);
//					}
//
//					if (!referencedClassUnits.includes(targetClassUnit)) {
//						referencedClassUnits.push(targetClassUnit);
//					}
//				}
//				else {
//					continue;
//				}

}
		
//		kdmModelDrawer.drawGraph(edges, nodes, outputDir, "access_dependency_graph.dotty");
//		kdmModelDrawer.drawGraph(compositeEdges, nodesComposite, outputDir, "access_dependency_graph_composite.dotty");

//		return { nodes: nodes, edges: edges, nodesComposite: nodesComposite, compositeEdges: compositeEdges };
		
		String outputS = "{compositeClassGraph:[";
		int i = 0;
		for(CompositeClassUnit[] compEdge: compositeEdges) {
			outputS += "{start:\""+compEdge[0].uuid+"\",";
//			outputS += "->";
			outputS += "end:\""+compEdge[1].uuid+"\"}";
//			outputS += "\n";
			if(i != compositeEdges.size()-1) {
				outputS += ",";
			}
			i++;
		}
		outputS += "]";
		
		outputS += ",classGraph:[";
		
		i = 0;
		for(ClassUnit[] edge: edges) {
			outputS += "{start:\""+edge[0].uuid+"\",";
//			outputS += "->";
			outputS += "end:\""+edge[1].uuid+"\"}";
//			outputS += "\n";
			if(i != edges.size()-1) {
				outputS += ",";
			}
			i++;
		}
		outputS += "]}";
		
		System.out.printf("composite graph: %s", outputS);
//		Debug4.v().printf("json: %s", outputS);
		
		return outputS;
	}

//public static Set<Class> getDependencies(Scene scene, CallGraph callGraph, Class<?> clazz) {
//    Set<Class> dependencies = Sets.newHashSet();
//
//    SootClass sootClass = scene.getSootClass(clazz.getName());
//
//    for(SootMethod method: sootClass.getMethods())
//        if(!method.isPhantom())
//            callGraph.edgesInto(method).forEachRemaining(edge -> {
//                try {
//                    dependencies.add(Class.forName(edge.getSrc().method().getDeclaringClass().getName()));
//                } catch (ClassNotFoundException e) {
//                    log.info(String.format("Class not found: %s", edge.getSrc().method().getDeclaringClass().getName()));
//                }
//            });
//
//    return dependencies;
//}

  public void run() {
    Logger.stat("#Classes: " + Scene.v().getClasses().size() +
            ", #AppClasses: " + Scene.v().getApplicationClasses().size());
    Logger.trace("TIMECOST", "Start at " + System.currentTimeMillis());

//    final int[] numStmt = {0};
//    Scene.v().getClasses().parallelStream().forEach(new Consumer<SootClass>() {
//      @Override
//      public void accept(SootClass sootClass) {
//        if (!sootClass.isConcrete())
//          return;
//        sootClass.getMethods().parallelStream().forEach(new Consumer<SootMethod>() {
//          @Override
//          public void accept(SootMethod sootMethod) {
//            if (!sootMethod.isConcrete())
//              return;
//            Body b = sootMethod.retrieveActiveBody();
//            Stream<Unit> stmtStream = b.getUnits().parallelStream();
//            stmtStream.forEach(new Consumer<Unit>() {
//              @Override
//              public void accept(Unit unit) {
//                Stmt currentStmt = (Stmt) unit;
//                numStmt[0] += 1;
//              }
//            });
//          }
//        });
//      }
//    });

//    Logger.stat("#Stmt: " + numStmt[0] + " (not correct)");
    
//    Debug2.v().printf("classes: %s", sb.toString());
    
    List<ClassUnit> allClassUnits = new ArrayList<ClassUnit>();
    
//    StringBuilder sb = new StringBuilder();
    for (SootClass c : Scene.v().getClasses()) {
//    sb.append(c.getName()+"\n");
      ClassUnit classUnit = null;
//      if(c.isApplicationClass()) {
//    	  Debug2.v().printf("application class: %s\n", c.getName());
//      }
//      if(c.isPhantomClass()) {
//    	  Debug2.v().printf("phantom class: %s\n", c.getName());
//      }
//      if(Configs.isLibraryClass(c.getName())) {
//    	  Debug2.v().printf("library class: %s\n", c.getName());
//      }
      
      if (Configs.isLibraryClass(c.getName()) || Configs.isGeneratedClass(c.getName()) || c.isPhantomClass()) {
//        if ((!c.isPhantomClass()) && c.isApplicationClass()) {
//          c.setLibraryClass();
//        }
    	 c.setLibraryClass();
    	 classUnit = new ClassUnit(c, false);
      }
      else {
    	 c.setApplicationClass();
    	 classUnit = new ClassUnit(c, true);
      }
      
      allClassUnits.add(classUnit);
    }
    

    List<CompositeClassUnit> compositeClassUnits = new ArrayList<CompositeClassUnit>();
    
    Map<String, ClassUnit> classUnitByUUID = new HashMap<String, ClassUnit>();
    Map<String, ClassUnit> classUnitByName = new HashMap<String, ClassUnit>();
    
    Map<String, CompositeClassUnit> compositeClassUnitByUUID = new HashMap<String, CompositeClassUnit>();
    Map<String, CompositeClassUnit> compositeClassUnitByName = new HashMap<String, CompositeClassUnit>();
    Map<String, String> classUnitToCompositeClassDic = new HashMap<String, String>();
    
//    List<ClassUnit> toIterate = new ArrayList<ClassUnit>(classUnits);
    List<ClassUnit> classUnits = new ArrayList<ClassUnit>();
    for(ClassUnit classUnit : allClassUnits) {
//    	ClassUnit classUnit = toIterate.remove(0);
    	if(!classUnit.isWithinBoundary) {
    		continue;
    	}

		System.out.println(classUnit.getName());
		
		String className = classUnit.getName();
		String compositeClassUnitName = getComponentName(className);
		
		CompositeClassUnit targetCompositeClassUnit = compositeClassUnitByName.get(compositeClassUnitName);
		if(targetCompositeClassUnit == null) {
			targetCompositeClassUnit = new CompositeClassUnit(compositeClassUnitName);
			compositeClassUnitByName.put(compositeClassUnitName, targetCompositeClassUnit);
			compositeClassUnitByUUID.put(targetCompositeClassUnit.uuid, targetCompositeClassUnit);
		}
		targetCompositeClassUnit.add(classUnit);
		
		
		classUnitToCompositeClassDic.put(classUnit.uuid, targetCompositeClassUnit.uuid);
		
		
//    	CompositeClassUnit mergedCompositeClassUnit = null;
//    	for(String className: classUnitByName.keySet()) { //find and merge composite class units
//    		System.out.println(className);
//    		if(className.startsWith(classUnit.getName()) || classUnit.getName().startsWith(className)) {
//    			ClassUnit targetClassUnit = classUnitByName.get(className);
//    			String targetCompositeClassUnitUUID = classUnitToCompositeClassDic.get(targetClassUnit.uuid);
//    			System.out.println(targetCompositeClassUnitUUID);
//    			CompositeClassUnit targetCompositeClassUnit = compositeClassUnitByUUID.get(targetCompositeClassUnitUUID);
////    			if(targetCompositeClassUnit == null) {
////    				continue;
////    			}
//    			targetCompositeClassUnit.add(classUnit);
//    			targetCompositeClassUnit.name = className.length() > classUnit.getName().length() ? classUnit.getName() : className;
//    			if(mergedCompositeClassUnit != null) {
//    				mergedCompositeClassUnit.addAll(targetCompositeClassUnit);
//        			compositeClassUnitByUUID.remove(targetCompositeClassUnit.uuid);
//        			for(ClassUnit s : targetCompositeClassUnit) {
//            		classUnitToCompositeClassDic.put(s.uuid, mergedCompositeClassUnit.uuid);
//        			}
//        			mergedCompositeClassUnit.name = mergedCompositeClassUnit.name.length() > targetCompositeClassUnit.name.length() ?  targetCompositeClassUnit.name : mergedCompositeClassUnit.name;
//    			} else {
//        			 mergedCompositeClassUnit = targetCompositeClassUnit;
//        			}
//    		}
//    	}
//    	
//    	if(mergedCompositeClassUnit == null) { //create new composite class
//    		mergedCompositeClassUnit = new CompositeClassUnit(classUnit);
//    		compositeClassUnitByUUID.put(mergedCompositeClassUnit.uuid, mergedCompositeClassUnit);
//    		classUnitToCompositeClassDic.put(classUnit.uuid, mergedCompositeClassUnit.uuid);
//    	}
    	

        classUnitByName.put(classUnit.getName(), classUnit);
        classUnitByUUID.put(classUnit.uuid, classUnit);
    	classUnits.add(classUnit);
    	
//    	String compositeClassUnitUUID = classUnitToCompositeClassDic.get(classUnit.uuid);
//
//    	CompositeClassUnit compositeClassUnit = null;
//    	
//    	if(compositeClassUnitUUID == null) {
//    		compositeClassUnit = new CompositeClassUnit(classUnit);
//    		compositeClassUnitByUUID.put(compositeClassUnit.uuid, compositeClassUnit);
//    		classUnitToCompositeClassDic.put(classUnit.uuid, compositeClassUnit.uuid);
//    	}
//    	else {
//    		compositeClassUnit = compositeClassUnitByUUID.get(compositeClassUnitUUID);
//    	}
//    	
//    	System.out.println(classUnit.getName());
//    	
//    	if(classUnit.isInterface()) {
//    		continue;
//    	}	
    	
//    	List<SootClass> subClasses = Scene.v().getActiveHierarchy().getSubclassesOf(classUnit.attachment);
//    	for(SootClass subClass : subClasses) {
//    		System.out.println(subClass.getName());
//    		ClassUnit subClassUnit = classUnitByName.get(subClass.getName());
//    		String subCompositeClassUnituuid = classUnitToCompositeClassDic.get(subClassUnit.uuid);
////    		CompositeClassUnit subCompositeClassUnit = classUnitToCompositeClassDic.get(classUnit);
//    		if(subCompositeClassUnituuid == null) {
//    			compositeClassUnit.add(subClassUnit);
//    		}
//    		else {
//    			CompositeClassUnit subCompositeClassUnit = compositeClassUnitByUUID.get(subCompositeClassUnituuid);
//    			if(subCompositeClassUnit == null) {
//    				continue;
//    			}
//    			compositeClassUnit.addAll(subCompositeClassUnit);
//    			compositeClassUnitByUUID.remove(subCompositeClassUnit.uuid);
//    			
//    			for(ClassUnit s : subCompositeClassUnit) {
//        		classUnitToCompositeClassDic.put(s.uuid, compositeClassUnit.uuid);
//    			}
//    		}
//    	}
    }
    
    String outputS = "{";
    outputS += "classUnits:[";
	
  	for(int i = 0; i < classUnits.size(); i++) {
  		ClassUnit CU = classUnits.get(i);
  		outputS += CU.toJSONString();
  		if(i != classUnits.size() -1) {
  		outputS += ",";
  		}
  	}
  	
    
	outputS += "]";
	outputS += ", compositeClassunits:[";
    
	int i = 0;
	for(String uuid: compositeClassUnitByUUID.keySet()) {
		CompositeClassUnit compCU = compositeClassUnitByUUID.get(uuid);
//		outputS += compCU.uuid;
		outputS += compCU.toJSONString();
		if(i != compositeClassUnitByUUID.keySet().size()-1) {
		outputS += ",";
		}
		i++;
	}
	outputS += "]";
    
    for(String m : classUnitToCompositeClassDic.keySet()) {
    	Debug2.v().printf("class id: %s; composite id: %s\n", m, classUnitToCompositeClassDic.get(m));
    	System.out.printf("class id: %s; composite id: %s\n", m, classUnitToCompositeClassDic.get(m));
    }
    
    //create the hierarchy of the class units for the composite class units.
    
    // Analysis
    // TODO: use reflection to allow nice little extensions.
    
//    identifyAggregateClassUnits(xmiString);
    
//	var callGraph = constructCallGraph(topClassUnits, xmiString, outputDir, referencedClassUnits, referencedClassUnitsComposite, dicMethodParameters);
//	var typeDependencyGraph = constructTypeDependencyGraph(topClassUnits, xmiString, outputDir, referencedClassUnits, referencedClassUnitsComposite, dicMethodParameters);
	outputS += ",assessGraph:"+constructAccessGraph(classUnits, compositeClassUnits, classUnitByName, classUnitByUUID, compositeClassUnitByUUID, classUnitToCompositeClassDic);
	//	var extendsGraph = constructExtendsGraph(topClassUnits, xmiString, outputDir, referencedClassUnits, referencedClassUnitsComposite, dicMethodParameters);
//	var compositionGraph = constructCompositionGraph(topClassUnits, xmiString, outputDir, referencedClassUnits, referencedClassUnitsComposite, dicMethodParameters);

	outputS += "}";
	

    Debug4.v().printf("%s", outputS);
    
//    return {
//		dicClassUnits: dicClassUnits,
//		dicMethodUnits: dicMethodUnits,
//		callGraph: callGraph,
//		dicMethodClass: dicMethodClass,
//		typeDependencyGraph: typeDependencyGraph,
//		accessGraph: accessGraph,
//		extendsGraph: extendsGraph,
//		compositionGraph: compositionGraph,
//		referencedClassUnits: referencedClassUnits,
//		referencedClassUnitsComposite: referencedClassUnitsComposite,
//		dicCompositeSubclasses: dicCompositeSubclasses,
//		dicMethodParameters: dicMethodParameters,
//	};
    
  }

private String getComponentName(String classPath) {
	int pos = classPath.lastIndexOf(".");
	String packageName = classPath.substring(0, pos);
	String className = classPath.substring(pos+1, classPath.length());
	int firstPos = -1;
	for(int i = 0; i < className.length(); i++) {
		if(className.charAt(i) == '$') {
			firstPos = i;
			break;
		}
	}
	
	if(firstPos == -1) {
		return packageName+"."+className;
	}
	else {
		return packageName+"."+className.substring(0, firstPos);
	}
}
  
//  
//  private List<String[]> constructCompositionGraph(){
//	  
//  }
//  
//  private List<String[]> constructExtendsGraph(){
//	  
//  }
//  
//  private List<String[]> constructCallGraph(){
//	  
//  }
//  
//  private List<String[]> constructTypeDependencyGraph(){
//	  
//  }
//  
//  private List<String[]> constructAccessGraph(){
//	  
//  }
  
  

  
}
