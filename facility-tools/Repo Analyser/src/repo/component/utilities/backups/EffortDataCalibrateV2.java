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

public class EffortDataCalibrateV2 {
	
	static String workingDirPath = RepoBrowser.projectTempPath+"\\resultWithout0";
//	static String workingDirPath = RepoBrowser.projectTempPath+"\\resultWith0";
//	static String workingDirPath = RepoBrowser.projectTempPath+"\\resultWidthNormalizedDataWithout0TwoPhases";
//	static String workingDirPath = RepoBrowser.projectTempPath+"\\resultWithNormalizedDataWith0";
//	static String workingDirPath = RepoBrowser.projectTempPath+"\\resultWidthNormalizedDataWithRidgeRegression";
	static String rawDataFilePath = workingDirPath+"\\EffortDataV0.2.txt";
//	static String rawDataFilePath = workingDirPath+"\\EffortDataV0.3.txt";
	
	static String EUCPEffortDataPath = workingDirPath+"\\EUCPEffortData.txt";
	static String EXUCPEffortDataPath = workingDirPath+"\\EXUCPEffortData.txt";
	static String AFPCEffortDataPath = workingDirPath+"\\AFPCEffortData.txt";
	
	public static void main(String... args) {

		File workingDir = new File(workingDirPath);
		if(!workingDir.exists() || !workingDir.isDirectory()){
			workingDir.mkdir();
		}
		
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
			
			writer1.write("EUCP\tEffort\tType\n");
			writer2.write("EXUCP\tEffort\tType\n");
			writer3.write("AFPC\tEffort\tType\n");
			for(int i = 1; i<data.length; i++){
				writer1.write(data[i][1]+"\t"+data[i][4]+"\tPH\n");
				writer2.write(data[i][2]+"\t"+data[i][4]+"\tPH\n");
				writer3.write(data[i][3]+"\t"+data[i][4]+"\tPH\n");
			}
			
			writer1.close();
			writer2.close();
			writer3.close();
			
//			String workingDir = RepoBrowser.projectTempPath;
//			String outputDir = workingDir + "\\resultWithout0";
			String command = "\"C:\\Program Files\\R\\R-3.2.2\\bin\\Rscript\" .\\tools\\Rscript\\EffortCalibration.R \"" + workingDirPath +"\" \""+ workingDirPath +"\"";
//			String command = "\"C:\\Program Files\\R\\R-3.3.2\\bin\\Rscript\" .\\tools\\Rscript\\EffortCalibrationWithRidgeRegression.R \"" + workingDirPath +"\" \""+ workingDirPath +"\"";
//			String command = "\"C:\\Program Files\\R\\R-3.2.2\\bin\\Rscript\" .\\tools\\Rscript\\EffortCalibrationV1.0.R \"" + workingDirPath +"\" \""+ workingDirPath +"\"";

			System.out.println(command);
			Process p = Runtime.getRuntime().exec(command); 
			BufferedReader input = new BufferedReader(new InputStreamReader(p.getInputStream()));
			String outputLine = "";
			  while ((outputLine = input.readLine()) != null) {
			    System.out.println(outputLine);
			  }
			input.close();
			p.waitFor();
//			Path currentRelativePath = Paths.get("");
//			String s = currentRelativePath.toAbsolutePath().toString();
//			System.out.println("Current relative path is: " + s);
			
//			Runtime.getRuntime().exec("start Z:\\Documents\\Research Space\\Experiment projects\\Repo Analyser\\tools\\temp\\Rplots.pdf");
//			Desktop.getDesktop().open(new File(workingDirPath+"\\effort_regression_plot.pdf"));
			Desktop.getDesktop().open(new File(workingDirPath+"\\effort_regression_summary.txt"));
			Desktop.getDesktop().open(new File(workingDirPath+"\\effort_regression_plot.png"));
			
			
		} catch (IOException | InterruptedException e) {
			e.printStackTrace();
		}
		
			 
				
	}
}
