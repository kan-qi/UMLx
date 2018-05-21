package repo.component.utilities;

import java.awt.Desktop;
import java.io.File;
import java.io.IOException;

import repo.RepoBrowser;

public class BayesianAverageReport {
	
//	static String rawDataFilePath = RepoBrowser.projectPath+"\\NormalizedEffortData.txt";
	static String rawDataFilePath = RepoBrowser.projectPath+"\\resData.txt";
	
	public static void main(String... args) {
		File rawDataFile = new File(rawDataFilePath);
		if(! rawDataFile.exists()){
			return;
		}
		
		try {
			
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
			
			
			String outputDir = RepoBrowser.projectTempPath;
			if(args.length > 0){
				outputDir = args[0];
				System.out.println(outputDir);
			}
			String command = "\"C:\\Program Files\\R\\R-3.2.2\\bin\\Rscript\" .\\tools\\Rscript\\BayesianModelAverage.R \"" + rawDataFilePath +"\" \""+ outputDir +"\"";
//			String command = "\"C:\\Program Files\\R\\R-3.3.2\\bin\\Rscript\" .\\tools\\Rscript\\NormalizedEffortCalibration.R \"" + RepoBrowser.projectTempPath +"\" \""+ workingDir +"\"";

			System.out.println(command);
			Process p = Runtime.getRuntime().exec(command); 
			p.waitFor();
//			Path currentRelativePath = Paths.get("");
//			String s = currentRelativePath.toAbsolutePath().toString();
//			System.out.println("Current relative path is: " + s);
			
//			Runtime.getRuntime().exec("start Z:\\Documents\\Research Space\\Experiment projects\\Repo Analyser\\tools\\temp\\Rplots.pdf");
			Desktop.getDesktop().open(new File(outputDir+"\\bayesian_average_report.txt"));
			
			
		} catch (IOException | InterruptedException e) {
			e.printStackTrace();
		}
		
			 
				
	}
}
