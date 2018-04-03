import java.util.List;

import com.github.javaparser.ast.Node;
import com.github.javaparser.ast.body.BodyDeclaration;
import com.github.javaparser.ast.body.ClassOrInterfaceDeclaration;
import com.github.javaparser.ast.body.ConstructorDeclaration;
import com.github.javaparser.ast.body.FieldDeclaration;
import com.github.javaparser.ast.body.MethodDeclaration;
import com.github.javaparser.ast.body.Parameter;
import com.github.javaparser.ast.body.TypeDeclaration;
import com.github.javaparser.ast.type.ClassOrInterfaceType;

public class ClassHelper {	
	public static String[] constructorParser(Node compilationNode, String additions, String functions, String classshortname, ClassOrInterfaceDeclaration coi, Boolean isThereAnotherParam){    
        for (BodyDeclaration bodyDeclaration : ((TypeDeclaration) compilationNode).getMembers()) {	
            // Get Methods
            if (bodyDeclaration instanceof ConstructorDeclaration) {
                ConstructorDeclaration constructorDelcaration = ((ConstructorDeclaration) bodyDeclaration);
                if (constructorDelcaration.getDeclarationAsString().startsWith("public") && !coi.isInterface()) {
                    if (isThereAnotherParam){
                    	functions =  functions + ";";
                    }                        
                    
                    functions = functions + "+ " + constructorDelcaration.getName() + "(";
                    for (Object childrenNode : constructorDelcaration.getChildrenNodes()) {
                        if (childrenNode instanceof Parameter) {
                            Parameter typeparam = (Parameter) childrenNode;
                            String classparam = typeparam.getType().toString();
                            String nameparam = typeparam.getChildrenNodes().get(0).toString();
                            functions = functions + nameparam + " : " + classparam;
                            if (ClassGenerator.classOrIntMap.containsKey(classparam) && !ClassGenerator.classOrIntMap.get(classshortname)) {
                                additions = additions + "[" + classshortname + "] uses -.->";
                                if (ClassGenerator.classOrIntMap.get(classparam)){
                                	 additions = additions + "[<<interface>>;" + classparam + "]";
                                }                                   
                                else{
                                	additions = additions + "[" + classparam + "]";
                                }                                 
                            }
                            additions = additions + ",";
                        }
                    }
                    functions = functions + ")";
                    isThereAnotherParam = true;
                }
            }
        }        
        return new String[]{functions, additions};   
	}
	
	
	public static String[] methodParser(Node node, String additions, String methods, String shortnameclass, ClassOrInterfaceDeclaration classorinterface, Boolean isThereAnotherParam){
	     
	 for (BodyDeclaration bodyDeclaration : ((TypeDeclaration) node).getMembers()) {
         if (bodyDeclaration instanceof MethodDeclaration) {
             MethodDeclaration md = ((MethodDeclaration) bodyDeclaration);
             // GET PUBLIC METHODS ONLY
             if (md.getDeclarationAsString().startsWith("public") && !classorinterface.isInterface()) {
                 // GET GETTERS AND SETTERS
                 if (md.getName().startsWith("get") || md.getName().startsWith("set")) {
                     String varName = md.getName().substring(3);
                     ClassGenerator.getterandsettermemberlist.add(varName.toLowerCase());
                 } else {
                     if (isThereAnotherParam)
                         methods = methods + ";";
                     methods = methods + "+ " + md.getName() + "(";
                     for (Object childrenNode : md.getChildrenNodes()) {
                         if (childrenNode instanceof Parameter) {
                             Parameter castparameter = (Parameter) childrenNode;
                             String classparam = castparameter.getType() .toString();
                             String nameparam = castparameter.getChildrenNodes().get(0).toString();
                             methods = methods + nameparam + " : " + classparam;
                             if (ClassGenerator.classOrIntMap.containsKey(classparam) && !ClassGenerator.classOrIntMap.get(shortnameclass)) {
                                 additions =  additions +"[" + shortnameclass + "] uses -.->";
                                 if (ClassGenerator.classOrIntMap.get(classparam))
                                 {
                                	 additions = additions + "[<<interface>>;" + classparam + "]";
                                 }
                                 else
                                 {
                                	 additions = additions + "[" + classparam + "]";
                                 }
                             }
                             additions =  additions + ",";
                         } else {
                             String methodBody[] = childrenNode.toString().split(" ");
                             for (String method : methodBody) {
                                 if (ClassGenerator.classOrIntMap.containsKey(method) && !ClassGenerator.classOrIntMap.get(shortnameclass)) {
                                     additions = additions + "[" + shortnameclass + "] uses -.->";
                                     if (ClassGenerator.classOrIntMap.get(method))
                                     {
                                    	 additions = additions + "[<<interface>>;" + method + "]";
                                     }
                                     else
                                     {
                                    	 additions = additions + "[" + method + "]";
                                     }
                                     additions = additions + ",";
                                 }
                             }
                         }
                     }
                     methods = methods + ") : " + md.getType();
                     isThereAnotherParam = true;
                 }
             }
         }
     }
	 return new String[]{methods, additions};  
	}
	public static String fieldParser(Node node, String nameshortclass, String fields){
	    // Parsing Fields
	    boolean isThereAnotheField = false;
	    for (BodyDeclaration bodyDeclaration : ((TypeDeclaration) node).getMembers()) { 
	        if (bodyDeclaration instanceof FieldDeclaration) {
	            FieldDeclaration fieldDeclaration = ((FieldDeclaration) bodyDeclaration);
	            String scopefield = UtilityHelper.modifyScope( bodyDeclaration.toStringWithoutComments().substring(0, bodyDeclaration.toStringWithoutComments().indexOf(" "))); 
	            String classField = UtilityHelper.bracketChangeMethod(fieldDeclaration.getType().toString());
	            String nameField = fieldDeclaration.getChildrenNodes().get(1).toString();
	            if (nameField.contains("="))
	                nameField = fieldDeclaration.getChildrenNodes().get(1).toString().substring(0, fieldDeclaration.getChildrenNodes().get(1).toString().indexOf("=") - 1);
	            // Change scope of getter, setters
	            if (scopefield.equals("-") && ClassGenerator.getterandsettermemberlist.contains(nameField.toLowerCase())) {
	                scopefield = "+";
	            }
	            String depend = "";
	            boolean multipleDepen = false;
	            if (classField.contains("(")) {
	                depend = classField.substring(classField.indexOf("(") + 1, classField.indexOf(")"));
	                multipleDepen = true;
	            } else if (ClassGenerator.classOrIntMap.containsKey(classField)) {
	                depend = classField;
	            }
	            if (depend.length() > 0 && ClassGenerator.classOrIntMap.containsKey(depend)) {
	                String connection = "-";
	
	                if (ClassGenerator.mapRelationship.containsKey(depend + "-" + nameshortclass)) {
	                    connection = ClassGenerator.mapRelationship.get(depend + "-" + nameshortclass);
	                    if (multipleDepen)
	                        connection = connection + "0..*";
	                    ClassGenerator.mapRelationship.put(depend + "-" + nameshortclass, connection);
	                } else {
	                    if (multipleDepen)
	                    {
	                    	connection = connection + "0..*";
	                    }
	                    ClassGenerator.mapRelationship.put(nameshortclass + "-" + depend, connection);
	                }
	            }
	            if (scopefield == "+" || scopefield == "-") {
	                if (isThereAnotheField)
	                    ;
	                //System.out.println(fieldScope + " " + fieldName + " : " + fieldClass);
	                //if (( fieldClass.contains("Collection(") && !Parser.classOrIntMap.containsKey(fieldClass.substring(fieldClass.indexOf("(")+1, fieldClass.indexOf(")")))) || Parser.classOrIntMap.containsKey(fieldClass) )
	                if ( !classField.contains("Collection(") && !ClassGenerator.classOrIntMap.containsKey(classField) )
	                {
	                	fields = fields + ";";
	                	fields = fields + scopefield + " " + nameField + " : " + classField;
	                }
	                	isThereAnotheField = true;
	            }
	        }	
	    }
	    return fields; }
	
