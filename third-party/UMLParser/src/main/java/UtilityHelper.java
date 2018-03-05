import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.FilenameFilter;
import java.io.IOException;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;


import com.github.javaparser.JavaParser;
import com.github.javaparser.ast.CompilationUnit;
import com.github.javaparser.ast.Node;
import com.github.javaparser.ast.body.ClassOrInterfaceDeclaration;
import com.github.javaparser.ast.body.TypeDeclaration;


public class UtilityHelper {
	
	public static String removeDups(String stringInput){
        String[] lines = stringInput.split(",");
        String[] unique = new LinkedHashSet<String>( Arrays.asList(lines)).toArray(new String[0]);
        String res = String.join(",", unique);
        return res;
	} 
	
	public static ArrayList<CompilationUnit> getCuArray(String in) throws Exception {        
        ArrayList<CompilationUnit> cunits = new ArrayList<CompilationUnit>();
        File folder = new File(in);
				
        for ( File f : listOfJavaFiles(folder)) {
            if (f.isFile() && f.getName().endsWith(".java")) {
                FileInputStream streamin = new FileInputStream(f);
                CompilationUnit cUnit;
                try {
                    cUnit = JavaParser.parse(streamin);
                    cunits.add(cUnit);
                } finally {
                    streamin.close();
                }
            }
        }
        return cunits;
    }
	
	public static void buildMapOfIntAndClasses(ArrayList<CompilationUnit> cunits) {
        for (CompilationUnit cu : cunits) {
            List<TypeDeclaration> cl = cu.getTypes();
            for (Node node : cl) {
                ClassOrInterfaceDeclaration coi = (ClassOrInterfaceDeclaration) node;
                ClassGenerator.getClassOrIntMap().put(coi.getName(), coi.isInterface()); // false is class, true is interface                                     
            }
        }
	}
	
	public static File[] listOfJavaFiles(File folder){
		File[] listOfFiles = folder.listFiles(new FilenameFilter() {
			public boolean accept(File dir, String name) {
		    	return name.toLowerCase().endsWith(".java");		        
			}
		});
		
		return listOfFiles;
	}
	
	public static void buildAst(ArrayList<CompilationUnit> cunits){
        for (CompilationUnit cu : cunits) { 
        	ClassGenerator.astree += ClassGenerator.parser(cu); 
        }
	}
	
    public static String bracketChangeMethod(String bracket) {
        bracket = bracket.replace("[", "(");
        bracket = bracket.replace("]", ")");
        bracket = bracket.replace("<", "(");
        bracket = bracket.replace(">", ")");
        return bracket;
    }

    public static String modifyScope(String stringScope) {
       if (stringScope.equals("private"))
    	   return "-";
       else if (stringScope.equals("public"))
    	   return "+";
       else
    	   return "";
    }
	
    public static String parseAdditions() {
        String finalRes = "";
        Set<String> keys = ClassGenerator.mapRelationship.keySet(); // get all keys
        for (String key : keys) {
            String[] classes = key.split("-");
            if (ClassGenerator.classOrIntMap.get(classes[0]))
                finalRes = finalRes + "[<<interface>>;" + classes[0] + "]";
            else
                finalRes = finalRes + "[" + classes[0] + "]";
            finalRes = finalRes + ClassGenerator.mapRelationship.get(key); // Add connection
            if (ClassGenerator.classOrIntMap.get(classes[1]))
                finalRes = finalRes + "[<<interface>>;" + classes[1] + "]";
            else
                finalRes  = finalRes + "[" + classes[1] + "]";
            finalRes += ",";
        }
        return finalRes;
    }
	

    public static void generatePNG(String grammar, String outPath) {
        try {
            String yumlURL = "https://yuml.me/diagram/plain/class/draw/" + grammar + ".png";
            URL url = new URL(yumlURL);
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("GET");
            connection.setRequestProperty("Accept", "application/json"); 
            OutputStream ostream=null;

            if (connection.getResponseCode() != 200) {
                throw new RuntimeException(
                        "Request Failed! HTTP_ERROR_CODE is : " + connection.getResponseCode());
            }
            ostream = new FileOutputStream(new File(outPath));
            int readingByte = 0;
            byte[] bytes = new byte[1024];
            while ((readingByte = connection.getInputStream().read(bytes)) != -1) {
            	//System.out.println("receiving file..." + "[ " + k++ + " ]");
                ostream.write(bytes, 0, readingByte);
            }
            //System.out.println("completed..");
            
            ostream.close();
            connection.disconnect();
        } catch (MalformedURLException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
    
    
    /*
     * import net.lingala.zip4j.core.ZipFile;
import net.lingala.zip4j.exception.ZipException;
import org.apache.commons.io.FilenameUtils;

public class Test {
    public static void main(String[] k) throws Exception {
    	    	
    	//String[] args= { "seq", "/Users/akshaymishra/Desktop/tests/uml-sequence-test.zip", "Main", "main", "out"};
    	String[] args= { "class", "/Users/akshaymishra/Desktop/tests/uml-parser-test-4.zip", "out"};
    	String extPath=null,inPath=null;    	
        boolean zipped=false;     		  
        
      	if (FilenameUtils.getExtension(args[1]).equals("zip")){
      		zipped=true;
      		extPath = args[1].substring(0, args[1].lastIndexOf("/"));
      		try {
      	        ZipFile zipFile = new ZipFile(args[1]);
      	        zipFile.extractAll(extPath);
      	    } catch (ZipException e) {
      	        e.printStackTrace();
      	    }
      		
      		inPath = extPath + args[1].substring(args[1].lastIndexOf("/"), args[1].lastIndexOf("."));	
      	}      	
      	
      	if (zipped) {
  	        if (args[0].equals("class")) {
  	            ClassGenerator cp = new ClassGenerator(inPath, args[2]);
  	            cp.start();
  	        } 
  	        else if (args[0].equals("seq")) {
  	        	SequenceGenerator sg = new SequenceGenerator(args[1].substring(0, args[1].indexOf(".")) ,args[2],args[3],args[4]);
  	        	sg.start();
  	        } else{
  	            System.out.println("Invalid keyword " + args[0]);
  	        }
      	}
      	else {
      		if (args[0].equals("class")) {
  	            ClassGenerator cp = new ClassGenerator(args[1], args[2]);
  	            cp.start();
  	        } 
  	        else if (args[0].equals("seq")) {
  	        	SequenceGenerator sg = new SequenceGenerator(args[1] ,args[2],args[3],args[4]);
  	        	sg.start();
  	        } else{
  	            System.out.println("Invalid keyword " + args[0]);
  	        }

      	}      		
    }
}

*/
}
