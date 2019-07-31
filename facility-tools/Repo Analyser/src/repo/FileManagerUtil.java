package repo;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class FileManagerUtil {
    String outputDirPath = ".";

    public FileManagerUtil(String outputDirPath) {
        this.outputDirPath = outputDirPath;

        File outputDir = new File(this.outputDirPath);
        if(!outputDir.exists()){
            outputDir.mkdirs();
        }
    }

    public Map<String, List<String>> findFiles(String targetPath, String regE, boolean recursive) throws IOException{
        ArrayList<String>  targetPaths = new ArrayList<String>();
        targetPaths.add(targetPath);
        return this.findFiles(targetPaths, regE, recursive);
    }

    public Map<String, List<String>> findFiles(List<String> targetPaths, String regE, boolean recursive) throws IOException{
        //System.out.println("Hello");
        Map<String, List<String>> fileLists = new HashMap<String, List<String>>();
        for(String targetPath : targetPaths){
            List<String> filePathList = searchFiles(new File(targetPath), regE, recursive);
            fileLists.put(targetPath, filePathList);
        }

        return fileLists;
    }

    private List<String> searchFiles(File dir, String regE, boolean recursive) {
        List<String> paths = new ArrayList<String>();

        if(!dir.exists() || !dir.isDirectory()){
            return paths;
        }

        File[] files = dir.listFiles();

//    	String path = dir.getAbsolutePath();
        for (File file : files) {
            String fileName = file.getName();
            System.out.println("search: "+fileName);
            String filePath = file.getAbsolutePath();
            if (file.isDirectory()) {
                System.out.println("Directory: " + filePath);
                if(recursive) {
                	paths.addAll(searchFiles(file, regE, recursive)); // Calls same method again.
                }
                if(regE != null) {
                    if (fileName.matches(regE)){
                    	System.out.println("matches: "+fileName);
                        paths.add(filePath);
                    }
                }
                else{
                    paths.add(filePath);
                }
            } else if(file.isFile()){
                System.out.println("File: " + filePath);
                if(regE != null) {
                    if (fileName.matches(regE)){
                        paths.add(filePath);
                    }
                }
                else {
                    paths.add(filePath);
                }
            }
        }
        return paths;
    }

    public static void main(String[] args){
        FileManagerUtil fileUtil = new FileManagerUtil("./output");
        Map<String, List<String>> filePaths = new HashMap<String, List<String>>();
        Map<String, List<String>> xmlPaths = new HashMap<String, List<String>>();
		try {
			filePaths = fileUtil.findFiles("./apk-materials", "^layout(.*)", false);
			List<String> directList = new ArrayList<String>();
			for(String targetPath : filePaths.keySet()){
	            System.out.println(filePaths.get(targetPath));
	            directList.addAll(filePaths.get(targetPath));
	        }
			xmlPaths = fileUtil.findFiles(directList, "(.*)xml$", true);
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
        for(String targetPath : xmlPaths.keySet()){
            System.out.println(xmlPaths.get(targetPath));
        }
    }
}
