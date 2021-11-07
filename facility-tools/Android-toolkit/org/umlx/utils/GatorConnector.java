<<<<<<< HEAD
<<<<<<< HEAD
package org.umlx.utils;

import org.umlx.DebugOutput;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.xml.sax.SAXException;
import soot.jimple.infoflow.android.Debug;
import soot.util.HashMultiMap;
import soot.util.MultiMap;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;


/*
command1:
java -Xmx16G -cp /mnt/f/D/ResearchSpace/ResearchProjects/UMLx/facility-tools/gator/sootandroid/build/libs/sootandroid-1.0-SNAPSHOT-all.jar presto.android.Main \
-sootandroidDir /mnt/f/D/ResearchSpace/ResearchProjects/UMLx/facility-tools/gator/sootandroid \
-sdkDir /mnt/f/D/Android_SDK \
-listenerSpecFile /mnt/f/D/ResearchSpace/ResearchProjects/UMLx/facility-tools/gator/sootandroid/listeners.xml \
-wtgSpecFile /mnt/f/D/ResearchSpace/ResearchProjects/UMLx/facility-tools/gator/sootandroid/wtg.xml \
-resourcePath /tmp/gator-hskjovz8/res \
-manifestFile /tmp/gator-hskjovz8/AndroidManifest.xml \
-project /mnt/f/D/AndroidAnalysis/APKs/AnotherMonitor_release.apk \
-apiLevel android-25 \
-guiAnalysis \
-benchmarkName AnotherMonitor_release.apk \
-android /mnt/f/D/Android_SDK/platforms/android-25/android.jar \
-client GUIHierarchyPrinterClient \
-outputDir /mnt/f/D/AndroidAnalysis/batch_analysis/AnotherMonitor-release-4

command2:
./gator a -p /mnt/f/D/AndroidAnalysis/APKs/AnotherMonitor_release.apk \
-client GUIHierarchyPrinterClient \
-outputDir /mnt/f/D/AndroidAnalysis/batch_analysis/AnotherMonitor-release-4
*/

//dump the call graph from FlowDroid
public class GatorConnector {
    private static GatorConnector theInstance;

    // time analysis begins
    private long startTime;

    private GatorConnector() throws Exception {
            //run the client of gator and derive the gator file and identify the callbacks.
    }

