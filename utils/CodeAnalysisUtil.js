(function() {
	// the data structure are assumed in the upper analysis.
	
	module.exports = {
		genMethodSign: function(method){
			
			var functionSignature = method.Name+"(";
			
//			console.log("test parameters");
//			console.log(method.Parameters);
			
			for(var j in method.Parameters){
				var parameter = method.Parameters[j];
				if(parameter.Name === 'return'){
//					functionSignature = parameter.Type + " "+functionSignature;
					functionSignature = parameter.Type + " "+functionSignature;
				}
				else {
					functionSignature = functionSignature + parameter.Type + " " + parameter.Name;
				}
			}
			functionSignature += ")";
			
			return functionSignature;
			
		},
		genMethodSignSimple: function(method){
			
			var functionSignature = method.Name+"(";
			
//			console.log("test parameters");
//			console.log(method.Parameters);
			
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
		genMethodUnitSignFull: function(methodUnit, cls, pkg){
			
			var functionSignature = pkg+"."+cls+"."+methodUnit.name+"(";
			
//			console.log("test parameters");
//			console.log(method.Parameters);
			
			functionSignature = methodUnit.returnType + " "+functionSignature;
			
			for(var i = 0; i < methodUnit.parameterTypes.length; i++){
				var parameterType = methodUnit.parameterTypes[i];
				if(i !== 0){
					functionSignature = functionSignature + ",";
				}
				functionSignature = functionSignature + parameterType;
			}
			
			functionSignature += ")";
			
			return functionSignature;
		}
	}
}())