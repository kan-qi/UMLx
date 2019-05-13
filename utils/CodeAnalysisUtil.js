(function() {
	// the data structure are assumed in the upper analysis.
	
	module.exports = {
		genMethodSign: function(method){

			var functionSignature = method.signature.name+"(";

			for(var j in method.Parameters){
				var parameter = method.Parameters[j];
				if(parameter.Name === 'return'){
					functionSignature = parameter.Type + " "+functionSignature;
				}
				else {
					functionSignature = functionSignature + parameter.Type + " " + parameter.Name;
				}
			}
			functionSignature += ")";
			
			return functionSignature;
			
		},
		genAttrSign: function(attr){
			
			return attr.Type+":"+attr.Name;
			
		},
		genMethodSignSimple: function(method){
			
			var functionSignature = method.signature.name+"(";
			
			for(var j in method.Parameters){
				var parameter = method.Parameters[j];
				if(parameter.Name === 'return'){
					functionSignature = parameter.Type + " "+functionSignature;
//					functionSignature = parameter.Type.substring(7).replace("__", "[]") + " "+functionSignature;
				}
				else {
//					functionSignature = functionSignature + parameter.Type.substring(7).replace("__", "[]") + " " + parameter.Name;
				}
			}
			functionSignature += ")";
			
			return functionSignature;
		},
		
		genMethodSignType: function(method){
			
			var functionSignature = method.signature.name+"(";
			
			if(method.returnType){
				functionSignature = method.returnType + " " + functionSignature;
			}
			
			console.log(method);
			
			for(var i = 0; i < method.signature.parameterUnits.length; i++){
					var parameterUnit = method.signature.parameterUnits[i];
					if(i != 0){
						functionSignature += ",";
					}
					functionSignature = functionSignature + parameterUnit.type
//					functionSignature = functionSignature + parameter.Type.substring(7).replace("__", "[]") + " " + parameter.Name;
			}
			functionSignature += ")";
			
			return functionSignature;
		},
		
		genMethodUnitSignFull: function(methodUnit, cls, pkg){
			
			var functionSignature = pkg+"."+cls+"."+methodUnit.signature.name+"(";
			
			functionSignature = methodUnit.returnType + " "+functionSignature;
			
			for(var i = 0; i < methodUnit.signature.parameterUnits.length; i++){
				var parameterUnit = methodUnit.signature.parameterUnits[i];
				if(i !== 0){
					functionSignature = functionSignature + ",";
				}
				functionSignature = functionSignature + parameterUnit.type;
			}
			
			functionSignature += ")";
			
			return functionSignature;
		}
	}
}())