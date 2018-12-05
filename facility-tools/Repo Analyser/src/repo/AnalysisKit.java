package repo;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.nio.charset.Charset;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import repo.component.utilities.RepoFileFinder;

public class AnalysisKit {
	public static List<Runnable> tasks = new ArrayList<Runnable>();
	public static Thread thread = null;
	public static boolean running = false;

	{
		Collections.synchronizedList(tasks);
	}
	
	public void calCloc(String fileListPath, String outputDir){
//	Desktop.getDesktop().open(new File(filePath));
//	String commandString = "C:\\Users\\flyqk\\Documents\\Research Workspace\\filelist\\tools\\cloc\\cloc-1.64.exe --list-file=\"C:\\Users\\flyqk\\Documents\\Research Workspace\\filelist\\tools\\temp\\dump_cloc.txt\" --report-file=\""+filePath.replace("/", "\\")+"\\cloc_report.txt\"";
//	String commandString = "tools\\cloc\\cloc-1.64.exe --list-file=\"tools\\temp\\dump_cloc.txt\" --report-file=\""+fileListPath.replace("/", "\\")+"\\cloc_report.txt\"";
	String clocPath = Config.projectRoot+"\\tools\\cloc\\cloc-1.64.exe";
	String commandString = "\""+clocPath+"\" --list-file=\""+fileListPath+"\" --report-file=\""+outputDir+"\\cloc_report.txt\"";
	System.out.println(commandString);
	System.out.println("start calculate cloc: "+fileListPath);
	try {
		Process proc = Runtime.getRuntime().exec(commandString);
		InputStream in = proc.getInputStream();
		byte buff[] = new byte[1024];
		int cbRead;

		    while ((cbRead = in.read(buff)) != -1) {
		        // Use the output of the process...
		    	String v = new String(buff, Charset.forName("UTF-8") );
		    	System.out.print(v);
		    }
		
		// No more output was available from the process, so...

		// Ensure that the process completes
		    proc.waitFor();

		// Then examine the process exit code
		if (proc.exitValue() == 1) {
		    // Use the exit value...
		}
		
		
	} catch (IOException e) {
		e.printStackTrace();
	}
	catch (InterruptedException e) {
	    // Handle exception that could occur when waiting
	    // for a spawned process to terminate
	}
	
	System.out.println("end of command: "+commandString);
	
	}
	
	public void calCloc(String repoRecordPath) throws Exception {
		System.out.println(repoRecordPath+"\\repositories.txt");
		
		File fin = new File(repoRecordPath+"\\repositories.txt");
		
		if(fin == null || !fin.exists()){
			throw new Exception("repo doesn't exist!");
		}
		FileInputStream fis = new FileInputStream(fin);

		//Construct BufferedReader from InputStreamReader
		BufferedReader br = new BufferedReader(new InputStreamReader(fis));
	 
		List<String> projectRecordPaths = new ArrayList<String>();
		String line = null;
		while ((line = br.readLine()) != null) {
			if(!line.startsWith("-")){
				projectRecordPaths.add(repoRecordPath+"\\"+getRepoDirNameByPath(line.replaceAll("\\s+$", "")));
			}
		}
	 
		br.close();
		
		for(String projectRecordPath : projectRecordPaths) {
//				addTask(new Runnable() {
//
//					@Override
//					public void run() {
						
						System.out.println(projectRecordPath+"\\selectedfiles.txt");
						calCloc(projectRecordPath+"\\selectedfiles.txt", projectRecordPath);
//					}
//					
//				});
		}
	}
	
	public void generateSlocReport(String repoRecordPath) throws Exception {
		System.out.println(repoRecordPath+"\\sloc_report.csv");
		
		File repoListFile = new File(repoRecordPath+"\\repositories.txt");
		
		FileInputStream fis = new FileInputStream(repoListFile);

		//Construct BufferedReader from InputStreamReader
		BufferedReader br = new BufferedReader(new InputStreamReader(fis));
	 
		Map<String, String> projectRecordPaths = new HashMap<String, String>();
		String line = null;
		while ((line = br.readLine()) != null) {
			if(!line.startsWith("-")){
				File repoDir = new File(line);
				if(!repoDir.exists()) {
					continue;
				}
				projectRecordPaths.put(repoDir.getName(), repoRecordPath+"\\"+getRepoDirNameByPath(line.replaceAll("\\s+$", "")));
			}
		}
	 
		br.close();
		
		StringBuilder reportString = new StringBuilder();
		reportString.append("projecct, files, blank, comment, code\n");
		for(String projectName : projectRecordPaths.keySet()) {
				String projectRecordPath = projectRecordPaths.get(projectName);
				System.out.println(projectRecordPath+"\\cloc_report.txt");
				//Construct BufferedReader from InputStreamReader
				File clocFile = new File(projectRecordPath+"\\cloc_report.txt");
				if(!clocFile.exists()) {
					continue;
				}

				FileInputStream clocfis = new FileInputStream(clocFile);
				BufferedReader clocbr = new BufferedReader(new InputStreamReader(clocfis));
				
				String recordLine = null;
				while ((recordLine = clocbr.readLine()) != null) {
						if(!recordLine.startsWith("SUM:")) {
							continue;
						}
						String[] records = recordLine.split("\\s+");
						reportString.append(projectName);
						for(int i = 1; i < records.length; i++) {
							reportString.append(","+records[i]);
						}
						reportString.append("\n");
				}
			 
				br.close();
		}
		
		File reportFile = new File(repoRecordPath+"\\sloc_report.csv");
		
		if(repoListFile == null || !repoListFile.exists()){
			throw new Exception("repo doesn't exist!");
		}
		
		if(reportFile.exists()) {
			reportFile.delete();
		}
		
		reportFile.createNewFile();
		
		PrintWriter writer = new PrintWriter(reportFile);
		writer.print(reportString.toString());
		writer.flush();
		writer.close();
	}
	
