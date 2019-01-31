/*
 * GUIHierarchyPrinterClient.java - part of the GATOR project
 *
 * Copyright (c) 2018 The Ohio State University
 *
 * This file is distributed under the terms described in LICENSE in the
 * root directory.
 */
package presto.android.gui.clients;

import presto.android.Configs;
import presto.android.Logger;
import presto.android.gui.GUIAnalysisClient;
import presto.android.gui.GUIAnalysisOutput;
import presto.android.gui.rep.GUIHierarchy;
import presto.android.gui.rep.StaticGUIHierarchy;

import java.io.File;
import java.io.PrintStream;
import java.nio.file.Path;
import java.nio.file.Paths;
<<<<<<< HEAD:facility-tools/GATOR_Tool/gator-3.5/gator/sootandroid/src/main/java/presto/android/gui/clients/GUIHierarchyPrinterClient.java
=======

import javax.security.auth.login.ConfigurationSpi;
>>>>>>> 2cef7ae5c6bdcf138f58202c8145b4fa32e15cbc:facility-tools/gator/sootandroid/src/main/java/presto/android/gui/clients/GUIHierarchyPrinterClient.java

public class GUIHierarchyPrinterClient implements GUIAnalysisClient {
  private String TAG = GUIHierarchyPrinterClient.class.getSimpleName();
  GUIAnalysisOutput output;
  GUIHierarchy guiHier;

  private PrintStream out = null;

  @Override
  public void run(GUIAnalysisOutput output) {
    this.output = output;
    guiHier = new StaticGUIHierarchy(output);
    boolean showDialog = true;

    // Init the file io
    for (String param : Configs.clientParams) {
      if (param.equals("print2stdout")) {
        out = System.out;
      } else if (param.equals("nodialog")) {
        showDialog = false;
      }
    }
    if (out == null) {
      try {
<<<<<<< HEAD:facility-tools/GATOR_Tool/gator-3.5/gator/sootandroid/src/main/java/presto/android/gui/clients/GUIHierarchyPrinterClient.java
    	 Path curDir = Paths.get(System.getProperty("user.dir"));
    	 Path filePath = Paths.get(curDir.toString(), Configs.benchmarkName + ".xml");
=======
//    	 Path curDir = Paths.get(System.getProperty("user.dir"));
    	Path filePath = Paths.get(Configs.outputDir, Configs.benchmarkName + ".xml");
>>>>>>> 2cef7ae5c6bdcf138f58202c8145b4fa32e15cbc:facility-tools/gator/sootandroid/src/main/java/presto/android/gui/clients/GUIHierarchyPrinterClient.java
    	File file = filePath.toFile();
    	if(!file.exists()) {
    		file.createNewFile();
    	}
//    	File file = new File("");
//       File file = File.createTempFile(Configs.benchmarkName + "-", ".xml");
    	 System.out.println("analysis output file: "+filePath.toString());
        Logger.verb(TAG, "XML file: " + file.getAbsolutePath());
        out = new PrintStream(file);
      } catch (Exception e) {
        throw new RuntimeException(e);
      }
    }

    // Start printing
    guiHier.dumpXML(output, out, showDialog);

    // Finish
    out.flush();
    out.close();
  }
}
