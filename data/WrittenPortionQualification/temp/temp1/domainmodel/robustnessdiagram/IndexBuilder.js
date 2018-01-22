!INC Local Scripts.EAConstants-JScript
!INC libs.json2

/*
 * Script Name: 
 * Author: 
 * Purpose: 
 * Date: 
 */
 


function IndexBuilder(filepath){
	this.filepath = filepath;
	this.index = null;
}

IndexBuilder.prototype.getIndex = function(){
	return this.index;
}

 /*
* to add path into index with the pattern representation of the path
* 
*/

IndexBuilder.prototype.indexPath = function(pattern, onIndexedFunc){
if(this.index == null || !this.index.hasOwnProperty("label") || this.index.label != "[root]"){
	this.index = {
		label: "[root]",
		childElements: new Array()
	};
}
		var currentNode = this.index;
		for(var i=0; i< pattern.length; i++){
			var elementType = pattern[i];
			if(!currentNode.hasOwnProperty("childElements") || currentNode.childElements == null){
				currentNode.childElements = new Array();
			}
			var childElements = currentNode.childElements;
			var matchedChildElement = null;
			for (var m=0; m < childElements.length; m++){
				var childElement = childElements[m];
				if(childElement.label == elementType){
					matchedChildElement = childElement;
				}
			}
			if(matchedChildElement == null){
				matchedChildElement = {
					label: elementType
				};
				childElements.push(matchedChildElement);
			}
			currentNode = matchedChildElement;
		}
		
		if(onIndexedFunc != null){
			onIndexedFunc(currentNode);	
		}
		
		return this.index;
}

IndexBuilder.prototype.saveIndex = function(){
	
	try{
		
		var fso = new ActiveXObject("Scripting.FileSystemObject");
		Session.Output("writing index to file");
		
		var f1;
		if(fso.FileExists(this.filepath)){
			fso.DeleteFile(this.filepath);
		}
		
		f1 = fso.OpenTextFile(this.filepath, 2, true);	
		var str = JSON.stringify(this.index);
		//var str = this.index.toSource();
		f1.Write(str);
		f1.Close();
	}
	catch(err){
		Session.Output(err.message);
	}
	
}

IndexBuilder.prototype.loadIndex = function(){
	try{
		
		var fso = new ActiveXObject("Scripting.FileSystemObject");
		Session.Output("reading index from file");
		if(!fso.FileExists(this.filepath)){
			return null;
		}
		else{
			var f1 = fso.OpenTextFile(this.filepath, 1);
			var text = f1.ReadAll();
			this.index = JSON.parse(text);
			var index = this.index;
			f1.close();
		}
		
		
	} catch(err){
		Session.Output(err.message);
	}
	
	return this.index;
	
}
 
function main()
{
	// TODO: Enter script code here!
}

//main();