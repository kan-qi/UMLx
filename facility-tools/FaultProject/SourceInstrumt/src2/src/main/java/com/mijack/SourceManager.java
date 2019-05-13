package com.mijack;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.MappingIterator;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectReader;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.mijack.meta.ClassMeta;
import com.mijack.meta.FunctionMeta;

import java.io.FileReader;
import java.io.IOException;
import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * @auhor Mr.Yuan
 * @date 2017/4/10
 */
public class SourceManager {
    private static final SourceManager instance = new SourceManager();
    public static final String[] BASE_TYPES = new String[]{"void", "int", "boolean", "float", "byte", "char", "double", "long"};
    //éœ€è¦�æ��ä¾›ä¸€ä¸‹å‡ ä¸ªæ–¹é�¢çš„å¯¹åº”å…³ç³»
    //package->class
    //class->package
    //class->classmeta
    ListHashMap<String, String> package2Classes = new ListHashMap<>();
    private Map<String, String> classNameMapPackageName = new HashMap<>();
    //framework class set
    Set<String> frameworkClasses = new HashSet<>();

    public static SourceManager v() {
        return instance;
    }

    private SourceManager() {
        ObjectMapper mapper = new ObjectMapper();
        ObjectReader reader = mapper.reader();
//        try {
//            //åŠ è½½framework class
//            ObjectNode tree = (ObjectNode) reader.readTree(new FileReader("F:\\IdeaProject\\FaultProject\\class.json"));
//            Iterator<Map.Entry<String, JsonNode>> fields = tree.fields();
//            while (fields.hasNext()) {
//                Map.Entry<String, JsonNode> next = fields.next();
//                String packageName = next.getKey();
//                ArrayNode value = (ArrayNode) next.getValue();
//                List<String> list = new ArrayList<>();
//                Iterator<JsonNode> iterator = value.iterator();
//                while (iterator.hasNext()) {
//                    String className = iterator.next().asText();
//                    list.add(className);
//                    addClassData(packageName, className);
//                }
//                frameworkClasses.addAll(list);
//            }
//        } catch (IOException e) {
//            e.printStackTrace();
//        }
    }

    public void addClassData(String packageName, String className) {
        classNameMapPackageName.put(className, packageName);
        package2Classes.put(packageName, className);
    }

    public void addClass(String packageName, List<ClassMeta> classMetas) {
        if (Utils.isEmpty(classMetas) || Utils.isEmpty(packageName)) {
            return;
        }
        classMetas.stream().forEach(c -> addClassData(c.getPackageName(), c.getClassName()));
    }

    public static final Pattern PATTERN_ARRAY = Pattern.compile("^.*((\\s*\\[\\s*\\])+|\\.\\.\\.)\\s*$");

    /**
     * @param type å�¯ä»¥æ˜¯array
     * @param f
     * @return
     */
    public String queryFullTypeName(String type, FunctionMeta f) {
        if (PATTERN_ARRAY.matcher(type).matches()) {
            //is array
            System.out.println("find array in " + f.getJvmFunctionSign());
            int arrayDimension = 0;
            String arrayType = null;
            if (type.endsWith("...")) {
                arrayDimension = 1;
                arrayType = type.substring(0, type.length() - 3);
            } else {
                arrayDimension = 0;
                StringBuilder sb = new StringBuilder();
                for (int index = 0; index < type.length(); index++) {
                    char c = type.charAt(index);
                    if (c == '[') {
                        arrayDimension++;
                    }
                    if (arrayDimension == 0 && !Character.isSpaceChar(c)) {
                        sb.append(c);
                    }
                }
                arrayType = sb.toString();
            }
            StringBuilder sb = new StringBuilder();
            for (int index = 0; index < arrayDimension; index++) {
                sb.append("[");
            }
            sb.append((!f.isGenericType(arrayType) ? SourceManager.v().queryFullName(arrayType, f) : "java.lang.Object"));
            return sb.toString();
        } else {
            return !f.isGenericType(type) ? SourceManager.v().queryFullName(type, f) : "java.lang.Object";
        }
    }

