package kqi.slicer;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.List;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import com.ibm.wala.shrikeCT.InvalidClassFileException;
import com.ibm.wala.util.CancelException;
import com.ibm.wala.util.WalaException;

import kqi.slicer.CallgraphExtractor.Src;

public class CallgraphAnalysis {
	
	public static void main(String[] args) {
		
			try {
				StringBuilder testCasesResult = new StringBuilder("");
				testCasesResult.append(performCallgraphExtractionTestCases("./testcases/config.json"));
				testCasesResult.append(performCallgraphMajorSlicingTestCases("./testcases/config.json"));
				testCasesResult.append(performCallgraphClusteringByMajorTestCases("./testcases/config.json"));
				testCasesResult.append(performCallgraphClusteringTestCases("./testcases/config.json"));
				writeToFile("testcases/testing_result.txt", testCasesResult.toString());
			} catch (IOException | JSONException e) {
				e.printStackTrace();
			}
	}
	
	private static void performSlicing(){
		// use Rhino for parsing; change if you want to use a different parser

					Src[] stubs = new Src[]{new Src("prologue.js", "./stubs/prologue.js", "none"), new Src("preamble.js", "./stubs/preamble.js", "view")};
					Src[] libraries = new Src[]{new Src("apigee.js", "./testcases/testcase1/apigee.js", "model")};
					Src[] srcs = {new Src("client.js", "./testcases/testcase1/client.js", "none")};
					
					try {
						CallgraphSlicer slicer = new CallgraphSlicer(stubs, srcs, libraries);
						Callgraph graph = slicer.extractCallGraph("callgraph");
						
						slicer.sliceCallgraph(graph);
						System.out.println("-------------callgraph--------------");
						slicer.printRawCallgraph();
						graph.printCallgraph();
						graph.dumpGraph("callgraph.dotty");
						
					} catch (CancelException | WalaException | InvalidClassFileException | IOException e) {
						e.printStackTrace();
					}
				
	}
	
	private static String performCallgraphExtractionTestCases(String testCasesConfigPath) throws IOException, JSONException{
		File testCasesConfig = new File(testCasesConfigPath);
		BufferedReader reader = new BufferedReader(new FileReader(testCasesConfig));
		StringBuilder testCasesData = new StringBuilder();
		String line = null;
		StringBuilder testingResult = new StringBuilder();
		while((line = reader.readLine()) != null){
			testCasesData.append(line);
		}
		
		reader.close();
		
		JSONArray testCases = new JSONArray(testCasesData.toString());
		for(int i=0; i<testCases.length(); i++){
			JSONObject object = (JSONObject) testCases.get(i);
			String testCaseName = object.getString("name");
			System.out.println("------------------"+testCaseName+" start -------------------");
			testingResult.append("test case "+i+":");
			JSONArray libArray = object.getJSONArray("libs");
			JSONArray srcArray = object.getJSONArray("srcs");
			String testCasePath = object.getString("path");
			String expectedMethodsOutputFile = object.getString("expected_output_methods");
			List<String> existingMethods = readExistingMethods(testCasePath + expectedMethodsOutputFile);
			Src[] libs = new Src[libArray.length()];
			Src[] srcs = new Src[srcArray.length()];
			for(int j=0; j<libArray.length(); j++){
				JSONObject srcObject = (JSONObject) libArray.get(j);
				Src src = new Src(srcObject.getString("name"), testCasePath+srcObject.getString("path"), srcObject.getString("type"));
				libs[j] = src;
			}
			
			for(int j=0; j<srcArray.length(); j++){
				JSONObject srcObject = (JSONObject) srcArray.get(j);
				Src src = new Src(srcObject.getString("name"), testCasePath+srcObject.getString("path"), srcObject.getString("type"));
				srcs[j] = src;
			}
			
			
			Src[] stubs = new Src[]{new Src("prologue.js", "./stubs/prologue.js", "none"), new Src("preamble.js", "./stubs/preamble.js", "view")};
			
			try {
				CallgraphSlicer slicer = new CallgraphSlicer(stubs, srcs, libs);
				Callgraph graph = slicer.extractCallGraph("callgraph");
				
//				slicer.sliceCallgraph(graph);
				System.out.println("-------------callgraph--------------");
				graph.printCallgraph();
				graph.dumpGraph(testCasePath+"callgraph.dotty");
				
				int identified = 0;
				for(String method : existingMethods){
					boolean methodFound = false;
					for(CallgraphNode node : graph.nodes.values()){
						if(node.label.contains(method)){
							identified ++;
							methodFound = true;
							break;
						}
					}
					
					if(methodFound){
						System.out.println(method+": yes");
					}
					else{
						System.out.println(method+": no");
					}
				}
				testingResult.append("methods identification rate: "+((float)identified/existingMethods.size()*100+"%\n"));
				System.out.println("methods identification rate: "+((float)identified/existingMethods.size()*100+"%"));
				
			} catch (CancelException | WalaException | InvalidClassFileException | IOException e) {
				e.printStackTrace();
			}
			
			System.out.println("------------------"+testCaseName+" end -------------------");
		}
		
		return testingResult.toString();
	}
	
