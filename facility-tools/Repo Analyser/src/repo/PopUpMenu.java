package repo;

import java.awt.Component;
import java.awt.Desktop;
import java.awt.Toolkit;
import java.awt.datatransfer.Clipboard;
import java.awt.datatransfer.StringSelection;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;

import javax.swing.JMenuItem;
import javax.swing.JPopupMenu;
import javax.swing.tree.DefaultMutableTreeNode;
import javax.swing.tree.TreePath;

import repo.RepositoryTree.Path;
import repo.RepositoryTree.PathFilterCallback;
import repo.component.checkbox.CheckBoxNode;
import repo.component.utilities.RepoFileFinder;

public class PopUpMenu extends JPopupMenu {
    /**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	JMenuItem locateItem;
	JMenuItem searchFilesItem;
	JMenuItem saveItem;
    JMenuItem copyItem;
    JMenuItem sublItem;
    JMenuItem dumpItem;
    JMenuItem uccItem;
    JMenuItem clocItem;
    JMenuItem analyzeArcItem;
    JMenuItem analyzeUIItem;
    DefaultMutableTreeNode currentSelectedNode;
    TreePath treePath;
    RepositoryTree tree;

	JMenuItem openArchiveItem;
	JMenuItem checkItem;

	AnalysisKit analysisKit = new AnalysisKit();
    
    public PopUpMenu(RepositoryTree tree){
    	this.tree = tree;
    	MenuItemListener actionListener = new MenuItemListener();
        locateItem = new JMenuItem("Locate");
        locateItem.setActionCommand("Locate");
        searchFilesItem = new JMenuItem("search files");
        searchFilesItem.setActionCommand("SearchFiles");
        saveItem = new JMenuItem("Save");
        copyItem = new JMenuItem("Copy");
        copyItem.setActionCommand("Copy");
        sublItem = new JMenuItem("Open with Sublime");
        sublItem.setActionCommand("Sublime");
        uccItem = new JMenuItem("UCC");
        uccItem.setActionCommand("UCC");
        clocItem = new JMenuItem("Cloc");
        clocItem = new JMenuItem("Cloc");
        dumpItem = new JMenuItem("Dump file list");
        dumpItem.setActionCommand("Dump");

        analyzeArcItem = new JMenuItem("Analyze architecture");
        analyzeArcItem.setActionCommand("AnalyzeArc");
        
        analyzeUIItem = new JMenuItem("Analyze UI");
        analyzeUIItem.setActionCommand("AnalyzeUI");

		openArchiveItem = new JMenuItem("Open Archive");
		openArchiveItem.setActionCommand("OpenArchive");
		
		checkItem = new JMenuItem("Check/Uncheck Subtree");
		checkItem.setActionCommand("CheckUncheckSubtree");
		
        add(locateItem);
        add(searchFilesItem);
        add(saveItem);
        add(copyItem);
        add(sublItem);
        add(uccItem);
        add(clocItem);
        add(dumpItem);
		add(openArchiveItem);
		add(checkItem);
		add(analyzeArcItem);
		add(analyzeUIItem);
        locateItem.addActionListener(actionListener);
        searchFilesItem.addActionListener(actionListener);
        copyItem.addActionListener(actionListener);
        sublItem.addActionListener(actionListener);
        clocItem.addActionListener(actionListener);
        uccItem.addActionListener(actionListener);
        dumpItem.addActionListener(actionListener);
        saveItem.addActionListener(actionListener);
        openArchiveItem.addActionListener(actionListener);
        checkItem.addActionListener(actionListener);
        analyzeArcItem.addActionListener(actionListener);
        analyzeUIItem.addActionListener(actionListener);
        
    }
	public void show(Component component, int x, int y, DefaultMutableTreeNode selectedNode, TreePath pathForLocation) {
		currentSelectedNode = selectedNode;
		treePath = pathForLocation;
		super.show(component, x, y);
	}
	
	 class MenuItemListener implements ActionListener {
		    public void actionPerformed(ActionEvent e) {     
		    	if(treePath.getPathCount()<2){
	    			return;
	    		}
	    		String filePath = treePath.getPathComponent(1).toString();
	    		for(int i = 2; i<treePath.getPathCount(); i++){
	    		filePath += "\\"+treePath.getPathComponent(i).toString();
	    		}
//		       statusLabel.setText(e.getActionCommand()  + " MenuItem clicked.");

	    		String repoArchivePath = RepoBrowser.projectPath+"\\"+tree.getNodeFileName(tree.getRepoNode(currentSelectedNode));
		    	if(e.getActionCommand().equals("Locate")){
		    		
//		    		String path = filePath.substring(0,filePath.lastIndexOf("/"));
					try {
//						Desktop.getDesktop().open(new File(filePath));
						Runtime.getRuntime().exec("explorer.exe /select," + filePath);
						System.out.println(filePath);
					} catch (IOException e1) {
						e1.printStackTrace();
					}
		    	}
		    	else if(e.getActionCommand().equals("Copy")) {
		    		StringSelection stringSelection = new StringSelection(filePath);
		    		Clipboard clpbrd = Toolkit.getDefaultToolkit().getSystemClipboard();
		    		clpbrd.setContents(stringSelection, null);
		    	}
		    	else if(e.getActionCommand().equals("Sublime")) {
		    		try {
//						Desktop.getDesktop().open(new File(filePath));
						Runtime.getRuntime().exec("subl \"" + filePath+"\"");
						System.out.println(filePath);
					} catch (IOException e1) {
						e1.printStackTrace();
					}
		    	}
//		    	$ucc -i1 "$d/filelist.txt" -outdir "$resultDir/$d"
//		    	$cloc --list-file="$d/filelist.txt" --report-file="$resultDir/$d/clocmetrics.csv" 
		    	else if(e.getActionCommand().equals("UCC")){
		    		tree.dumpSelectedPaths(RepoBrowser.projectTempPath+"\\dump_ucc.txt", currentSelectedNode);
//		    		String outputDir = "\""+filePath.replace("/", "\\")+"\\ucc_result\"";
		    		String outputDir = "\""+RepoBrowser.projectTempPath+"\\ucc_result\"";
		    		File outputDirFile = new File(outputDir);
		    		if(!outputDirFile.exists()){
		    			outputDirFile.mkdir();
		    		}
		    		String commandString = "tools\\ucc_bin\\UCC.exe -i1 \"tools\\temp\\dump_ucc.txt\" -outdir "+outputDir;
		    		new Thread(new Runnable(){

						@Override
						public void run() {
		    		try {
		    			Runtime.getRuntime().exec(commandString);
//						Desktop.getDesktop().open(new File(filePath));
						System.out.println(commandString);
					} catch (IOException e1) {
						e1.printStackTrace();
					}
						}
	    			}).start();
		    	}
		    	else if(e.getActionCommand().equals("Cloc")){
		    		System.out.println("Cloc by popup menu");
		    		String clocDumpFile = RepoBrowser.projectTempPath+"\\dump_cloc_"+tree.getNodeFileName(currentSelectedNode)+".txt";
					
		    		tree.dumpSelectedPaths(clocDumpFile, currentSelectedNode);
		    		analysisKit.calCloc(clocDumpFile, filePath);
//		    		Path currentRelativePath = Paths.get("");
//		    		String s = currentRelativePath.toAbsolutePath().toString();
//		    		System.out.println("Current relative path is: " + s);
		    		
		    	}
		    	else if(e.getActionCommand().equals("Dump")){
		    		tree.dumpSelectedPaths(RepoBrowser.projectTempPath+"\\dump_"+tree.getNodeFileName(currentSelectedNode)+".txt", currentSelectedNode);
		    		System.out.println(RepoBrowser.projectTempPath+"\\dump_"+tree.getNodeFileName(currentSelectedNode)+".txt");
		    	}
		    	else if(e.getActionCommand().equals("SearchFiles")){
		    		RepoFileFinder fileFinder = new RepoFileFinder(RepoBrowser.projectPath);
		    		try {
						fileFinder.findFiles(filePath);
					} catch (IOException e1) {
						e1.printStackTrace();
					}
		    	}
		    	else if(e.getActionCommand().equals("Save")){
		    		if(tree.isRepoNode(currentSelectedNode)){
		    			tree.saveRepo((CheckBoxNode)currentSelectedNode);
		    		}
		    	}
		    	else if(e.getActionCommand().equals("OpenArchive")){
					try {
//						Desktop.getDesktop().open(new File(filePath));
						Runtime.getRuntime().exec("explorer.exe /select," + repoArchivePath);
						System.out.println(repoArchivePath);
					} catch (IOException e1) {
						e1.printStackTrace();
					}
					
		    	}
		    	else if(e.getActionCommand().equals("CheckUncheckSubtree")){
		    		tree.checkUncheckNode((CheckBoxNode) currentSelectedNode);
		    	}
		    	else if(e.getActionCommand().equals("AnalyzeArc")){
		    		if(tree.isRepoNode(currentSelectedNode)){
		    		try {
//						Desktop.getDesktop().open(new File(filePath));
		    			File outputFolder = new File(repoArchivePath+"\\umlAnalysisResult");
		    			if(!outputFolder.exists()){
		    				outputFolder.mkdir();
		    			}
		    			String command = "node \"C:\\Users\\Kan Qi\\OneDrive\\ResearchSpace\\Research Projects\\UMLx\\Main.js\" " + "\""+repoArchivePath+"\\umldump.xml\" \""+outputFolder.getAbsolutePath()+"\"";
						Process p = Runtime.getRuntime().exec(command);
						BufferedReader input = new BufferedReader(new InputStreamReader(p.getInputStream()));
						String line = "";
						  while ((line = input.readLine()) != null) {
						    System.out.println(line);
						  }
						  input.close();
						System.out.println(repoArchivePath);
						System.out.println(command);

						p.waitFor();
						
						String command2 = "\"C:\\Program Files\\R\\R-3.3.2\\bin\\Rscript\" .\\tools\\Rscript\\UMLAnalysisScript.R \""+ repoArchivePath +"\"";
						
						Process p2 = Runtime.getRuntime().exec(command2);
						BufferedReader input2 = new BufferedReader(new InputStreamReader(p2.getInputStream()));
						String line2 = "";
						  while ((line2 = input2.readLine()) != null) {
						    System.out.println(line2);
						  }
						  input2.close();
						System.out.println(command2);
						p2.waitFor();
						
						Desktop.getDesktop().open(new File(repoArchivePath+"\\uml_analysis_result.pdf"));
						
					} catch (IOException | InterruptedException e1) {
						e1.printStackTrace();
					}
		    		}
		    	}
		    	else if(e.getActionCommand().equals("AnalyzeUI")){
		    		String fileListPath = repoArchivePath+"\\dump_web_analysis_file_list.txt";
		    		tree.dumpPaths(fileListPath, currentSelectedNode, false, new PathFilterCallback(){

						@Override
						public boolean onPathFilter(Path path) {
							if(path.path.endsWith(".html")){
								return true;
							}
							return false;
						}
		    			
		    		});
		    		
		    		String resultFilePath = repoArchivePath+"\\web_analysis_result.csv";
//		    			String command = "java -cp \"C:\\Users\\Kan Qi\\OneDrive\\ResearchSpace\\Research Projects\\webAnalyzer\\bin\""
//		    					+ " \"C:\\Users\\Kan Qi\\OneDrive\\ResearchSpace\\Research Projects\\webAnalyzer\\sdks\\3.0.1\\selenium-java-3.0.1\""
//		    					+ " \"C:\\Users\\Kan Qi\\OneDrive\\ResearchSpace\\Research Projects\\webAnalyzer\\sdks\\3.0.1\\selenium-java-3.0.1\\lib\""
//		    					+ " com.webanalyzer.HtmlUIElementExtractor \""+fileListPath+"\" \""+resultFilePath+"\"";
//						
					String command = "cmd /c java -classpath \"C:\\Users\\Kan Qi\\OneDrive\\ResearchSpace\\Research Projects\\webAnalyzer\\bin;C:\\Users\\Kan Qi\\OneDrive\\ResearchSpace\\Research Projects\\webAnalyzer\\sdks\\3.0.1\\selenium-java-3.0.1\\lib\\cglib-nodep-3.2.4.jar;C:\\Users\\Kan Qi\\OneDrive\\ResearchSpace\\Research Projects\\webAnalyzer\\sdks\\3.0.1\\selenium-java-3.0.1\\lib\\commons-codec-1.10.jar;C:\\Users\\Kan Qi\\OneDrive\\ResearchSpace\\Research Projects\\webAnalyzer\\sdks\\3.0.1\\selenium-java-3.0.1\\lib\\commons-exec-1.3.jar;C:\\Users\\Kan Qi\\OneDrive\\ResearchSpace\\Research Projects\\webAnalyzer\\sdks\\3.0.1\\selenium-java-3.0.1\\lib\\commons-io-2.5.jar;C:\\Users\\Kan Qi\\OneDrive\\ResearchSpace\\Research Projects\\webAnalyzer\\sdks\\3.0.1\\selenium-java-3.0.1\\lib\\commons-lang3-3.4.jar;C:\\Users\\Kan Qi\\OneDrive\\ResearchSpace\\Research Projects\\webAnalyzer\\sdks\\3.0.1\\selenium-java-3.0.1\\lib\\commons-logging-1.2.jar;C:\\Users\\Kan Qi\\OneDrive\\ResearchSpace\\Research Projects\\webAnalyzer\\sdks\\3.0.1\\selenium-java-3.0.1\\lib\\cssparser-0.9.20.jar;C:\\Users\\Kan Qi\\OneDrive\\ResearchSpace\\Research Projects\\webAnalyzer\\sdks\\3.0.1\\selenium-java-3.0.1\\lib\\gson-2.3.1.jar;C:\\Users\\Kan Qi\\OneDrive\\ResearchSpace\\Research Projects\\webAnalyzer\\sdks\\3.0.1\\selenium-java-3.0.1\\lib\\guava-19.0.jar;C:\\Users\\Kan Qi\\OneDrive\\ResearchSpace\\Research Projects\\webAnalyzer\\sdks\\3.0.1\\selenium-java-3.0.1\\lib\\hamcrest-core-1.3.jar;C:\\Users\\Kan Qi\\OneDrive\\ResearchSpace\\Research Projects\\webAnalyzer\\sdks\\3.0.1\\selenium-java-3.0.1\\lib\\hamcrest-library-1.3.jar;C:\\Users\\Kan Qi\\OneDrive\\ResearchSpace\\Research Projects\\webAnalyzer\\sdks\\3.0.1\\selenium-java-3.0.1\\lib\\htmlunit-2.23.jar;C:\\Users\\Kan Qi\\OneDrive\\ResearchSpace\\Research Projects\\webAnalyzer\\sdks\\3.0.1\\selenium-java-3.0.1\\lib\\htmlunit-core-js-2.23.jar;C:\\Users\\Kan Qi\\OneDrive\\ResearchSpace\\Research Projects\\webAnalyzer\\sdks\\3.0.1\\selenium-java-3.0.1\\lib\\httpclient-4.5.2.jar;C:\\Users\\Kan Qi\\OneDrive\\ResearchSpace\\Research Projects\\webAnalyzer\\sdks\\3.0.1\\selenium-java-3.0.1\\lib\\httpcore-4.4.4.jar;C:\\Users\\Kan Qi\\OneDrive\\ResearchSpace\\Research Projects\\webAnalyzer\\sdks\\3.0.1\\selenium-java-3.0.1\\lib\\httpmime-4.5.2.jar;C:\\Users\\Kan Qi\\OneDrive\\ResearchSpace\\Research Projects\\webAnalyzer\\sdks\\3.0.1\\selenium-java-3.0.1\\lib\\javax.servlet-api-3.1.0.jar;C:\\Users\\Kan Qi\\OneDrive\\ResearchSpace\\Research Projects\\webAnalyzer\\sdks\\3.0.1\\selenium-java-3.0.1\\lib\\jetty-io-9.2.13.v20150730.jar;C:\\Users\\Kan Qi\\OneDrive\\ResearchSpace\\Research Projects\\webAnalyzer\\sdks\\3.0.1\\selenium-java-3.0.1\\lib\\jetty-util-9.2.13.v20150730.jar;C:\\Users\\Kan Qi\\OneDrive\\ResearchSpace\\Research Projects\\webAnalyzer\\sdks\\3.0.1\\selenium-java-3.0.1\\lib\\jna-4.1.0.jar;C:\\Users\\Kan Qi\\OneDrive\\ResearchSpace\\Research Projects\\webAnalyzer\\sdks\\3.0.1\\selenium-java-3.0.1\\lib\\jna-platform-4.1.0.jar;C:\\Users\\Kan Qi\\OneDrive\\ResearchSpace\\Research Projects\\webAnalyzer\\sdks\\3.0.1\\selenium-java-3.0.1\\lib\\junit-4.12.jar;C:\\Users\\Kan Qi\\OneDrive\\ResearchSpace\\Research Projects\\webAnalyzer\\sdks\\3.0.1\\selenium-java-3.0.1\\lib\\neko-htmlunit-2.23.jar;C:\\Users\\Kan Qi\\OneDrive\\ResearchSpace\\Research Projects\\webAnalyzer\\sdks\\3.0.1\\selenium-java-3.0.1\\lib\\netty-3.5.7.Final.jar;C:\\Users\\Kan Qi\\OneDrive\\ResearchSpace\\Research Projects\\webAnalyzer\\sdks\\3.0.1\\selenium-java-3.0.1\\lib\\phantomjsdriver-1.3.0.jar;C:\\Users\\Kan Qi\\OneDrive\\ResearchSpace\\Research Projects\\webAnalyzer\\sdks\\3.0.1\\selenium-java-3.0.1\\lib\\sac-1.3.jar;C:\\Users\\Kan Qi\\OneDrive\\ResearchSpace\\Research Projects\\webAnalyzer\\sdks\\3.0.1\\selenium-java-3.0.1\\lib\\serializer-2.7.2.jar;C:\\Users\\Kan Qi\\OneDrive\\ResearchSpace\\Research Projects\\webAnalyzer\\sdks\\3.0.1\\selenium-java-3.0.1\\lib\\websocket-api-9.2.15.v20160210.jar;C:\\Users\\Kan Qi\\OneDrive\\ResearchSpace\\Research Projects\\webAnalyzer\\sdks\\3.0.1\\selenium-java-3.0.1\\lib\\websocket-client-9.2.15.v20160210.jar;C:\\Users\\Kan Qi\\OneDrive\\ResearchSpace\\Research Projects\\webAnalyzer\\sdks\\3.0.1\\selenium-java-3.0.1\\lib\\websocket-common-9.2.15.v20160210.jar;C:\\Users\\Kan Qi\\OneDrive\\ResearchSpace\\Research Projects\\webAnalyzer\\sdks\\3.0.1\\selenium-java-3.0.1\\lib\\xalan-2.7.2.jar;C:\\Users\\Kan Qi\\OneDrive\\ResearchSpace\\Research Projects\\webAnalyzer\\sdks\\3.0.1\\selenium-java-3.0.1\\lib\\xercesImpl-2.11.0.jar;C:\\Users\\Kan Qi\\OneDrive\\ResearchSpace\\Research Projects\\webAnalyzer\\sdks\\3.0.1\\selenium-java-3.0.1\\lib\\xml-apis-1.4.01.jar;C:\\Users\\Kan Qi\\OneDrive\\ResearchSpace\\Research Projects\\webAnalyzer\\sdks\\3.0.1\\selenium-java-3.0.1\\client-combined-3.0.1-nodeps.jar\" com.webanalyzer.HtmlUIElementExtractor"
							+ " \""+fileListPath+"\" \""+resultFilePath+"\"";
					System.out.println(command);
					try {
						Process p = Runtime.getRuntime().exec(command);
						BufferedReader input = new BufferedReader(new InputStreamReader(p.getInputStream()));
						String line = "";
						  while ((line = input.readLine()) != null) {
						    System.out.println(line);
						  }
						  input.close();

						  p.waitFor();
						  
						  String command2 = "\"C:\\Program Files\\R\\R-3.3.2\\bin\\Rscript\" .\\tools\\Rscript\\WebAnalysisScript.R \""+ repoArchivePath +"\"";
						  System.out.println(command2);
							Process p2 = Runtime.getRuntime().exec(command2);
							BufferedReader input2 = new BufferedReader(new InputStreamReader(p2.getInputStream()));
							String line2 = "";
							  while ((line2 = input2.readLine()) != null) {
							    System.out.println(line2);
							  }
							  input2.close();
							
							p2.waitFor();
							
							Desktop.getDesktop().open(new File(repoArchivePath+"\\web_analysis_result.pdf"));
							
					} catch (IOException e1) {
						e1.printStackTrace();
					} catch (InterruptedException e1) {
						e1.printStackTrace();
					}
		    		
		    	}
		    	
		    	
		    }    
		 }
    
}
