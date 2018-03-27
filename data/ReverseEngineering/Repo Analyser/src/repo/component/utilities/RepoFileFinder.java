package repo.component.utilities;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.List;

import repo.RepoBrowser;

public class RepoFileFinder {
	String outputFileName = "fileList.txt";
	String repositoryFileName = "repositories.txt";
	PrintWriter writer = null;
//	List<String> repoPaths = new ArrayList<String>();
	
	public void searchRepositoryFiles(File fin) throws Exception{
		if(fin == null || !fin.exists()){
			throw new Exception("repo doesn't exist!");
		}
		FileInputStream fis = new FileInputStream(fin);
		
		File tempDir = new File(RepoBrowser.projectTempPath);
		if(!tempDir.exists()){
			tempDir.mkdirs();
		}

		String tempRepoPath = RepoBrowser.projectTempPath+"\\"+repositoryFileName;

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
		
		File repositoriesFile = new File(tempRepoPath);
		if(repositoriesFile.exists()){
			repositoriesFile.delete();
			repositoriesFile.createNewFile();
		}
		PrintWriter writer = new PrintWriter(repositoriesFile);
		for(String repo : repoPaths){
			writer.println(repo);
		}
		writer.close();
		
		this.findFiles(repoPaths);
//		this.findFilesCMD(repoPaths);
	}


	public static void main(String... args) {
	   String repoPath = RepoBrowser.projectRepoPath;
//	   String repoPath = "F:\\research\\Experiment projects\\Repo Analyser\\tools\\Repos\\repo_577_storage.txt";
//	   String repoPath = "Z:\\Documents\\Research Space\\Experiment projects\\Repo Analyser\\tools\\Repos\\repo_577_mac_windows.txt";
	   try {
		RepoFileFinder fileFinder = new RepoFileFinder();
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
			String command = "cmd.exe /c dir \""+repoPath+"\""+" /B /S >> \""+RepoBrowser.projectPath+"\\"+getRepoDirNameByPath(repoPath)+"\\"+"filelist.txt"+"\"";
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

	public void findFiles(List<String> repoPaths) throws IOException{
		for(String repoPath : repoPaths){
		String repoDirName = this.getRepoDirNameByPath(repoPath);
		File repoDir = new File(RepoBrowser.projectPath+"\\"+repoDirName);
		if(!repoDir.exists() || ! repoDir.isDirectory() ){
			repoDir.mkdir();
		}
		File outputFile = new File(repoDir.getAbsolutePath()+"\\"+outputFileName);
		if(outputFile.exists()){
			outputFile.delete();
			outputFile.createNewFile();
		}
		writer = new PrintWriter(outputFile);
		searchFiles(new File(repoPath));
		writer.flush();
		writer.close();
		}
	}

	private void searchFiles(File dir) {
			writer.println(dir.getAbsolutePath());
	
		if(!dir.exists() || !dir.isDirectory()){
			return;
		}
		File[] files = dir.listFiles();
		
//    	String path = dir.getAbsolutePath();
	    for (File file : files) {
	    	String filePath = file.getAbsolutePath();
	        if (file.isDirectory()) {
	            System.out.println("Directory: " + filePath);
	            searchFiles(file); // Calls same method again.
	        } else {
	        	writer.println(filePath);
	            System.out.println("File: " + filePath);
	        }
	    }
	}
}
