package org.umlx;

import java.util.List;

public class Configs {
    public static String outputDir;
    public static String appName;
    public static String project;
    public static String sdkDir;
    public static int sdkVer;
    public static String appPkg;

    public static List<String> libraryPackages = null;

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
