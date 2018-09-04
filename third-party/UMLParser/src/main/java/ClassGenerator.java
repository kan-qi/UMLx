import java.util.*;
import com.github.javaparser.ast.*;
import com.github.javaparser.ast.body.*;


 class ClassGenerator {
     String sourceCodePath;
     String classDiagPath;
     static ArrayList<CompilationUnit> cunits;
     static HashMap<String, Boolean> classOrIntMap;
     static HashMap<String, String> mapRelationship;
     static String astree;         
     static List<String> getterandsettermemberlist = new ArrayList<String>();

    ClassGenerator(String sourceCodePath, String classDiagPath) {
        astree = "";
        this.sourceCodePath = sourceCodePath;
        this.classDiagPath = sourceCodePath + "/" + classDiagPath + ".png";
        mapRelationship = new HashMap<String, String>();
        classOrIntMap = new HashMap<String, Boolean>();
        getterandsettermemberlist = new ArrayList<String>();
    }    
    
    //GETTERS & SETTERS
     public String getSourceCodePath() {
		return sourceCodePath;
	}

	public void setSourceCodePath(String sourceCodePath) {
		this.sourceCodePath = sourceCodePath;
	}

	public String getClassDiagPath() {
		return classDiagPath;
	}

	public void setClassDiagPath(String classDiagPath) {
		this.classDiagPath = classDiagPath;
	}

	public static ArrayList<CompilationUnit> getCunits() {
		return cunits;
	}

	public static void setCunits(ArrayList<CompilationUnit> cunits) {
		ClassGenerator.cunits = cunits;
	}

	public static HashMap<String, String> getRelationshipMap() {
		return mapRelationship;
	}

	public static void setRelationshipMap(HashMap<String, String> relationshipMap) {
		ClassGenerator.mapRelationship = relationshipMap;
	}

	public static String getAstree() {
		return astree;
	}

	public static void setAstree(String astree) {
		ClassGenerator.astree = astree;
	}

	public static List<String> getGetterandsettermemberlist() {
		return getterandsettermemberlist;
	}

	public static void setGetterandsettermemberlist(List<String> getterandsettermemberlist) {
		ClassGenerator.getterandsettermemberlist = getterandsettermemberlist;
	}

	public static void setClassOrIntMap(HashMap<String, Boolean> classOrIntMap) {
		ClassGenerator.classOrIntMap = classOrIntMap;
	}

	static Map<String, Boolean> getClassOrIntMap(){
    	return classOrIntMap;
    }
	
	//GETTERS AND SETTERS END HERE
	

	//CLASS METHODS BEGIN	
     void start() throws Exception {    	
		cunits = UtilityHelper.getCuArray(sourceCodePath);
        UtilityHelper.buildMapOfIntAndClasses(cunits);
        UtilityHelper.buildAst(cunits);
        astree += UtilityHelper.parseAdditions();
        astree = UtilityHelper.removeDups(astree);
        System.out.println(astree);	
        System.out.println("Please find the generated class diagram at below location: ");
        System.out.println(classDiagPath);
        
        UtilityHelper.generatePNG(astree, classDiagPath);
    }


     static String parser(CompilationUnit cu) {
        String result = 		new String("");
        String nameOfTheClass = 		new String("");
        String className = new String("");
        String methods = 		new String("");
        String fields = 		new String("");
        String additions = 		new String(",");

        //GET TYPE OF THE DECLARED OBJECT (CLASS OR INTERFACE)
        List<TypeDeclaration> ltd = cu.getTypes();
        Node node = ltd.get(0); //WE ASSUME HERE THAT NO NESTED CLASSES OR INTERFACES EXIST IN ANY JAVA CLASS OR INTERFACE

       // EXTRACT CLASS NAME
        ClassOrInterfaceDeclaration coi = (ClassOrInterfaceDeclaration) node;
        if (coi.isInterface()) {
            nameOfTheClass = "[" + "<<interface>>;";
        } else {
            nameOfTheClass = "[";
        }
                
        nameOfTheClass += coi.getName();
        
        className = coi.getName();
        
        boolean nextParam = false; //TO MANAGE THE SEMICOLONS IN THE GENERATED ABSTRACT SYNTAX TREE
        
        // PARSING CONSTRUCTORS
        methods +=  ClassHelper.constructorParser(node, additions,  methods, className, coi, nextParam )[0];
        additions +=  ClassHelper.constructorParser(node, additions,  methods, className, coi, nextParam )[1];
        
        //PARSING METHODS (CLASS METHODS AS WELL AS CONSTRUCTORS)
        methods += ClassHelper.methodParser(node, additions,  methods, className, coi, nextParam )[0];
        additions += ClassHelper.methodParser(node, additions,  methods, className, coi, nextParam )[1];
       
        //PARSING FIELDS
        fields+=ClassHelper.fieldParser( node, className, fields);

        // CHECK FOR EXTENDS (INHERITANCE RELATIONSHIPS)
        additions+=ClassHelper.inheritanceChecker( coi,  additions,  className);
        
        // CHECK FOR IMPLEMENTATION (POLYMORPHISM RELATIONSHIPS)
        additions+=ClassHelper.implementationChecker( coi, additions, className);
        
        // COMBINE THE CLASSNAMES, THE METOD NAMES AND THE FIELDS
        result+=ClassHelper.combiner( result,  nameOfTheClass,  additions,  fields,  methods);
        
        return result.replaceAll(",,", ",");
    }     
}