    public static synchronized GatorConnector v() {
        if (theInstance == null) {
            try {
                theInstance = new GatorConnector();
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        }
        return theInstance;
    }

    private String unpackResource(File apkFile, String outputDir){
        File dir = new File(outputDir + "/Resources");

        if(!dir.exists() || !dir.isDirectory()){
            dir.mkdirs();
        }

//        String command = "./tools/apktool d \""+apkFile+"\" -o \""+dir.getAbsolutePath()+"\" -f";

        String command = "java -Xmx512M -jar ./tools/apktool.jar d --no-src -o "+dir.getAbsolutePath()+" -f "+apkFile;
//        String command = "java -Xmx512M -jar ./tools/apktool.jar d -o \""+dir.getAbsolutePath()+"\" -f \""+apkFile+"\"";

        System.out.println(command);

        try {
            CommandLine.run(command);
        } catch (InterruptedException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }

//        System.exit(0);

        return dir.getAbsolutePath();

    }

    public MultiMap<String, String> run(String apkPath, String sdkDir, String outputDir, int sdkVer){

        MultiMap<String, String> handlers = new HashMultiMap<String, String>();

        File apkFile = new File(apkPath);
        if(!apkFile.exists() || !apkFile.isFile()){
            System.out.println("invalid arguments");
            return handlers;
        }
        String appName = apkFile.getName();

        String gatorDir = System.getenv("GatorRoot");

        if (!new File(gatorDir).exists()){
            System.out.println("Please configure gator.");
            return handlers;
        }


        String resFolder = this.unpackResource(apkFile, outputDir);
        String androidSDK = "android-"+sdkVer;

        System.out.println("finished unpacking apk.");
//        System.exit(0);

//        String command = gatorDir.toString()+"/gator a -p \""+apkPath+"\" -client GUIHierarchyPrinterClient -outputDir \""+outputDir+"\"";

//        String command = "java -Xmx16G -cp /mnt/f/D/ResearchSpace/ResearchProjects/UMLx/facility-tools/gator/sootandroid/build/libs/sootandroid-1.0-SNAPSHOT-all.jar presto.android.Main -sootandroidDir /mnt/f/D/ResearchSpace/ResearchProjects/UMLx/facility-tools/gator/sootandroid -sdkDir /mnt/f/D/Android_SDK -listenerSpecFile /mnt/f/D/ResearchSpace/ResearchProjects/UMLx/facility-tools/gator/sootandroid/listeners.xml -wtgSpecFile /mnt/f/D/ResearchSpace/ResearchProjects/UMLx/facility-tools/gator/sootandroid/wtg.xml -resourcePath /tmp/gator-l_9nb_8u/res -manifestFile /tmp/gator-l_9nb_8u/AndroidManifest.xml -project /mnt/f/D/AndroidAnalysis/APKs/AnotherMonitor_release.apk -apiLevel android-26 -guiAnalysis -benchmarkName AntennaPod_3_18.apk -android /mnt/f/D/Android_SDK/platforms/android-26/android.jar -client GUIHierarchyPrinterClient -outputDir /mnt/f/D/ResearchSpace/ResearchProjects/UMLx/facility-tools/Android-toolkit/output";

        String command = "java -Xmx16G -cp "+gatorDir+"/sootandroid/build/libs/sootandroid-1.0-SNAPSHOT-all.jar " +
                "presto.android.Main " +
                "-sootandroidDir "+gatorDir+"/sootandroid " +
                "-sdkDir "+sdkDir+" " +
                "-listenerSpecFile "+gatorDir+"/sootandroid/listeners.xml " +
                "-wtgSpecFile "+gatorDir+"/sootandroid/wtg.xml " +
                "-resourcePath "+resFolder+"/res " +
                "-manifestFile "+resFolder+"/AndroidManifest.xml " +
                "-project "+apkPath+" " +
                "-apiLevel "+androidSDK+" " +
                "-guiAnalysis " +
                "-benchmarkName "+appName+" " +
//                "-android /mnt/f/D/Android_SDK/platforms/android-26/android.jar " +
                "-android "+sdkDir+"/platforms/"+androidSDK+"/android.jar "+
                "-client GUIHierarchyPrinterClient " +
                "-outputDir "+outputDir;

        System.out.println(command);

//        System.exit(0);

        try {
            CommandLine.run(command);
        } catch (InterruptedException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }

        String gatorFile = outputDir+"/"+appName+".xml";

            List<String[]> eventHandlers = null;
            try {
                eventHandlers = parseGatorFile(new File(gatorFile));
            } catch (SAXException e) {
                e.printStackTrace();
            } catch (ParserConfigurationException e) {
                e.printStackTrace();
            } catch (IOException e) {
                e.printStackTrace();
            }

            for (String[] eventHandler : eventHandlers) {
                String className = eventHandler[0];
                String methodName = eventHandler[1];
                String viewName = eventHandler[2];
                String activityName = eventHandler[3];

                System.out.println("gator class name:"+className);
                System.out.println("gator method name:"+methodName);

                handlers.put(className, methodName);

            }

//            System.exit(0);
        return handlers;
    }

    public List<String[]> parseGatorFile(File gatorFile) throws IOException, SAXException, ParserConfigurationException {
        Debug.v().println("parseGatorFile");

        List<String[]> eventHandlers = new ArrayList<String[]>();

        if (gatorFile == null || !gatorFile.exists()) {
            System.out.println("gator file doesn't exist.");
            return eventHandlers;
        }

        DocumentBuilderFactory dbFactory = DocumentBuilderFactory.newInstance();
        DocumentBuilder dBuilder = dbFactory.newDocumentBuilder();
        Document doc = dBuilder.parse(gatorFile);

        // optional, but recommended
        // read this -
        // http://stackoverflow.com/questions/13786607/normalization-in-dom-parsing-with-java-how-does-it-work
        doc.getDocumentElement().normalize();

        // get the first element
        Element element = doc.getDocumentElement();

        // Parse the child nodes
        for (int i = 0; i < element.getChildNodes().getLength(); i++) {
            Node childNode = element.getChildNodes().item(i);
            parseGatorNode(gatorFile, childNode, element, null, eventHandlers);
        }

        return eventHandlers;

    }

    private void parseGatorNode(File gatorFile, Node node, Node parent, Node activityNode,
                                List<String[]> eventHandlers) {
        // Debug.v().println("parseGatorNode");
        // Debug.v().println(node.getNodeName());

//        if (node.getNodeName() == null || node.getNodeName().isEmpty()) {
            // logger.warn("Encountered a null or empty node name in file %s, skipping
            // node...", layoutFile);
//            return;
//        }

        String tname = node.getNodeName().trim();
        if (tname.equals("Activity") || tname.equals("Dialog")) {
            // String activityName =
            // node.getAttributes().getNamedItem("name").getNodeValue();
            activityNode = node;

        } else if (tname.equals("EventAndHandler")) {
            String handler = node.getAttributes().getNamedItem("handler").getNodeValue();
            Debug.v().println("parseGatorNode");
            String[] handlerElements = handler.split(":");
            Debug.v().println(handler);
            if (handlerElements.length == 2) {
                String className = handlerElements[0].trim().replaceAll("[<|>]", "");
                String methodName = handlerElements[1].trim().replaceAll("[<|>]", "");
                String viewName = parent != null ? parent.getAttributes().getNamedItem("type").getNodeValue() : "";
                String activityName = activityNode != null
                        ? activityNode.getAttributes().getNamedItem("name").getNodeValue()
                        : "";
                String[] eventHandler = new String[] { className, methodName, viewName, activityName };
                eventHandlers.add(eventHandler);
            }
        }

        // Parse the child nodes
        for (int i = 0; i < node.getChildNodes().getLength(); i++) {
            Node childNode = node.getChildNodes().item(i);
            parseGatorNode(gatorFile, childNode, node, activityNode, eventHandlers);
        }
    }
}


=======
package org.umlx.utils;

import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.xml.sax.SAXException;
import soot.jimple.infoflow.android.Debug;
import soot.util.HashMultiMap;
import soot.util.MultiMap;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import java.io.File;
import java.io.IOException;
import java.util.*;


/*
command1:
java -Xmx16G -cp /mnt/f/D/ResearchSpace/ResearchProjects/UMLx/facility-tools/gator/sootandroid/build/libs/sootandroid-1.0-SNAPSHOT-all.jar presto.android.Main \
-sootandroidDir /mnt/f/D/ResearchSpace/ResearchProjects/UMLx/facility-tools/gator/sootandroid \
-sdkDir /mnt/f/D/Android_SDK \
-listenerSpecFile /mnt/f/D/ResearchSpace/ResearchProjects/UMLx/facility-tools/gator/sootandroid/listeners.xml \
-wtgSpecFile /mnt/f/D/ResearchSpace/ResearchProjects/UMLx/facility-tools/gator/sootandroid/wtg.xml \
-resourcePath /tmp/gator-hskjovz8/res \
-manifestFile /tmp/gator-hskjovz8/AndroidManifest.xml \
-project /mnt/f/D/AndroidAnalysis/APKs/AnotherMonitor_release.apk \
-apiLevel android-25 \
-guiAnalysis \
-benchmarkName AnotherMonitor_release.apk \
-android /mnt/f/D/Android_SDK/platforms/android-25/android.jar \
-client GUIHierarchyPrinterClient \
-outputDir /mnt/f/D/AndroidAnalysis/batch_analysis/AnotherMonitor-release-4

command2:
./gator a -p /mnt/f/D/AndroidAnalysis/APKs/AnotherMonitor_release.apk \
-client GUIHierarchyPrinterClient \
-outputDir /mnt/f/D/AndroidAnalysis/batch_analysis/AnotherMonitor-release-4
*/

//dump the call graph from FlowDroid
public class GatorConnector {
    private static GatorConnector theInstance;

