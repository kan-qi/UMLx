package repo.component.utilities.backups;

import java.awt.Desktop;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.List;

import repo.RepoBrowser;

public class NormalizedDataCalibrateV2 {
	
	static String rawDataFilePath = RepoBrowser.projectPath+"\\NormalizedEffortData.txt";
	static String EUCPEffortDataPath = RepoBrowser.projectTempPath+"\\EUCPEffortData.txt";
	static String EXUCPEffortDataPath = RepoBrowser.projectTempPath+"\\EXUCPEffortData.txt";
	static String AFPCEffortDataPath = RepoBrowser.projectTempPath+"\\AFPCEffortData.txt";
	
	public static void main(String... args) {
		File rawDataFile = new File(rawDataFilePath);
		if(! rawDataFile.exists()){
			return;
		}
		
		try {
			BufferedReader br = new BufferedReader(new InputStreamReader(new FileInputStream(rawDataFile)));
			List<String> repoPaths = new ArrayList<String>();
			String line = null;
			ArrayList<String[]> dataMatrix = new ArrayList<String[]>();
			while ((line = br.readLine()) != null) {
				String[] parts = line.split("\\s+");
				dataMatrix.add(parts);
			}
			String[][] data = dataMatrix.toArray(new String[0][0]);
		 
			br.close();
			

			PrintWriter writer1 = new PrintWriter(EUCPEffortDataPath);
			PrintWriter writer2 = new PrintWriter(EXUCPEffortDataPath);
			PrintWriter writer3 = new PrintWriter(AFPCEffortDataPath);
			
//			writer1.write("Project\tEUCPW\tEffort\tType\n");
//			writer2.write("Project\tEXUCPW\tEffort\tType\n");
//			writer3.write("Project\tAFPC\tEffort\tType\n");
//			for(int i = 1; i<data.length; i++){
//				writer1.write(data[i][0]+"\t"+data[i][1]+"\t"+data[i][4]+"\tPH\n");
//				writer1.write(data[i][0]+"\t"+data[i][1]+"\t"+data[i][5]+"\tPH'\n");
//				writer2.write(data[i][0]+"\t"+data[i][2]+"\t"+data[i][4]+"\tPH\n");
//				writer2.write(data[i][0]+"\t"+data[i][2]+"\t"+data[i][5]+"\tPH'\n");
//				writer3.write(data[i][0]+"\t"+data[i][3]+"\t"+data[i][4]+"\tPH\n");
//				writer3.write(data[i][0]+"\t"+data[i][3]+"\t"+data[i][6]+"\tPH'\n");
//			}
			
			writer1.write("EUCPW\tEffort\tType\n");
			writer2.write("EXUCPW\tEffort\tType\n");
			writer3.write("AFPC\tEffort\tType\n");
			for(int i = 1; i<data.length; i++){
				writer1.write(data[i][1]+"\t"+data[i][4]+"\tPH\n");
				writer1.write(data[i][1]+"\t"+data[i][5]+"\tPH_norm\n");
				writer2.write(data[i][2]+"\t"+data[i][4]+"\tPH\n");
				writer2.write(data[i][2]+"\t"+data[i][5]+"\tPH_norm\n");
				writer3.write(data[i][3]+"\t"+data[i][4]+"\tPH\n");
				writer3.write(data[i][3]+"\t"+data[i][5]+"\tPH_norm\n");
			}
			
			writer1.close();
			writer2.close();
			writer3.close();
			
			String workingDir = RepoBrowser.projectTempPath;
			String command = "\"C:\\Program Files\\R\\R-3.3.2\\bin\\Rscript\" .\\tools\\Rscript\\NormalizedEffortCalibrationV1.1.R \"" + RepoBrowser.projectTempPath +"\" \""+ workingDir +"\"";
//			String command = "\"C:\\Program Files\\R\\R-3.3.2\\bin\\Rscript\" .\\tools\\Rscript\\NormalizedEffortCalibration.R \"" + RepoBrowser.projectTempPath +"\" \""+ workingDir +"\"";

			System.out.println(command);
			Process p = Runtime.getRuntime().exec(command); 
			p.waitFor();
//			Path currentRelativePath = Paths.get("");
//			String s = currentRelativePath.toAbsolutePath().toString();
//			System.out.println("Current relative path is: " + s);
			
//			Runtime.getRuntime().exec("start Z:\\Documents\\Research Space\\Experiment projects\\Repo Analyser\\tools\\temp\\Rplots.pdf");
			Desktop.getDesktop().open(new File(workingDir+"\\normalized_regression_plot.png"));
			
			
		} catch (IOException | InterruptedException e) {
			e.printStackTrace();
		}
		
			 
				
	}
}
