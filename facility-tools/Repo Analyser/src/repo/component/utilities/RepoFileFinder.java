package repo.component.utilities;

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

import repo.RepoBrowser;

public class RepoFileFinder {
	String fileListName = "fileList.txt";
	String repositoryListFileName = "repositories.txt";
	String outputDirPath = RepoBrowser.projectPath;
//	String tempOutputDirPath = RepoBrowser.projectPath+"\\temp";
	PrintWriter writer = null;
//	List<String> repoPaths = new ArrayList<String>();
	
	public RepoFileFinder(String outputDirPath) {
		this.outputDirPath = outputDirPath;
//		this.tempOutputDirPath = outputDirPath+"\\temp";

		File outputDir = new File(this.outputDirPath);
		if(!outputDir.exists()){
			outputDir.mkdirs();
		}
		
//		File tempOutputDir = new File(this.tempOutputDirPath);
//		if(!tempOutputDir.exists()){
//			tempOutputDir.mkdirs();
//		}
	}

	public Map<String, String> searchRepositoryFiles(File fin) throws Exception{
		if(fin == null || !fin.exists()){
			throw new Exception("repo doesn't exist!");
		}
		FileInputStream fis = new FileInputStream(fin);
		
		String repositoryListFilePath = this.outputDirPath+"\\"+repositoryListFileName;

		//Construct BufferedReader from InputStreamReader
		BufferedReader br = new BufferedReader(new InputStreamReader(fis));
	 
		List<String> repoPaths = new ArrayList<String>();
		String line = null;
		while ((line = br.readLine()) != null) {
			if(!line.startsWith("-")){
				repoPaths.add(line.replaceAll("\\s+$", ""));
			}
		}
	 
		br.close();
		
		File repositoriesFile = new File(repositoryListFilePath);
		if(repositoriesFile.exists()){
			repositoriesFile.delete();
			repositoriesFile.createNewFile();
		}
		PrintWriter writer = new PrintWriter(repositoriesFile);
		for(String repo : repoPaths){
			writer.println(repo);
		}
		writer.close();
		
		return this.findFiles(repoPaths);
//		this.findFilesCMD(repoPaths);
	}


	public static void main(String... args) {
	   String repoPath = RepoBrowser.projectRepoPath;
	   String projectPath = RepoBrowser.projectPath;
//	   String repoPath = "F:\\research\\Experiment projects\\Repo Analyser\\tools\\Repos\\repo_577_storage.txt";
//	   String repoPath = "Z:\\Documents\\Research Space\\Experiment projects\\Repo Analyser\\tools\\Repos\\repo_577_mac_windows.txt";
	   try {
		RepoFileFinder fileFinder = new RepoFileFinder(projectPath);
		File fin = new File(repoPath);
		fileFinder.searchRepositoryFiles(fin);
	   } catch (Exception e) {
		e.printStackTrace();
	}
	}
	
	public void findFiles(String repoPath) throws IOException{
		ArrayList<String>  repoPaths = new ArrayList<String>();
		repoPaths.add(repoPath);
		this.findFiles(repoPaths);
	}
	
	public void findFilesCMD(List<String> repoPaths) {
		try {
//			Desktop.getDesktop().open(new File(filePath));
			for(String repoPath : repoPaths){
			String command = "cmd.exe /c dir \""+repoPath+"\""+" /B /S >> \""+outputDirPath+"\\"+getRepoDirNameByPath(repoPath)+"\\"+"filelist.txt"+"\"";
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
	
	private String getRepoDirNameByPath(String repoPath){
		 String repoDirName = repoPath.replaceAll("[:\\s\\\\]", "_");
			int startPoint = repoDirName.length() - 24 > 0? repoDirName.length() - 24 : 0;
			repoDirName = repoDirName.substring(startPoint, repoDirName.length());
			return repoDirName;
	}

	public Map<String, String> findFiles(List<String> repoPaths) throws IOException{
		Map<String, String> fileLists = new HashMap<String, String>();
		for(String repoPath : repoPaths){
		String repoDirName = this.getRepoDirNameByPath(repoPath);
		File repoDir = new File(outputDirPath+"\\"+repoDirName);
		if(!repoDir.exists() || ! repoDir.isDirectory() ){
			repoDir.mkdir();
		}
		String fileListPath = repoDir.getAbsolutePath()+"\\"+fileListName;
		File outputFile = new File(fileListPath);
		if(outputFile.exists()){
			outputFile.delete();
			outputFile.createNewFile();
		}
		writer = new PrintWriter(outputFile);
		searchFiles(new File(repoPath));
		writer.flush();
		writer.close();
		
		fileLists.put(repoPath, fileListPath);
		
		}
		
		return fileLists;
	}

	private List<String> searchFiles(File dir) {
		List<String> paths = new ArrayList<String>();
		
		writer.println(dir.getAbsolutePath());
	
		if(!dir.exists() || !dir.isDirectory()){
			return paths;
		}
		
		File[] files = dir.listFiles();
		
//    	String path = dir.getAbsolutePath();
	    for (File file : files) {
	    	String filePath = file.getAbsolutePath();
	        if (file.isDirectory()) {
	            System.out.println("Directory: " + filePath);
	            paths.addAll(searchFiles(file)); // Calls same method again.
	        } else {
	        	writer.println(filePath);
	            System.out.println("File: " + filePath);
	            paths.add(filePath);
	        }
	    }
		return paths;
	}
}