    /**
     * @param type classçš„ç±»å��ï¼Œä¸�å�«æ•°ç»„ç±»åž‹
     * @param f
     * @return
     */
    private String queryFullName(String type, FunctionMeta f) {
        //æŸ¥æ‰¾åŽŸåˆ™
        //ä¼˜å…ˆæŸ¥çœ‹ç±»æ–‡ä»¶ã€�import classã€�å�ŒåŒ…å��ä»¥å�Šjava.lang.*
        JavaFileObject javaFileObject = f.getClassMeta().getJavaFileObject();
        String currentPackageName = javaFileObject.getPackageName();
        //æŽ’é™¤åŸºæœ¬ç±»åž‹
        if (Utils.contains(BASE_TYPES, type)) {
            return type;
        }
        //ä½¿ç”¨å®Œæ•´çš„classå��ç§°
        if (classNameMapPackageName.containsKey(type)) {
            return type;
        }
        //ä½¿ç”¨å�Œä¸€æ–‡ä»¶å†…çš„class
        List<String> collect = javaFileObject.getClassMetas().stream()
                .filter((c) -> c.getClassName().endsWith("$"+type)||c.getClassName().endsWith("."+type))
                .map((c) -> c.getClassName())
                .distinct()
                .collect(Collectors.toList());
        if (collect.size() > 1) {
            throw new IllegalStateException("find two classes, which has same class name but belongs to the different package ,for " + type);
        }
        if (collect.size() == 1) {
            return collect.get(0);
        }
        //ä½¿ç”¨classçš„
        //æ³¨æ„�import java class çš„package.name.*
        List<String> mayBeResult = new ArrayList<>();
        for (String importStmt : javaFileObject.getImportClasses()) {
            //åˆ¤æ–­importæ˜¯å�¦æ˜¯import *.*;æ¨¡å¼�
            if (importStmt.endsWith("*")) {
                String importPackageName = importStmt.substring(0, importStmt.length() - ".*".length());
                //æŸ¥æ‰¾åŒ…ä¸‹çš„æ‰€æœ‰çš„class
                List<String> classes = package2Classes.getList(importPackageName);
                if (classes != null) {
                    for (String clazz : classes) {
                        if (clazz.endsWith(clazz)) {
                            mayBeResult.add(importPackageName + "." + type);
                        }
                    }
                }
            } else {
                //åŒºåˆ†ä»¥ä¸‹ä¸¤ç§�æƒ…å†µï¼š
                // 0ï¼‰import android.view.View; View
                // 1ï¼‰import android.view.View.OnClickListener; OnClickListener
                // 2ï¼‰import android.view.View.OnClickListener; View.OnClickListener
                // 3ï¼‰import android.view.View; View.OnClickListener
                String[] split = Utils.splitToArray(type, ".");
                String target = null;
                for (int i = 0; i < Utils.length(split); i++) {
                    if (target == null) {
                        target = split[i];
                    } else {
                        target += "." + split[i];
                    }
                    if (importStmt.endsWith(target)) {
                        int find = i;
                        String result = importStmt;
                        for (int j = find + 1; j < Utils.length(split); j++) {
                            result += "." + split[j];
                        }
                        return result;
                    }
                }
            }
        }
        if (!mayBeResult.isEmpty()) {
            return mayBeResult.stream().filter(s -> Utils.length(s) > 0)
                    .max((s1, s2) -> Utils.whichIsLonger(s1, s2))
                    .get();
        }
        //ä¼˜å…ˆé€‰å�–å®Œæ•´åŒ…å��çš„ï¼Œå�Žé€‰å�–package.*çš„
//ä½¿ç”¨çš„å�Œä¸€ä¸ªåŒ…å��ä¸‹çš„Class
        if (isPackageContains(type, currentPackageName)) {
            return currentPackageName + "." + type;
        }
        //åˆ¤æ–­æ˜¯å�¦æ˜¯java.lang.*ä¸‹çš„æ–‡ä»¶
        if (isPackageContains(type, "java.lang")) {
            return "java.lang." + type;
        }
        System.err.println("we don't find the full-name type for type[" + type + "]");
        return type;
    }

    private boolean isPackageContains(String notFullname, String packageName) {
        String className = packageName + "." + notFullname;
        List<String> list = package2Classes.getList(packageName);
        return Utils.isEmpty(list) ? false : list.contains(className);
    }
}
