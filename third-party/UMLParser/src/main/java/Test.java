import net.lingala.zip4j.core.ZipFile;
import net.lingala.zip4j.exception.ZipException;
import org.apache.commons.io.FilenameUtils;

public class Test {
    public static void main(String[] args) throws Exception {
    	    	
    	//String[] args= { "seq", "/Users/akshaymishra/Desktop/tests/uml-sequence-test.zip", "Main", "main", "out"};
    	//String[] args= { "class", "/Users/akshaymishra/Desktop/tests/uml-parser-test-1.zip", "out"};
    	
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
      	else 
      	{
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

