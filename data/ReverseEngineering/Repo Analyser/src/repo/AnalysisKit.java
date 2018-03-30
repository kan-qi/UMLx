package repo;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class AnalysisKit {
	public static List<Runnable> tasks = new ArrayList<Runnable>();
	public static Thread thread = null;
	public static boolean running = false;

	{
		Collections.synchronizedList(tasks);
	}
	
	public static void calCloc(String fileListPath, String outputDir){
//	Desktop.getDesktop().open(new File(filePath));
//	String commandString = "C:\\Users\\flyqk\\Documents\\Research Workspace\\filelist\\tools\\cloc\\cloc-1.64.exe --list-file=\"C:\\Users\\flyqk\\Documents\\Research Workspace\\filelist\\tools\\temp\\dump_cloc.txt\" --report-file=\""+filePath.replace("/", "\\")+"\\cloc_report.txt\"";
//	String commandString = "tools\\cloc\\cloc-1.64.exe --list-file=\"tools\\temp\\dump_cloc.txt\" --report-file=\""+fileListPath.replace("/", "\\")+"\\cloc_report.txt\"";
	String commandString = "tools\\cloc\\cloc-1.64.exe --list-file=\""+fileListPath+"\" --report-file=\""+outputDir+"\\cloc_report.txt\"";
	System.out.println("start calculate cloc: "+fileListPath);
	try {
		Runtime.getRuntime().exec(commandString);
	} catch (IOException e) {
		e.printStackTrace();
	}
	System.out.println("end of command: "+commandString);
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
	
	private static void addTask(Runnable task){
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
}
