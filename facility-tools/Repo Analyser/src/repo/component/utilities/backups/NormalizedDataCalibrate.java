package repo.component.utilities.backups;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.List;

import repo.RepoBrowser;

public class NormalizedDataCalibrate {
	
	static String rawDataFilePath = "Tools\\Data\\"+"NormalizedEffortData.txt";
	static String EUCPEffortDataPath = "Tools\\Temp\\"+"EUCPEffortData.txt";
	static String EXUCPEffortDataPath = "Tools\\Temp\\"+"EXUCPEffortData.txt";
	static String AFPCEffortDataPath = "Tools\\Temp\\"+"AFPCEffortData.txt";
	
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
				writer3.write(data[i][3]+"\t"+data[i][6]+"\tPH_norm\n");
			}
			
			writer1.close();
			writer2.close();
			writer3.close();
			
			
			
			
		} catch (IOException e) {
			e.printStackTrace();
		}
		
			 
				
	}
}