	private static String performCallgraphClusteringByMajorTestCases(String testCasesConfigPath) throws IOException, JSONException{
		File testCasesConfig = new File(testCasesConfigPath);
		BufferedReader reader = new BufferedReader(new FileReader(testCasesConfig));
		StringBuilder testCasesData = new StringBuilder();
		String line = null;
		while((line = reader.readLine()) != null){
			testCasesData.append(line);
		}
		
		reader.close();
		
		JSONArray testCases = new JSONArray(testCasesData.toString());
		for(int i=0; i<testCases.length(); i++){
//			if(i != 6){
//				continue;
//			}
			
			JSONObject object = (JSONObject) testCases.get(i);
			String testCaseName = object.getString("name");
			System.out.println("------------------"+testCaseName+" start -------------------");
			JSONArray libArray = object.getJSONArray("libs");
			JSONArray srcArray = object.getJSONArray("srcs");
			String testCasePath = object.getString("path");
			String expectedMethodsOutputFile = object.getString("expected_output_methods");
			Src[] libs = new Src[libArray.length()];
			Src[] srcs = new Src[srcArray.length()];
			for(int j=0; j<libArray.length(); j++){
				JSONObject srcObject = (JSONObject) libArray.get(j);
				Src src = new Src(srcObject.getString("name"), testCasePath+srcObject.getString("path"), srcObject.getString("type"));
				libs[j] = src;
			}
			
			for(int j=0; j<srcArray.length(); j++){
				JSONObject srcObject = (JSONObject) srcArray.get(j);
				Src src = new Src(srcObject.getString("name"), testCasePath+srcObject.getString("path"), srcObject.getString("type"));
				srcs[j] = src;
			}
			
			
			Src[] stubs = new Src[]{new Src("prologue.js", "./stubs/prologue.js", "none"), new Src("preamble.js", "./stubs/preamble.js", "view")};
			
			try {
				CallgraphClusterer clusterer = new CallgraphClusterer(stubs, srcs, libs);
				Callgraph graph = clusterer.extractCallGraph("callgraph");
				
				Callgraph clusteredGraph = clusterer.clusterCallgraphByMajorCategories(graph);
				System.out.println("-------------callgraph--------------");
				clusteredGraph.printCallgraph();
				clusteredGraph.dumpGraph(testCasePath+"clusteredCallgraphByMajorCategories.dotty");
				
			} catch (CancelException | WalaException | InvalidClassFileException | IOException e) {
				e.printStackTrace();
			}
			
			System.out.println("------------------"+testCaseName+" end -------------------");
		}
		
		return "";
	}
	
	
	private static String performCallgraphClusteringTestCases(String testCasesConfigPath) throws IOException, JSONException{
		File testCasesConfig = new File(testCasesConfigPath);
		BufferedReader reader = new BufferedReader(new FileReader(testCasesConfig));
		StringBuilder testCasesData = new StringBuilder();
		String line = null;
		StringBuilder testingResult = new StringBuilder();
		while((line = reader.readLine()) != null){
			testCasesData.append(line);
		}
		
		reader.close();
		
		JSONArray testCases = new JSONArray(testCasesData.toString());
		for(int i=0; i<testCases.length(); i++){
//			if(i != 6){
//				continue;
//			}
			
			JSONObject object = (JSONObject) testCases.get(i);
			String testCaseName = object.getString("name");
			testingResult.append("test case "+i+":");
			System.out.println("------------------"+testCaseName+" start -------------------");
			JSONArray libArray = object.getJSONArray("libs");
			JSONArray srcArray = object.getJSONArray("srcs");
			String testCasePath = object.getString("path");
			String expectedMethodsOutputFile = object.getString("expected_output_methods");
			String expectedComponentOutputFile = object.getString("expected_output_components");
			Src[] libs = new Src[libArray.length()];
			Src[] srcs = new Src[srcArray.length()];
			for(int j=0; j<libArray.length(); j++){
				JSONObject srcObject = (JSONObject) libArray.get(j);
				Src src = new Src(srcObject.getString("name"), testCasePath+srcObject.getString("path"), srcObject.getString("type"));
				libs[j] = src;
			}
			
			for(int j=0; j<srcArray.length(); j++){
				JSONObject srcObject = (JSONObject) srcArray.get(j);
				Src src = new Src(srcObject.getString("name"), testCasePath+srcObject.getString("path"), srcObject.getString("type"));
				srcs[j] = src;
			}
			
			
			Src[] stubs = new Src[]{new Src("prologue.js", "./stubs/prologue.js", "none"), new Src("preamble.js", "./stubs/preamble.js", "view")};
			
			try {
				CallgraphClusterer clusterer = new CallgraphClusterer(stubs, srcs, libs);
				Callgraph graph = clusterer.extractCallGraph("callgraph");
				
				Callgraph clusteredGraph = clusterer.clusterCallgraph(graph);
				System.out.println("-------------callgraph--------------");
				clusteredGraph.printCallgraph();
				String printable = clusteredGraph.dumpGraph(testCasePath+"clusteredCallgraph.dotty");
				
				List<String> existingComponents = readExistingComponents(testCasePath + expectedComponentOutputFile);
				int identified = 0;
				for(String component : existingComponents){
					
					if(printable.contains(component)){
						identified++;
						System.out.println(component+": yes");
					}
					else{
						System.out.println(component+": no");
					}
				}

				testingResult.append("components identification rate: "+((float)identified/existingComponents.size()*100+"%\n"));
				System.out.println("components identification rate: "+((float)identified/existingComponents.size()*100+"%"));
				
				
			} catch (CancelException | WalaException | InvalidClassFileException | IOException e) {
				e.printStackTrace();
			}
			
			System.out.println("------------------"+testCaseName+" end -------------------");
		}
		
		return testingResult.toString();
	}
	
