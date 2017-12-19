var sax = require("sax"),
  strict = true, // set to false for html-mode
  parser = sax.parser(strict);

var fs = require("fs")

var UMLCollaborations = [];
var UMLInteractions = [];
var UMLLifelines = [];
var UMLFragments = [];
var UMLOperands = [];
var UMLMessages = [];

parser.onerror = function (e) {
  // an error happened.
	console.log("onError");
	console.log(e);
};
parser.ontext = function (t) {
  // got some text.  t is the string of text.
	console.log("onText");
	console.log(t);
};
parser.onopentag = function (node) {
  // opened a tag.  node has "name" and "attributes"
	console.log("onOpenTag");
	console.log(node);
	
	if(node.name === "nestedClassifier" && node.attributes['xmi:type'] === "uml:Collection"){
		
	}
	else if(node.name === "ownedBehavior" && node.attributes['xmi:type'] === "uml:Interaction"){
		
	}
	else if(node.name === "lifeline" && node.attributes['xmi:type'] === "uml:Lifeline"){
		
	}
	else if(node.name === "fragment" && node.attributes['xmi:type'] === "uml:OccurrenceSpecification"){
		
	}
	else if(node.name === "fragment" && node.attributes['xmi:type'] === "uml:CombinedFragment"){
		
	}
	else if(node.name === "operand" && node.attributes['xmi:type'] === "uml:CombinedFragment"){
	
	}
	else if(node.name === "message" && node.attributes['xmi:type'] === "uml:CombinedFragment"){
	
	}
};

parser.onclosetag = function (node){
	console.log("onCloseTag");
	console.log(node);
}
parser.onattribute = function (attr) {
  // an attribute.  attr has "name" and "value"
	console.log("onAttribute");
	console.log(attr)
};
parser.onend = function (t) {
  // parser stream is done, and ready to have more stuff written to it.
	console.log("onEnd");
};

parser.write('<xml><hello1><hello2></hello2></hello1>Hello, <who xmi:name="world" type="hello">world</who>!</xml>').close();

// stream usage
// takes the same options as the parser
var saxStream = require("sax").createStream(strict)
saxStream.on("error", function (e) {
  // unhandled errors will throw, since this is a proper node
  // event emitter.
  console.error("error!", e)
  // clear the error
  this._parser.error = null
  this._parser.resume()
})
saxStream.on("opentag", function (node) {
  // same object as above
	console.log("onOpenTag");
	console.log(node);
})
// pipe is supported, and it's readable/writable
// same chunks coming in also go out.
//fs.createReadStream("bookTicketsExamplev1.2.xml")
//  .pipe(saxStream)
//  .pipe(fs.createWriteStream("file-copy.xml"))