    // time analysis begins
    private long startTime;

    private GatorConnector() throws Exception {
            //run the client of gator and derive the gator file and identify the callbacks.
    }

    public static synchronized GatorConnector v() {
        if (theInstance == null) {
            try {
                theInstance = new GatorConnector();
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        }
        return theInstance;
    }

    private String unpackResource(File apkFile, String outputDir){
        File dir = new File(outputDir + "/Resources");

        if(!dir.exists() || !dir.isDirectory()){
            dir.mkdirs();
        }

//        String command = "./tools/apktool d \""+apkFile+"\" -o \""+dir.getAbsolutePath()+"\" -f";

        String command = "java -Xmx512M -jar ./tools/apktool.jar d --no-src -o "+dir.getAbsolutePath()+" -f "+apkFile;
//        String command = "java -Xmx512M -jar ./tools/apktool.jar d -o \""+dir.getAbsolutePath()+"\" -f \""+apkFile+"\"";

        System.out.println(command);

        try {
            CommandLine.run(command);
        } catch (InterruptedException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }

//        System.exit(0);

        return dir.getAbsolutePath();

    }

    public MultiMap<String, String> run(String apkPath, String sdkDir, String outputDir, int sdkVer){

        MultiMap<String, String> handlers = new HashMultiMap<String, String>();

        File apkFile = new File(apkPath);
        if(!apkFile.exists() || !apkFile.isFile()){
            System.out.println("invalid arguments");
            return handlers;
        }
        String appName = apkFile.getName();

        String gatorDir = System.getenv("GatorRoot");

        if (!new File(gatorDir).exists()){
            System.out.println("Please configure gator.");
            return handlers;
        }


        String resFolder = this.unpackResource(apkFile, outputDir);
        String androidSDK = "android-"+sdkVer;

        System.out.println("finished unpacking apk.");
//        System.exit(0);

//        String command = gatorDir.toString()+"/gator a -p \""+apkPath+"\" -client GUIHierarchyPrinterClient -outputDir \""+outputDir+"\"";

//        String command = "java -Xmx16G -cp /mnt/f/D/ResearchSpace/ResearchProjects/UMLx/facility-tools/gator/sootandroid/build/libs/sootandroid-1.0-SNAPSHOT-all.jar presto.android.Main -sootandroidDir /mnt/f/D/ResearchSpace/ResearchProjects/UMLx/facility-tools/gator/sootandroid -sdkDir /mnt/f/D/Android_SDK -listenerSpecFile /mnt/f/D/ResearchSpace/ResearchProjects/UMLx/facility-tools/gator/sootandroid/listeners.xml -wtgSpecFile /mnt/f/D/ResearchSpace/ResearchProjects/UMLx/facility-tools/gator/sootandroid/wtg.xml -resourcePath /tmp/gator-l_9nb_8u/res -manifestFile /tmp/gator-l_9nb_8u/AndroidManifest.xml -project /mnt/f/D/AndroidAnalysis/APKs/AnotherMonitor_release.apk -apiLevel android-26 -guiAnalysis -benchmarkName AntennaPod_3_18.apk -android /mnt/f/D/Android_SDK/platforms/android-26/android.jar -client GUIHierarchyPrinterClient -outputDir /mnt/f/D/ResearchSpace/ResearchProjects/UMLx/facility-tools/Android-toolkit/output";

        String command = "java -Xmx16G -cp "+gatorDir+"/sootandroid/build/libs/sootandroid-1.0-SNAPSHOT-all.jar " +
                "presto.android.Main " +
                "-sootandroidDir "+gatorDir+"/sootandroid " +
                "-sdkDir "+sdkDir+" " +
                "-listenerSpecFile "+gatorDir+"/sootandroid/listeners.xml " +
                "-wtgSpecFile "+gatorDir+"/sootandroid/wtg.xml " +
                "-resourcePath "+resFolder+"/res " +
                "-manifestFile "+resFolder+"/AndroidManifest.xml " +
                "-project "+apkPath+" " +
                "-apiLevel "+androidSDK+" " +
                "-guiAnalysis " +
                "-benchmarkName "+appName+" " +
//                "-android /mnt/f/D/Android_SDK/platforms/android-26/android.jar " +
                "-android "+sdkDir+"/platforms/"+androidSDK+"/android.jar "+
                "-client GUIHierarchyPrinterClient " +
                "-outputDir "+outputDir;

        System.out.println(command);

//        System.exit(0);

        try {
            CommandLine.run(command);
        } catch (InterruptedException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }

        String gatorFile = outputDir+"/"+appName+".xml";

            List<String[]> eventHandlers = null;
            try {
                eventHandlers = parseGatorFile(new File(gatorFile));
            } catch (SAXException e) {
                e.printStackTrace();
            } catch (ParserConfigurationException e) {
                e.printStackTrace();
            } catch (IOException e) {
                e.printStackTrace();
            }

            for (String[] eventHandler : eventHandlers) {
                String className = eventHandler[0];
                String methodName = eventHandler[1];
                String viewName = eventHandler[2];
                String activityName = eventHandler[3];

                System.out.println("gator class name:"+className);
                System.out.println("gator method name:"+methodName);

                handlers.put(className, methodName);

            }

//            System.exit(0);
        return handlers;
    }
    

    public int numViews = 0;
    public int numScreens = 0; //activities that have at least one view associatee with.
    public int numEventHandlers = 0;

    public List<String[]> parseGatorFile(File gatorFile) throws IOException, SAXException, ParserConfigurationException {
        Debug.v().println("parseGatorFile");

        numViews = 0;
        numScreens = 0; //activities that have at least one view associatee with.
        numEventHandlers = 0;

        List<String[]> eventHandlers = new ArrayList<String[]>();
        //int viewNumber = 0;

        if (gatorFile == null || !gatorFile.exists()) {
            System.out.println("gator file doesn't exist.");
            return eventHandlers;
        }

        DocumentBuilderFactory dbFactory = DocumentBuilderFactory.newInstance();
        DocumentBuilder dBuilder = dbFactory.newDocumentBuilder();
        Document doc = dBuilder.parse(gatorFile);

        // optional, but recommended
        // read this -
        // http://stackoverflow.com/questions/13786607/normalization-in-dom-parsing-with-java-how-does-it-work
        doc.getDocumentElement().normalize();

        // get the first element
        Element element = doc.getDocumentElement();

        // Parse the child nodes
        for (int i = 0; i < element.getChildNodes().getLength(); i++) {
            Node childNode = element.getChildNodes().item(i);
            parseGatorNode(gatorFile, childNode, element, null, eventHandlers);
        }

        return eventHandlers;

    }

    private void parseGatorNode(File gatorFile, Node node, Node parent, Node activityNode,
                                List<String[]> eventHandlers) {
        // Debug.v().println("parseGatorNode");
        // Debug.v().println(node.getNodeName());

//        if (node.getNodeName() == null || node.getNodeName().isEmpty()) {
            // logger.warn("Encountered a null or empty node name in file %s, skipping
            // node...", layoutFile);
//            return;
//        }

        String tname = node.getNodeName().trim();

        if(tname.equals("Dialog")){
            numViews++;
        }
        else if(tname.equals("View")){
            numViews++;

            if(parent.getNodeName().trim() == "Activity"){
                numScreens++;
            }

        }
        else if (tname.equals("Activity")) {
            // String activityName =
            // node.getAttributes().getNamedItem("name").getNodeValue();
            activityNode = node;

        } else if (tname.equals("EventAndHandler")) {
            String handler = node.getAttributes().getNamedItem("handler").getNodeValue();
            Debug.v().println("parseGatorNode");
            String[] handlerElements = handler.split(":");
            Debug.v().println(handler);
            if (handlerElements.length == 2) {
                String className = handlerElements[0].trim().replaceAll("[<|>]", "");
                String methodName = handlerElements[1].trim().replaceAll("[<|>]", "");
                String viewName = parent != null ? parent.getAttributes().getNamedItem("type").getNodeValue() : "";
                String activityName = activityNode != null
                        ? activityNode.getAttributes().getNamedItem("name").getNodeValue()
                        : "";
                String[] eventHandler = new String[] { className, methodName, viewName, activityName };
                eventHandlers.add(eventHandler);
            }

            numEventHandlers++;
        }

        // Parse the child nodes
        for (int i = 0; i < node.getChildNodes().getLength(); i++) {
            Node childNode = node.getChildNodes().item(i);
            parseGatorNode(gatorFile, childNode, node, activityNode, eventHandlers);
        }
    }
}


>>>>>>> 51347c4a2e1047226912f8b6a7b254614e344ef8
=======
package org.umlx.utils;

import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.xml.sax.SAXException;
import soot.jimple.infoflow.android.Debug;
import soot.util.HashMultiMap;
import soot.util.MultiMap;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import java.io.File;
import java.io.IOException;
import java.util.*;


/*
command1:
java -Xmx16G -cp /mnt/f/D/ResearchSpace/ResearchProjects/UMLx/facility-tools/gator/sootandroid/build/libs/sootandroid-1.0-SNAPSHOT-all.jar presto.android.Main \
-sootandroidDir /mnt/f/D/ResearchSpace/ResearchProjects/UMLx/facility-tools/gator/sootandroid \
-sdkDir /mnt/f/D/Android_SDK \
-listenerSpecFile /mnt/f/D/ResearchSpace/ResearchProjects/UMLx/facility-tools/gator/sootandroid/listeners.xml \
-wtgSpecFile /mnt/f/D/ResearchSpace/ResearchProjects/UMLx/facility-tools/gator/sootandroid/wtg.xml \
-resourcePath /tmp/gator-hskjovz8/res \
-manifestFile /tmp/gator-hskjovz8/AndroidManifest.xml \
-project /mnt/f/D/AndroidAnalysis/APKs/AnotherMonitor_release.apk \
-apiLevel android-25 \
-guiAnalysis \
-benchmarkName AnotherMonitor_release.apk \
-android /mnt/f/D/Android_SDK/platforms/android-25/android.jar \
-client GUIHierarchyPrinterClient \
-outputDir /mnt/f/D/AndroidAnalysis/batch_analysis/AnotherMonitor-release-4

command2:
./gator a -p /mnt/f/D/AndroidAnalysis/APKs/AnotherMonitor_release.apk \
-client GUIHierarchyPrinterClient \
-outputDir /mnt/f/D/AndroidAnalysis/batch_analysis/AnotherMonitor-release-4
*/

//dump the call graph from FlowDroid
public class GatorConnector {
    private static GatorConnector theInstance;

