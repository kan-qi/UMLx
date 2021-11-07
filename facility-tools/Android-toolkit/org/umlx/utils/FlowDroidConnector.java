package org.umlx.utils;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.umlx.Configs;
import org.umlx.DebugOutput;
import org.umlx.writers.CallbackWriter;
import org.xmlpull.v1.XmlPullParserException;
import soot.*;
import soot.jimple.infoflow.android.SetupApplication;
import soot.jimple.infoflow.android.callbacks.CallbackDefinition;
import soot.options.Options;
import soot.util.HashMultiMap;
import soot.util.MultiMap;

import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;

//dump the call graph from FlowDroid
public class FlowDroidConnector {
    private static FlowDroidConnector theInstance;

    // time analysis begins
    private long startTime;

    private FlowDroidConnector() throws Exception {
        //set the parameters of FlowDroid.
    }

    private static class FlowDroidApp extends SetupApplication{

        public FlowDroidApp(String androidJar, String apkFileLocation) {
            super(androidJar, apkFileLocation);

        }

        public MultiMap<SootClass, CallbackDefinition> getCallbackMethods(){
            return this.callbackMethods;
        }
    }

    public MultiMap<String, String> run(String project, String sdkDir, String outputDir){

        String flowDroidCallbacksPath = outputDir+"/flowdroid-callbacks.json";

        String workDir = System.getProperty("user.dir");
        //String classPath = workDir+"/out/production/Android-toolkit:"+workDir+"/libs/*";

        try {
//          org.umlx.utils.CommandLine.run("java -cp \"out/production/Android-toolkit;libs/*\" org.umlx.utils.FlowDroidConnector \""+project+"\" \""+sdkDir+"\" \""+outputDir+"\"");
//          CommandLine.run("java -cp "+classPath+" org.umlx.utils.FlowDroidConnector \""+project+"\" \""+sdkDir+"\" \""+outputDir+"\"");
//            CommandLine.run("java -cp ./out/production/Android-toolkit:./libs/* org.umlx.utils.FlowDroidConnector "+project+" "+sdkDir+" "+outputDir);
//            CommandLine.run("java -cp ./facility-tools/Android-toolkit/out/production/Android-toolkit:./facility-tools/Android-toolkit/libs/* org.umlx.utils.FlowDroidConnector "+project+" "+sdkDir+"/platforms "+outputDir);
            //CommandLine.run("java -cp ./facility-tools/Android-toolkit/bin:./facility-tools/Android-toolkit/libs/* org.umlx.utils.FlowDroidConnector "+project+" "+sdkDir+"/platforms "+outputDir);
            CommandLine.run("java -cp ./facility-tools/Android-toolkit/out/production/Android-toolkit:./facility-tools/Android-toolkit/libs/* org.umlx.utils.FlowDroidConnector "+project+" "+sdkDir+"/platforms "+outputDir);

        } catch (InterruptedException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }

        MultiMap<String, String> handlers = new HashMultiMap<String, String>();
        JSONParser parser = new JSONParser();

       File flowDroidCallbacksFile = new File(flowDroidCallbacksPath);

       if(!flowDroidCallbacksFile.exists()){
           return handlers;
       }

        try {
            Object obj = parser.parse(new FileReader(flowDroidCallbacksFile));
            JSONObject jsonObject = (JSONObject) obj;

            System.out.println("callbacks:");

            for(Object key: jsonObject.keySet()){
                String keyStr = (String)key;
                JSONArray keyvalue = (JSONArray)jsonObject.get(keyStr);
                for(Object val : keyvalue.toArray()){
                    String valStr = (String)val;
                    handlers.put(keyStr, valStr);
                }

            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        return handlers;
    }

    //output the call graph to JSON formate
    private static void dumpCallbackDefs(MultiMap<SootClass, CallbackDefinition> callbacks){
        Map<String, Set<String>> map = new HashMap<String, Set<String>>();

        for (SootClass callbackClass : callbacks.keySet()) {
            Set<CallbackDefinition> callbackDefinitions = callbacks.get(callbackClass);
            Set<String> calledMtds = new HashSet<String>();
            for (CallbackDefinition callbackDef : callbackDefinitions) {
                if(callbackClass == callbackDef.getTargetMethod().getDeclaringClass()) {
                        calledMtds.add(callbackDef.getTargetMethod().getSignature());
                        DebugOutput.v().println("dumpCallbackDefs1:");
                }
            }
            map.put(callbackClass.getName(), calledMtds);
        }

        Gson gson = new GsonBuilder().disableHtmlEscaping().create();
        String json = gson.toJson(map);
        CallbackWriter.v().print(json);
    }

    public static synchronized FlowDroidConnector v() {
        if (theInstance == null) {
            try {
                theInstance = new FlowDroidConnector();
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        }
        return theInstance;
    }

    private static void printUsage(){
        System.out.println("Incorrect arguments: [0] = apk-file, [1] = android-jar-directory, [2] = output-directory");
    }

    public static void main(String[] args){
        if (args.length < 3){
            printUsage();
            return;
        }

        String project = args[0];
        String sdkDir = args[1];
        String outputDir = args[2];

        Configs.outputDir = outputDir;

        File apkFile = new File(project);
        if(!apkFile.exists() || !apkFile.isFile()){
            System.out.println("invalid arguments");
            return;
        }
        String appName = apkFile.getName();

        System.out.println(appName);

        String extension = apkFile.getName().substring(apkFile.getName().lastIndexOf("."));
        if (!extension.equals(".apk") || !apkFile.exists()){
            DebugOutput.v().println("apk-file not exists "+ apkFile.getName());
            return;
        }

        File sdkFile = new File(sdkDir);
        if (!sdkFile.exists()){
            DebugOutput.v().println("android-jar-directory not exists "+ sdkFile.getName());
            return;
        }

        Path gatorDir = Paths.get(System.getenv("GatorRoot"));

        Path sourceSinkPath = Paths.get(gatorDir.toString(), "SourcesAndSinks.txt");
        File sourceSinkFile = sourceSinkPath.toFile();
        if (!sourceSinkFile.exists()){
            DebugOutput.v().println("SourcesAndSinks.txt not exists");
            return;
        }

        Path callbackPath = Paths.get(gatorDir.toString(), "AndroidCallbacks.txt");
        File callbackFile = callbackPath.toFile();
        if (!callbackFile.exists()){
            DebugOutput.v().println("AndroidCallbacks.txt not exists");
            return;
        }

        FlowDroidApp app = new FlowDroidApp(sdkDir, project);
        app.setOutputDir(outputDir);

        Path gatorFilePath = Paths.get(outputDir, appName + ".xml");
        File gatorFile = gatorFilePath.toFile();
        if(!gatorFile.exists()) {
            DebugOutput.v().println("Gator file doesn't exist...");
        }
        else {
            app.setGatorFile(gatorFile.getAbsolutePath());
        }


        System.out.println("Setup Application...");
        DebugOutput.v().println("Setup Application...");
        DebugOutput.v().println("platforms: "+sdkDir+" project: "+project);

        soot.G.reset();
        Options.v().set_src_prec(Options.src_prec_apk);
        Options.v().set_process_dir(Collections.singletonList(project));
        Options.v().set_android_jars(sdkDir);
        Options.v().set_whole_program(true);
        Options.v().set_allow_phantom_refs(true);
        Options.v().set_output_format(Options.output_format_none);
        Options.v().setPhaseOption("cg.spark", "on");
        Options.v().set_process_multiple_dex(true);
        Scene.v().loadNecessaryClasses();

        app.setCallbackFile(callbackPath.toAbsolutePath().toString());

        try {
            System.out.println("Flowdroid start...");
            app.runInfoflow(sourceSinkPath.toAbsolutePath().toString());
        } catch (IOException e1) {
            e1.printStackTrace();
        } catch (XmlPullParserException e1) {
            e1.printStackTrace();
        }

        System.out.println("Flowdroid end...");

        MultiMap<SootClass, CallbackDefinition> callbacks = app.getCallbackMethods();

        dumpCallbackDefs(callbacks);
    }



}


