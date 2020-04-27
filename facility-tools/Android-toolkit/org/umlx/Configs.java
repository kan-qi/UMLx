package org.umlx;

import org.json.simple.JSONArray;
import org.json.simple.parser.JSONParser;

import java.io.File;
import java.io.FileReader;
import java.util.ArrayList;
import java.util.List;

public class Configs {
    public static String outputDir;
    public static String appName;
    public static String project;
    public static String sdkDir;
    public static int sdkVer;
    public static String appPkg;

    public static List<String> libraryPackages = null;

    public static List<String> excludingSuffice = new ArrayList<String>();

    static{

        File suffixFile = new File("./facility-tools/Android-toolkit/package-suffice.json");

        if(suffixFile.exists()){
        try {
            JSONParser parser = new JSONParser();
            Object obj = parser.parse(new FileReader(suffixFile));
            JSONArray jsonArray = (JSONArray)obj;

            System.out.println("package suffice:");

            for(Object item : jsonArray.toArray()){
                String packageSuffix = item.toString();
                System.out.println(packageSuffix);
                excludingSuffice.add(packageSuffix);
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
        }

    }

    public static boolean isLibraryClass(String className) {
        if (libraryPackages == null || libraryPackages.isEmpty()) {
            if(className.startsWith(appPkg)){
                return false;
            }
            else{
                return true;
            }
        }
        if(className.startsWith("java")) {
            return true;
        }
        for (String pkg : libraryPackages) {
            if (pkg.equals(className) ||
                    ((pkg.endsWith(".*") || pkg.endsWith("$*")) &&
                            className.startsWith(pkg.substring(0, pkg.length() - 1)))
            ) {
                return true;
            }
        }
        return false;
    }

    public static boolean isGeneratedClass(String name) {
        // TODO Auto-generated method stub
        if(name.startsWith("androidx") || name.startsWith("android")) {
            return true;
        }

        return false;
    }
}
