package repo;

import java.awt.Desktop;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.util.List;

import javax.swing.JMenuItem;
import javax.swing.tree.DefaultMutableTreeNode;

import repo.component.checkbox.CheckBoxNode;

public class RootPopupMenu extends PopUpMenu {
	JMenuItem slocAlyItem;
	public RootPopupMenu(RepositoryTree tree) {
		super(tree);
		slocAlyItem = new JMenuItem("Sloc Analysis");
		slocAlyItem.setActionCommand("Sloc_Analysis");
		this.add(slocAlyItem);
		slocAlyItem.addActionListener(new ActionListener(){

			@Override
			public void actionPerformed(ActionEvent e) {
				if(e.getActionCommand().equals("Sloc_Analysis")){
					List<DefaultMutableTreeNode> repoNodes = tree.getRepoNodes();
					String filePath = prepareSlocDataForR(repoNodes);
//					String path = filePath.substring(0,filePath.lastIndexOf("/"));
//					String outputFilePath = path+"/"+"output.txt";
					String outputFilePath = RepoBrowser.projectTempPath+"\\Rplots.pdf";
					File outputFile = new File(outputFilePath);
					if(outputFile.exists()){
						outputFile.delete();
					}
					try {
//						Desktop.getDesktop().open(new File(filePath));
//						Runtime.getRuntime().exec("explorer.exe /select," + filePath.replace("/", "\\"));
//						String command = "C:\\Program Files\\R\\R-3.2.2\\bin\\Rscript .\\tools\\Rscript\\SlocEffortScatterPlot.R " + filePath.replace("/", "\\");
						String command = "C:\\Program Files\\R\\R-3.2.2\\bin\\Rscript .\\tools\\Rscript\\SlocEffortScatterPlot.R \"" + filePath +"\" \""+RepoBrowser.projectTempPath+"\"";
						
						Process p = Runtime.getRuntime().exec(command.replace("\\", "/")); 
						System.out.println(command);
						p.waitFor();
//						Path currentRelativePath = Paths.get("");
//						String s = currentRelativePath.toAbsolutePath().toString();
//						System.out.println("Current relative path is: " + s);
						
//						Runtime.getRuntime().exec("start Z:\\Documents\\Research Space\\Experiment projects\\Repo Analyser\\tools\\temp\\Rplots.pdf");
						Desktop.getDesktop().open(new File(outputFilePath));
					} catch (IOException | InterruptedException e1) {
						e1.printStackTrace();
					}
				}
				
			}
			
		});
		
		
		this.checkItem.addActionListener(new ActionListener(){

			@Override
			public void actionPerformed(ActionEvent e) {
				if(e.getActionCommand().equals("CheckUncheckSubtree")){
					System.out.println("Cloc by Root popup menu");
					List<DefaultMutableTreeNode> repoNodes = tree.getRepoNodes();
					for(DefaultMutableTreeNode node : repoNodes){
//						String clocDumpFile = "dump_cloc_"+node.toString()+".txt".replaceAll("[\\/:\\s]", "_");
						
						tree.checkUncheckNode((CheckBoxNode) node);
					}
				}
			}
			
		});
		
		
		this.clocItem.addActionListener(new ActionListener(){

			@Override
			public void actionPerformed(ActionEvent e) {
				if(e.getActionCommand().equals("Cloc")){
					System.out.println("Cloc by Root popup menu");
					List<DefaultMutableTreeNode> repoNodes = tree.getRepoNodes();
					for(DefaultMutableTreeNode node : repoNodes){
//						String clocDumpFile = "dump_cloc_"+node.toString()+".txt".replaceAll("[\\/:\\s]", "_");
						
						String projectRepoPath = RepoBrowser.projectPath+"\\"+tree.getNodeFileName(node);
			    		String clocDumpFile = projectRepoPath+"\\cloc_dump_file_list.txt";
						
						tree.dumpSelectedPaths(clocDumpFile, node);
						AnalysisKit.calCloc(clocDumpFile, projectRepoPath);
					}
				}
				
			}
			
		});
	}
	
	private String prepareSlocDataForR(List<DefaultMutableTreeNode> repoNodes){
		String resultPath =  RepoBrowser.projectTempPath+"\\slocEffortData.txt";
		String clocFileName = "cloc_report.txt";
		String effortFileName = "effort_report.txt";
		String slocEffortReportPath = RepoBrowser.projectTempPath+"\\sloc_effort_report.txt";
		StringBuilder slocEffortReport = new StringBuilder();
		slocEffortReport.append("sloc\teffort\n");
		
		for(DefaultMutableTreeNode repoNode : repoNodes){
			File clocReport = new File(RepoBrowser.projectPath+"\\"+tree.getNodeFileName(repoNode)+"\\"+clocFileName);
			File effortReport = new File(RepoBrowser.projectPath+"\\"+tree.getNodeFileName(repoNode) + "\\" + effortFileName);
			
			String record = "";
			if(!clocReport.exists() || ! effortReport.exists()) {
				continue;
			}
			try {
//				// Construct BufferedReader from FileReader
				BufferedReader br = new BufferedReader(new FileReader(clocReport));
				 
				String line = null;
				while ((line = br.readLine()) != null) {
					if(line.startsWith("SUM:")){
						String[] parts = line.split("\\s+");
						record = parts[parts.length -1];
					}
				}
			 
				br.close();
				
				// Construct BufferedReader from FileReader
				BufferedReader effortBr = new BufferedReader(new FileReader(effortReport));
				 
				line = null;
				while ((line = effortBr.readLine()) != null) {
					record += "\t"+line;
				}
			 
				effortBr.close();
				slocEffortReport.append(record+"\n");
			} catch (IOException e1) {
				e1.printStackTrace();
			}
		}
		
		BufferedWriter writer = null;
		try
		{
		    writer = new BufferedWriter(new FileWriter(slocEffortReportPath));
		    writer.write(slocEffortReport.toString());
		    writer.flush();
		    writer.close();
			
//			PrintWriter out = new PrintWriter(slocEffortReportPath.replace("\\", "/"));
		}
		catch ( IOException e)
		{
			e.printStackTrace();
		}
		
		return slocEffortReportPath;
	}

	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;

}
