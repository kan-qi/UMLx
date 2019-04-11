package org.umlx.utils;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;

class StreamGobbler extends Thread
{
    InputStream is;
    String type;

    StreamGobbler(InputStream is, String type)
    {
        this.is = is;
        this.type = type;
    }

    public void run()
    {
        try
        {
            InputStreamReader isr = new InputStreamReader(is);
            BufferedReader br = new BufferedReader(isr);
            String line=null;
            while ( (line = br.readLine()) != null)
                System.out.println(type + ">" + line);
        } catch (IOException ioe)
        {
            ioe.printStackTrace();
        }
    }
}

public class CommandLine {
    public static void run(String command) throws InterruptedException, IOException {
        System.out.println("running: "+command);
        final Process p = Runtime.getRuntime().exec(command);

//        new Thread(new Runnable() {
//            public void run() {
//                BufferedReader input = new BufferedReader(new InputStreamReader(p.getErrorStream()));
//                String line = null;
//
//                try {
//                    while ((line = input.readLine()) != null)
//                        System.out.println(line);
//                } catch (IOException e) {
//                    e.printStackTrace();
//                }
//            }
//        }).start();
//
//        p.waitFor();

        // any error message?
        StreamGobbler errorGobbler = new
                StreamGobbler(p.getErrorStream(), "ERROR");

        // any output?
        StreamGobbler outputGobbler = new
                StreamGobbler(p.getInputStream(), "OUTPUT");

        // kick them off
        errorGobbler.start();
        outputGobbler.start();

        // any error???
        int exitVal = p.waitFor();
        System.out.println("ExitValue: " + exitVal);
    }
}
