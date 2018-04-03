(function() {
    var fs = require('fs');
    var xml2js = require('xml2js');
    var parser = new xml2js.Parser();
    var jsonQuery = require('json-query');
    var jp = require('jsonpath');

    function standardizeName(name) {
        return name.replace(/\s/g, '').toUpperCase();
    }

    function parseActivityDiagram(filepath, callbackfunc) {
        fs.readFile(filepath, function(err, data) {
            parser.parseString(data, function(err, xmiString) {
                console.log("Parsing activity diagram");
		var debug = require("../../utils/DebuggerOutput.js");
		debug.writeJson("XMIString", xmiString);
		console.log(xmiString);
		var XMIUMLModel = xmiString['xmi:XMI']['uml:Model'];
                var Model = {
                    Activities: [],
                    Edges: []
                }
                var XMIActivities = jp.query(XMIUMLModel, '$..packagedElement[?(@[\'$\'][\'xmi:type\']==\'uml:Activity\')]');
                for (var i in XMIActivities) {
                    console.log("Found an activity");
                    var XMIActivity = XMIActivities[i];
                    var XMINodes = jp.query(XMIActivity, '$..node[?(@[\'$\'][\'xmi:type\']==\'uml:CallBehaviorAction\')]');
                    for (var i in XMINodes) {
                        var XMINode = XMINodes[i];
                        var XMIActivityByStandard = {
                            _id: XMINode['$']['xmi:id'],
                            Name: XMINode['$']['name']
                        };
                        Model.Activities.push(XMIActivityByStandard);
                    }

                    var XMIEdges = jp.query(XMIActivity, '$..edge[?(@[\'$\'][\'xmi:type\']==\'uml:ControlFlow\')]');
                    for (var i in XMIEdges) {
                        var XMIEdge = XMIEdges[i];
                        var XMIEdgeByStandard = {
                            _id: XMIEdge['$']['xmi:id'],
                            Name: XMIEdge['$']['name'],
                            Type: XMIEdge['$']['type'],
                            Source: XMIEdge['$']['source'],
                            Target: XMIEdge['$']['target']
                        };
                        Model.Edges.push(XMIEdgeByStandard);
                    }
                }
                console.log("Finished parsing activity diagram");
                if (callbackfunc) {
                    callbackfunc(Model);
                }
            });
        });
    }
    module.exports = {
        parseActivityDiagram : parseActivityDiagram
    }
}());
