package org.umlx.utils;

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

import target.RepoBrowser;

public class FileManagerUtil {
    String outputDirPath = ".";

    public FileManagerUtil(String outputDirPath) {
        this.outputDirPath = outputDirPath;

        File outputDir = new File(this.outputDirPath);
        if(!outputDir.exists()){
            outputDir.mkdirs();
        }
    }

    public void findFiles(String targetPath, String regE, boolean recursive) throws IOException{
        ArrayList<String>  targetPaths = new ArrayList<String>();
        targetPaths.add(targetPath);
        this.findFiles(targetPaths);
    }

    public void findFilesCMD(List<String> targetPaths, String regE, boolean recursive) {
        try {
//			Desktop.getDesktop().open(new File(filePath));
            for(String targetPath : targetPaths){
                String command = "cmd.exe /c dir \""+targetPath+"\""+" /B /S >> \""+outputDirPath+"\\"+getRepoDirNameByPath(targetPath)+"\\"+"filelist.txt"+"\"";
                Process p = Runtime.getRuntime().exec(command);
                System.out.println(command);
                BufferedReader input = new BufferedReader(new InputStreamReader(p.getInputStream()));
                String line = "";
                while ((line = input.readLine()) != null) {
                    System.out.println((line));
                }
                input.close();
            }
        } catch (IOException e1) {
            e1.printStackTrace();
        }
    }

    public Map<String, String> findFiles(List<String> targetPaths, String regE, boolean recursive) throws IOException{
        //System.out.println("Hello");
        Map<String, String> fileLists = new HashMap<String, String>();
        for(String targetPath : targetPaths){
            filePathList = searchFiles(new File(targetPath), regE, recursive);
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
            String filePath = file.getAbsolutePath();
            if (file.isDirectory() && recursive) {
                System.out.println("Directory: " + filePath);
                paths.addAll(searchFiles(file, regE)); // Calls same method again.
                if(regE != null) {
                    if (fileName.matches(regE)){
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
        List<String> filePaths = searchFiles("./apk-materials", "^layout", true);
        for(String filePath : filePaths){
            System.out.println(filePath);
        }
    }
}
