package org.umlx.utils;

import org.xml.sax.SAXException;
import soot.jimple.infoflow.android.Debug;
import soot.util.HashMultiMap;
import soot.util.MultiMap;

import javax.xml.parsers.ParserConfigurationException;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;


//dump the call graph from FlowDroid
public class CallbackScannerConnector {
    private static CallbackScannerConnector theInstance;

    // time analysis begins
    private long startTime;

    private CallbackScannerConnector() throws Exception {
            //run the client of gator and derive the gator file and identify the callbacks.
    }

    public static synchronized CallbackScannerConnector v() {
        if (theInstance == null) {
            try {
                theInstance = new CallbackScannerConnector();
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        }
        return theInstance;
    }

    public MultiMap<String, String> run(String projectDir, String handlersFileName) {

        MultiMap<String, String> handlers = new HashMultiMap<String, String>();

        String handlersFile = projectDir+"/" + handlersFileName;

        List<String[]> eventHandlers = null;
        try {
            eventHandlers = parseHandlersFile(new File(handlersFile));
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

            System.out.println("class name:" + className);
            System.out.println("method name:" + methodName);

            handlers.put(className, methodName);

        }
//            System.exit(0);
        return handlers;
    }



    public List<String[]> parseHandlersFile(File handlersFile) throws IOException, SAXException, ParserConfigurationException {
        Debug.v().println("parseHandlersFile");

        List<String[]> eventHandlers = new ArrayList<String[]>();
        //int viewNumber = 0;

      // eventHandlers.add(new String[]{"com.commafeed.CommaFeedApplication", "java.lang.String getName()"});
//        eventHandlers.add(new String[]{"com.commafeed.CommaFeedApplication", "void <init>()"});
//        eventHandlers.add(new String[]{"com.commafeed.CommaFeedApplication", "void initialize(io.dropwizard.setup.Bootstrap)"});
//        eventHandlers.add(new String[]{"com.commafeed.CommaFeedApplication", "void main(java.lang.String[])"});

        if (handlersFile == null || !handlersFile.exists()) {
            return eventHandlers;
        }


        try {

            BufferedReader b = new BufferedReader(new FileReader(handlersFile));

            String readLine = "";

//            System.out.println("Reading file using Buffered Reader");

            while ((readLine = b.readLine()) != null) {
                readLine = readLine.replaceAll("<|>", "");
                String[] parts = readLine.split(":");
                eventHandlers.add(new String[]{parts[0].trim(), parts[1].trim()});
            }

        } catch (IOException e) {
            e.printStackTrace();
        }

        return eventHandlers;

    }
}


