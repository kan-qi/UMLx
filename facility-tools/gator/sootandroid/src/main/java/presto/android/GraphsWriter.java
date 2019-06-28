/*
 * Debug.java - part of the GATOR project
 *
 * Copyright (c) 2018 The Ohio State University
 *
 * This file is distributed under the terms described in LICENSE in the
 * root directory.
 */
package presto.android;

import java.io.File;
import java.io.PrintWriter;
import java.util.HashMap;
import java.util.Map;

public class GraphsWriter {
	
  private String debugFileName;

  private File debugFile;

//  private ExecutorService executor = Executors.newFixedThreadPool(1);

  private static GraphsWriter theInstance;
  
  private Map<String, PrintWriter> printWriters;
 
  // time analysis begins
  private long startTime;

  private GraphsWriter() throws Exception {
	  
	printWriters = new HashMap<String, PrintWriter>();
	printWriters.put("android-analysis-output", new PrintWriter(Configs.outputDir+"/android-analysis-output.json"));
	printWriters.put("typeDependencyGraph", new PrintWriter(Configs.outputDir+"/typedependencygraph.json"));
	printWriters.put("callGraph", new PrintWriter(Configs.outputDir+"/callgraph.json"));
	printWriters.put("accessGraph", new PrintWriter(Configs.outputDir+"/accessgraph.json"));
	printWriters.put("extendsGraph", new PrintWriter(Configs.outputDir+"/extendsgraph.json"));
	printWriters.put("compositionGraph", new PrintWriter(Configs.outputDir+"/compositiongraph.json"));

    // Shutdown hook
    Runtime.getRuntime().addShutdownHook(new Thread() {
      @Override
      public void run() {

        for(String i : printWriters.keySet()) {
        	PrintWriter printWriter = printWriters.get(i);
        	if(printWriter != null) {
        		printWriter.flush();
        		printWriter.close();
                System.out.println("Finished writting graph: " + i);
        	}
        }
      }
    });
  }

  public static synchronized GraphsWriter v() {
    if (theInstance == null) {
      try {
        theInstance = new GraphsWriter();
      } catch (Exception e) {
        throw new RuntimeException(e);
      }
    }
    return theInstance;
  }

  // Put this in another thread if calling it frequently hurts performance.
  public void writeGraph(String graph, String format, Object... args) {
	PrintWriter printWriter = printWriters.get(graph);
	if(printWriter != null) {
	    printWriter.printf(format, args);
	}
  }
  
//Put this in another thread if calling it frequently hurts performance.
 public void writeGraph(String graph, String outputS) {
   PrintWriter printWriter = printWriters.get(graph);
	if(printWriter != null) {
		printWriter.println(outputS);
	}
 }

  public void setStartTime() {
    startTime = System.currentTimeMillis();
  }

  public long getExecutionTime() {
    return (System.currentTimeMillis() - startTime) / 1000;
  }
}