	private static String performCallgraphMajorSlicingTestCases(String testCasesConfigPath) throws IOException, JSONException{
		File testCasesConfig = new File(testCasesConfigPath);
		BufferedReader reader = new BufferedReader(new FileReader(testCasesConfig));
		StringBuilder testCasesData = new StringBuilder();
		String line = null;
		while((line = reader.readLine()) != null){
			testCasesData.append(line);
		}
		
		reader.close();
		
		JSONArray testCases = new JSONArray(testCasesData.toString());
		for(int i=0; i<testCases.length(); i++){
			
			JSONObject object = (JSONObject) testCases.get(i);
			String testCaseName = object.getString("name");
			System.out.println("------------------"+testCaseName+" start -------------------");
			JSONArray libArray = object.getJSONArray("libs");
			JSONArray srcArray = object.getJSONArray("srcs");
			String testCasePath = object.getString("path");
			String expectedMethodsOutputFile = object.getString("expected_output_methods");
			List<String> existingMethods = readExistingMethods(testCasePath + expectedMethodsOutputFile);
			Src[] libs = new Src[libArray.length()];
			Src[] srcs = new Src[srcArray.length()];
			for(int j=0; j<libArray.length(); j++){
				JSONObject srcObject = (JSONObject) libArray.get(j);
				Src src = new Src(srcObject.getString("name"), testCasePath+srcObject.getString("path"), srcObject.getString("type"));
				libs[j] = src;
			}
			
			for(int j=0; j<srcArray.length(); j++){
				JSONObject srcObject = (JSONObject) srcArray.get(j);
				Src src = new Src(srcObject.getString("name"), testCasePath+srcObject.getString("path"), srcObject.getString("type"));
				srcs[j] = src;
			}
			
			
			Src[] stubs = new Src[]{new Src("prologue.js", "./stubs/prologue.js", "none"), new Src("preamble.js", "./stubs/preamble.js", "view")};
			
			try {
				CallgraphSlicer slicer = new CallgraphSlicer(stubs, srcs, libs);
				Callgraph graph = slicer.extractCallGraph("callgraph");
				
				slicer.sliceCallgraph(graph);
				System.out.println("-------------callgraph--------------");
				graph.printCallgraph();
				graph.dumpGraph(testCasePath+"taggedCallgraph.dotty");
				
				int identified = 0;
				for(String method : existingMethods){
					boolean methodFound = false;
					for(CallgraphNode node : graph.nodes.values()){
						if(node.label.contains(method)){
							identified ++;
							methodFound = true;
							break;
						}
					}
					
					if(methodFound){
						System.out.println(method+": yes");
					}
					else{
						System.out.println(method+": no");
					}
				}
				
				System.out.println("methods identification rate: "+((float)identified/existingMethods.size()*100+"%"));
				
			} catch (CancelException | WalaException | InvalidClassFileException | IOException e) {
				e.printStackTrace();
			}
			
			System.out.println("------------------"+testCaseName+" end -------------------");
		}
		
		return "";
	}
	
	private static List<String> readExistingMethods(String methodsFile) throws IOException{
		BufferedReader reader = new BufferedReader(new FileReader(methodsFile));
		String methodName = null;
		List<String> methodNames = new ArrayList<String>();
		while((methodName = reader.readLine()) != null){
			methodNames.add(methodName);
		}
		
		reader.close();
		return methodNames;
	}
	
	private static List<String> readExistingComponents(String componentsFile) throws IOException{
		BufferedReader reader = new BufferedReader(new FileReader(componentsFile));
		String componentName = null;
		List<String> componentNames = new ArrayList<String>();
		while((componentName = reader.readLine()) != null){
			componentNames.add(componentName);
		}
		
		reader.close();
		return componentNames;
	}
	
	private static void writeToFile(String fileName, String content){
		PrintWriter writer = null;
		try {

			System.out.println("-------------dump callgraph--------------");
			writer = new PrintWriter(fileName);
			writer.write(content);
			writer.flush();
		} catch (FileNotFoundException e) {
			e.printStackTrace();
		} finally {
			if(writer != null){
				writer.close();
			}
		}
	}
	
}