    // time analysis begins
    private long startTime;

    private GatorConnector() throws Exception {
            //run the client of gator and derive the gator file and identify the callbacks.
    }

    public static synchronized GatorConnector v() {
        if (theInstance == null) {
            try {
                theInstance = new GatorConnector();
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        }
        return theInstance;
    }

    private String unpackResource(File apkFile, String outputDir){
        File dir = new File(outputDir + "/Resources");

        if(!dir.exists() || !dir.isDirectory()){
            dir.mkdirs();
        }

//        String command = "./tools/apktool d \""+apkFile+"\" -o \""+dir.getAbsolutePath()+"\" -f";

        String command = "java -Xmx512M -jar ./tools/apktool.jar d --no-src -o "+dir.getAbsolutePath()+" -f "+apkFile;
//        String command = "java -Xmx512M -jar ./tools/apktool.jar d -o \""+dir.getAbsolutePath()+"\" -f \""+apkFile+"\"";

        System.out.println(command);

        try {
            CommandLine.run(command);
        } catch (InterruptedException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }

//        System.exit(0);

        return dir.getAbsolutePath();

    }

    public MultiMap<String, String> run(String apkPath, String sdkDir, String outputDir, int sdkVer){

        MultiMap<String, String> handlers = new HashMultiMap<String, String>();

        File apkFile = new File(apkPath);
        if(!apkFile.exists() || !apkFile.isFile()){
            System.out.println("invalid arguments");
            return handlers;
        }
        String appName = apkFile.getName();

        String gatorDir = System.getenv("GatorRoot");

        if (!new File(gatorDir).exists()){
            System.out.println("Please configure gator.");
            return handlers;
        }


        String resFolder = this.unpackResource(apkFile, outputDir);
        String androidSDK = "android-"+sdkVer;

        System.out.println("finished unpacking apk.");
//        System.exit(0);

//        String command = gatorDir.toString()+"/gator a -p \""+apkPath+"\" -client GUIHierarchyPrinterClient -outputDir \""+outputDir+"\"";

//        String command = "java -Xmx16G -cp /mnt/f/D/ResearchSpace/ResearchProjects/UMLx/facility-tools/gator/sootandroid/build/libs/sootandroid-1.0-SNAPSHOT-all.jar presto.android.Main -sootandroidDir /mnt/f/D/ResearchSpace/ResearchProjects/UMLx/facility-tools/gator/sootandroid -sdkDir /mnt/f/D/Android_SDK -listenerSpecFile /mnt/f/D/ResearchSpace/ResearchProjects/UMLx/facility-tools/gator/sootandroid/listeners.xml -wtgSpecFile /mnt/f/D/ResearchSpace/ResearchProjects/UMLx/facility-tools/gator/sootandroid/wtg.xml -resourcePath /tmp/gator-l_9nb_8u/res -manifestFile /tmp/gator-l_9nb_8u/AndroidManifest.xml -project /mnt/f/D/AndroidAnalysis/APKs/AnotherMonitor_release.apk -apiLevel android-26 -guiAnalysis -benchmarkName AntennaPod_3_18.apk -android /mnt/f/D/Android_SDK/platforms/android-26/android.jar -client GUIHierarchyPrinterClient -outputDir /mnt/f/D/ResearchSpace/ResearchProjects/UMLx/facility-tools/Android-toolkit/output";

        String command = "java -Xmx16G -cp "+gatorDir+"/sootandroid/build/libs/sootandroid-1.0-SNAPSHOT-all.jar " +
                "presto.android.Main " +
                "-sootandroidDir "+gatorDir+"/sootandroid " +
                "-sdkDir "+sdkDir+" " +
                "-listenerSpecFile "+gatorDir+"/sootandroid/listeners.xml " +
                "-wtgSpecFile "+gatorDir+"/sootandroid/wtg.xml " +
                "-resourcePath "+resFolder+"/res " +
                "-manifestFile "+resFolder+"/AndroidManifest.xml " +
                "-project "+apkPath+" " +
                "-apiLevel "+andFroidSDK+" " +
                "-guiAnalysis " +
                "-benchmarkName "+appName+" " +
//                "-android /mnt/f/D/Android_SDK/platforms/android-26/android.jar " +
                "-android "+sdkDir+"/platforms/"+androidSDK+"/android.jar "+
                "-client GUIHierarchyPrinterClient " +
                "-outputDir "+outputDir;

        System.out.println(command);

//        System.exit(0);

        try {
            CommandLine.run(command);
        } catch (InterruptedException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }

        String gatorFile = outputDir+"/"+appName+".xml";

            List<String[]> eventHandlers = null;
            try {
                eventHandlers = parseGatorFile(new File(gatorFile));
            } catch (SAXException e) {
                e.printStackTrace();
            } catch (ParserConfigurationException e) {
                e.printStackTrace();
            } catch (IOException e) {
                e.printStackTrace();
            }

            for (String[] eventHandler : eventHandlers) {
                String className = eventHandler[0];
                String methodName = eventHandler[1];
                String viewName = eventHandler[2];
                String activityName = eventHandler[3];

                System.out.println("gator class name:"+className);
                System.out.println("gator method name:"+methodName);

                handlers.put(className, methodName);

            }

//            System.exit(0);
        return handlers;
    }
    

    public int numViews = 0;
    public int numScreens = 0; //activities that have at least one view associatee with.
    public int numEventHandlers = 0;

    public List<String[]> parseGatorFile(File gatorFile) throws IOException, SAXException, ParserConfigurationException {
        Debug.v().println("parseGatorFile");

        numViews = 0;
        numScreens = 0; //activities that have at least one view associatee with.
        numEventHandlers = 0;

        List<String[]> eventHandlers = new ArrayList<String[]>();
        //int viewNumber = 0;

        if (gatorFile == null || !gatorFile.exists()) {
            System.out.println("gator file doesn't exist.");
            return eventHandlers;
        }

        DocumentBuilderFactory dbFactory = DocumentBuilderFactory.newInstance();
        DocumentBuilder dBuilder = dbFactory.newDocumentBuilder();
        Document doc = dBuilder.parse(gatorFile);

        // optional, but recommended
        // read this -
        // http://stackoverflow.com/questions/13786607/normalization-in-dom-parsing-with-java-how-does-it-work
        doc.getDocumentElement().normalize();

        // get the first element
        Element element = doc.getDocumentElement();

        // Parse the child nodes
        for (int i = 0; i < element.getChildNodes().getLength(); i++) {
            Node childNode = element.getChildNodes().item(i);
            parseGatorNode(gatorFile, childNode, element, null, eventHandlers);
        }

        return eventHandlers;

    }

    private void parseGatorNode(File gatorFile, Node node, Node parent, Node activityNode,
                                List<String[]> eventHandlers) {
        // Debug.v().println("parseGatorNode");
        // Debug.v().println(node.getNodeName());

//        if (node.getNodeName() == null || node.getNodeName().isEmpty()) {
            // logger.warn("Encountered a null or empty node name in file %s, skipping
            // node...", layoutFile);
//            return;
//        }

        String tname = node.getNodeName().trim();

        if(tname.equals("Dialog")){
            numViews++;
        }
        else if(tname.equals("View")){
            numViews++;

            if(parent.getNodeName().trim() == "Activity"){
                numScreens++;
            }

        }
        else if (tname.equals("Activity")) {
            // String activityName =
            // node.getAttributes().getNamedItem("name").getNodeValue();
            activityNode = node;

        } else if (tname.equals("EventAndHandler")) {
            String handler = node.getAttributes().getNamedItem("handler").getNodeValue();
            Debug.v().println("parseGatorNode");
            String[] handlerElements = handler.split(":");
            Debug.v().println(handler);
            if (handlerElements.length == 2) {
                String className = handlerElements[0].trim().replaceAll("[<|>]", "");
                String methodName = handlerElements[1].trim().replaceAll("[<|>]", "");
                String viewName = parent != null ? parent.getAttributes().getNamedItem("type").getNodeValue() : "";
                String activityName = activityNode != null
                        ? activityNode.getAttributes().getNamedItem("name").getNodeValue()
                        : "";
                String[] eventHandler = new String[] { className, methodName, viewName, activityName };
                eventHandlers.add(eventHandler);
            }

            numEventHandlers++;
        }

        // Parse the child nodes
        for (int i = 0; i < node.getChildNodes().getLength(); i++) {
            Node childNode = node.getChildNodes().item(i);
            parseGatorNode(gatorFile, childNode, node, activityNode, eventHandlers);
        }
    }
}


>>>>>>> 8e22dd3a45f4d9f3b5be12098ac584490ea37c6e