	private String getRepoDirNameByPath(String repoPath){
		 String repoDirName = repoPath.replaceAll("[:\\s\\\\]", "_");
			int startPoint = repoDirName.length() - 24 > 0? repoDirName.length() - 24 : 0;
			repoDirName = repoDirName.substring(startPoint, repoDirName.length());
			return repoDirName;
	}
	
//	public static void calCloc(String fileListPath, String outputDir){
////		Desktop.getDesktop().open(new File(filePath));
////		String commandString = "C:\\Users\\flyqk\\Documents\\Research Workspace\\filelist\\tools\\cloc\\cloc-1.64.exe --list-file=\"C:\\Users\\flyqk\\Documents\\Research Workspace\\filelist\\tools\\temp\\dump_cloc.txt\" --report-file=\""+filePath.replace("/", "\\")+"\\cloc_report.txt\"";
////		String commandString = "tools\\cloc\\cloc-1.64.exe --list-file=\"tools\\temp\\dump_cloc.txt\" --report-file=\""+fileListPath.replace("/", "\\")+"\\cloc_report.txt\"";
//		String commandString = "tools\\cloc\\cloc-1.64.exe --list-file=\""+fileListPath.replace("/", "\\")+"\" --report-file=\""+outputDir.replace("/", "\\")+"\\cloc_report.txt\"";
//		addTask(new Runnable(){
//
//			@Override
//			public void run() {
//				try {
//					System.out.println("start calculate cloc: "+fileListPath);
//					Runtime.getRuntime().exec(commandString);
//					System.out.println("end of command: "+commandString);
//				} catch (IOException e) {
//					e.printStackTrace();
//				}
//			}
//		});
//	}
	
	private void addTask(Runnable task){
		tasks.add(task);
		if(thread == null || !running){
			thread = new Thread(new Runnable(){

				@Override
				public void run() {
					running = true;
					while(!tasks.isEmpty()){
						Runnable task = tasks.remove(0);
						task.run();
					}
					running = false;
				}
				
			});
			thread.start();
		}
	}
	
	public static void main(String[] args) {
		if(args.length < 1) {
			System.out.print("please input command and its arguments");
			return;
		}
		
		String command = args[0];
		
		if(command.equals("analyse-sloc")) {
			String repoRecordPath = args[1];
			AnalysisKit analysisKit = new AnalysisKit();
			try {
				analysisKit.calCloc(repoRecordPath);
			} catch (Exception e) {
				e.printStackTrace();
			}
		}
		else if(command.equals("cloc")) {
			String filePath = args[1];
			String outputDir = args[2];
			AnalysisKit analysisKit = new AnalysisKit();
			try {
				analysisKit.calCloc(filePath, outputDir);
			} catch (Exception e) {
				e.printStackTrace();
			}
		}
		else if(command.equals("scan-repo")) {
			String projectListPath = args[1];
			String outputDir = args[2];
			try {
				RepoFileFinder fileFinder = new RepoFileFinder(outputDir);
				File fin = new File(projectListPath);
				fileFinder.searchRepositoryFiles(fin);
			   } catch (Exception e) {
				e.printStackTrace();
			}
		}
		else if(command.equals("select-files")) {
//			final String fileListPath = "./tools/temp/repositories.txt";
			
			String repoRecordPath = args[1];
			System.out.println(repoRecordPath);
			
	        javax.swing.SwingUtilities.invokeLater(new Runnable() {
	            public void run() {
	                new RepoBrowser(repoRecordPath).setVisible(true);
	            }
	        });
		}
		else if(command.equals("generate-report")) {
//			final String fileListPath = "./tools/temp/repositories.txt";
			
			String repoRecordPath = args[1];
			AnalysisKit analysisKit = new AnalysisKit();
			try {
				analysisKit.generateSlocReport(repoRecordPath);
			} catch (Exception e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		}
		else {
			System.out.println("invalid command");
		}
	}
}