	public static String inheritanceChecker(ClassOrInterfaceDeclaration coi, String additions, String classShortName){
	    if (coi.getExtends() != null) {
	        additions = additions + "[" + classShortName + "] " + "-^ " + coi.getExtends();
	        additions = additions + ",";
	    }
	    return additions;
	}
	
	public static String implementationChecker(ClassOrInterfaceDeclaration classOrIntDeclaration, String adding, String classShortName){		
	    if (classOrIntDeclaration.getImplements() != null) {
	        List<ClassOrInterfaceType> interfaceList = (List<ClassOrInterfaceType>) classOrIntDeclaration.getImplements();
	        for (ClassOrInterfaceType intface : interfaceList) {
	            adding = adding + "[" + classShortName + "] " + "-.-^ " + "[" + "<<interface>>;" + intface + "]";
	            adding = adding + ",";
	        }
	    }
	    return adding;
	}
	
	public static String combiner(String res, String nameOfTheClass, String additions, String fields, String methods){
	    res = res + nameOfTheClass;
	    if (!fields.isEmpty()) {
	        res = res + "|" + UtilityHelper.bracketChangeMethod(fields);
	    }
	    if (!methods.isEmpty()) {
	        res = res + "|" + UtilityHelper.bracketChangeMethod(methods);
	    }
	    res = res + "]";
	    res = res + additions;
	    
	    return res;
	}
	
}
