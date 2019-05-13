package com.mijack;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.dom4j.*;
import org.dom4j.io.SAXReader;

import java.io.*;
import java.nio.charset.Charset;
import java.util.*;
import java.util.function.BiFunction;
import java.util.function.BinaryOperator;
import java.util.function.Predicate;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * å¯¹Androidçš„Javaæº�æ–‡ä»¶è¿›è¡Œæ�’æ¡©ï¼Œæ��ä¾›ä»¥ä¸‹ä¸¤ä¸ªåŠŸèƒ½<br/>
 * <ll>
 * <li>é’ˆå¯¹ifè¯­å�¥çš„æ�’æ¡©</li>
 * <li>é’ˆå¯¹æ–¹æ³•æ•´ä½“çš„aopæ‹¦æˆª</li>
 * </ll>
 * <br/>
 * è¾“å…¥<br/>
 * -i:å¾…å¤„ç�†æº�æ–‡ä»¶æ‰€åœ¨çš„æ–‡ä»¶å¤¹<br/>
 * -o:è¾“å‡ºçš„ç›®æ ‡æ–‡ä»¶å¤¹<br/>
 * -f:æ˜¯å�¦è¦†ç›–åŽŸæ�¥æ–‡ä»¶<br/> [å�¯é€‰]
 *
 * @author Mr.Yuan
 * @since 2017/1/19.
 */
public class SourceChanger {
    private static final boolean DEBUG = false;
    private static Logger logger = LogManager.getLogger(SourceChanger.class);
    private List<File> files = new ArrayList();
    private Map<String, JavaFileObject> javaFileObjectMap = new HashMap<>();
    public static final Pattern PATTERN = Pattern.compile("^.*(\\.java\\.xml)$", Pattern.CASE_INSENSITIVE);
    public static final Pattern PATTERN_ARRAY = Pattern.compile("^.*((\\s*\\[\\s*\\])+|\\.\\.\\.)\\s*$");

    /**
     * @param args
     * @throws Exception
     */
    public static void main(String[] args) throws Exception {
    	System.out.println("main function");
        logger.traceEntry();
        Config config = Config.getInstance();
        for (int i = 0; args != null && i < args.length; i++) {
            String arg = args[i];
            switch (arg) {
                case "-java-input":
                    config.setInput(args[++i]);
                    break;
                case "-java-output":
                    config.setJavaOutput(args[++i]);
                    break;
                case "-xml-ouput":
                    config.setXmlOutput(args[++i]);
                    break;
                case "-f":
                    config.setForceWrite(true);
                    break;
                case "-install":
                    config.setInstallCommand(args[++i]);
                    break;
            }
        }
//        config.setJavaOutput("output");
        if (Utils.isEmpty(config.getInput()) ) {
            logger.info("no input");
            logger.traceExit();
            return;
        }
        if ( Utils.isEmpty(config.getJavaOutput())){
            config.setJavaOutput(config.getInput());
        }
        String inputDir = Config.getInstance().getInput();
//        String workspaceDir = "workspace";
        //list java file
        File workspace = new File(Config.getWorkspacePath());
        if (workspace.exists()) {
            workspace.delete();
        }
        workspace.mkdirs();
        List<String> files = listJavaFile(inputDir).stream()//.filter(s -> s.contains("DemoActivity"))
                .collect(Collectors.toList());
        List<String> xmlFiles = files.stream().distinct()
                .map(file -> Command.transformJavaFile(file, inputDir, Config.getWorkspacePath()))
                .reduce(new ArrayList<String>(),
                        (BiFunction<List<String>, String, List<String>>) (strings, s) -> {
                            strings.add(s);
                            return strings;
                        },
                        (strings, strings2) -> {
                            strings.addAll(strings);
                            return strings;
                        }).stream().collect(Collectors.toList());
        xmlFiles.stream().forEach(System.out::println);

        SourceChanger sourceChanger = new SourceChanger();
        //è¯»å�–å¯¹åº”æ–‡ä»¶å¤¹ä¸‹çš„æ‰€æœ‰xmlæ–‡ä»¶
        sourceChanger.prepare(xmlFiles);
        sourceChanger.loadFileToObject();
        sourceChanger.resolveFunctionSigns();
        sourceChanger.javaFileObjectMap.values().stream()
                .flatMap(o -> o.getClassMetas().stream())
                .flatMap(c -> c.getFunctionMetas().stream())
                .forEach(f -> System.out.println("--------------------------------------------------\n" + f.getJvmFunctionSign() + "\n" + f.functionSign()));
        //æ”¶é›†classç›¸å…³ä¿¡æ�¯
//        System.out.println("#################################################################################################################################");
//        System.out.println("#                                                                                                                               #");
//        System.out.println("#                                            collect if unit                                                                    #");
//        System.out.println("#                                                                                                                               #");
//        System.out.println("#################################################################################################################################");
//        sourceChanger.collectIfUnit();
        sourceChanger.processFunction();
        sourceChanger.printXMLFiles();
        sourceChanger.printFiles();
    }

    private void collectIfUnit() {
        Iterator<JavaFileObject> iterator = javaFileObjectMap.values().iterator();
        while (iterator.hasNext()) {
            JavaFileObject fileObject = iterator.next();
            fileObject.collectIfUnit();
        }
    }

    private static List<String> listJavaFile(String inputDir) {
        List<String> strings = new ArrayList<>();
        listJavaFile(new File(inputDir), strings);
        return strings;
    }

    private static void listJavaFile(File folder, List<String> strings) {
        assert folder.isDirectory();
        for (File file : folder.listFiles()) {
            if (file.isDirectory()) {
                listJavaFile(file, strings);
            } else if (file.getName().endsWith(".java")) {
                strings.add(file.getAbsolutePath());
            }
        }
    }

    private void resolveFunctionSigns() {
        javaFileObjectMap.values().stream()
                //é��åŽ†æ‰€æœ‰çš„ç±»
                .flatMap((o) -> o.getClassMetas().stream())
                //é��åŽ†æ‰€æœ‰çš„æ–¹æ³•
                .flatMap((c) -> c.getFunctionMetas().stream())
                // è¡¥å…¨æ‰€æœ‰çš„class ç­¾å��
                .forEach((f) -> {
                    //èŽ·å�–æ–¹æ³•ä¸­çš„æ³›åž‹å�‚æ•°
                    Element functionRoot = f.getFunctionRoot();
                    //todo æŠ½è±¡æ–¹æ³•
                    Iterator<Node> iterator = functionRoot.nodeIterator();
                    Element generic;
                    while (iterator.hasNext()) {
                        Node next = iterator.next();
                        if (!(next instanceof Element)) {
                            continue;
                        }
                        Element e = (Element) next;
                        if (!"parameter_list".equals(e.getName()) ||
                                !"generic".equals(e.attributeValue("type"))) {
                            continue;
                        }
                        if (e != null) {
                            generic = e;
                        } else {
                            logger.error("find the second parameter_list of generic");
                            throw new IllegalStateException("find the second parameter_list of generic");
                        }
                        //åˆ—ä¸¾æ‰€æœ‰çš„parameters
                        Iterator<Element> genericIterator = generic.elementIterator();
                        while (genericIterator.hasNext()) {
                            Element element = genericIterator.next();
                            f.addGenericIterator(Utils.elementToString(element));
                        }
                    }
                    //ç”±äºŽjavaåœ¨ç¼–è¯‘å�Žå�Žä¼šæŠ¹åŽ»æ³›åž‹çš„ç±»åž‹
                    //å®˜æ–¹æ–‡æ¡£ï¼šhttps://docs.oracle.com/javase/tutorial/java/generics/erasure.html
                    if (f.getType() == null) {
                        System.out.println("null");
                    }
                    if (!f.isConstructor()) {
                        f.setFullNameReturnType(SourceManager.v().queryFullTypeName(f.getType(), f));
                    }
                    //é��åŽ†æ‰€æœ‰çš„raw type
                    //æ³¨æ„�åŒºåˆ†... å’Œ[]ï¼ŒåŽ»é™¤ final
                    List<String> result = new ArrayList<>();
                    for (int i = 0; i < f.getRawParameterList().size(); i++) {
                        Element element = f.getRawParameterList().get(i);
                        //å¯¹äºŽæ¯�ä¸€ä¸ªparameterï¼Œæ��å�–elementä¸‹çš„ç¬¬ä¸€ä¸ªname
                        Element typeElement = Utils.selectElement(element, "decl", "^(type|objectType)$");
                        String type = Utils.elementToString(typeElement, (node) -> {
                            if (node instanceof Element) {
                                Element e = (Element) node;
                                if ("specifier".equals(e.getName())) {
                                    return false;
                                }
                            }
                            return true;
                        }).trim();
                        // æŸ¥æ‰¾å®Œæ•´ç±»å��
                        result.add(SourceManager.v().queryFullTypeName(type, f));
                    }
                    f.setFullNameParameterList(result);
                });
    }

    private void processFunction() {
        Iterator<JavaFileObject> iterator = javaFileObjectMap.values().iterator();
        while (iterator.hasNext()) {
            JavaFileObject fileObject = iterator.next();
            fileObject.processFunction();
        }
    }

    public void loadFileToObject() {
        SAXReader reader = new SAXReader();
        javaFileObjectMap.clear();
        Iterator<File> iterator = files.iterator();
        while (iterator.hasNext()) {
            File file = iterator.next();
            try {
                Document document =
                        reader.read(new InputStreamReader(new FileInputStream(file), Charset.forName("UTF-8")));
                JavaFileObject javaFileObject = JavaFileObject.create(file.getAbsolutePath(), document);
                //å°†åŒ…å��å’Œç±»å��çš„ä¿¡æ�¯æ”¾å…¥åˆ°SourceManagerä¸­
                SourceManager.v().addClass(javaFileObject.getPackageName(), javaFileObject.getClassMetas());
                javaFileObjectMap.put(file.getAbsolutePath(), javaFileObject);
            } catch (FileNotFoundException | DocumentException e) {
                e.printStackTrace();
                javaFileObjectMap.put(file.getAbsolutePath(), null);
            }
        }
    }

    public void prepare(List<String> xmlFiles) {
//        File sourceDir = new File(Config.getInstance().getInput());
        files.clear();
        files.addAll(xmlFiles.stream().map(File::new).collect(Collectors.toList()));
////        addFile(sourceDir, files);
//        Iterator<File> iterator = files.iterator();
//        while (iterator.hasNext()) {
//            File next = iterator.next();
//            Matcher matcher = PATTERN.matcher(next.getName());
//            if (!matcher.matches()) {
//                iterator.remove();
//            } else if (DEBUG && !next.getAbsolutePath().contains("My")) {
//                iterator.remove();
//            }
//        }
    }

    private void addFile(File folder, List<File> files) {
        if (!folder.isDirectory()) {
            return;
        }
        for (File f : folder.listFiles()) {
            if (f.isFile()) {
                files.add(f);
            } else {
                addFile(f, files);
            }
        }
    }


    public void printXMLFiles() {
        Config config = Config.getInstance();
        if (Utils.isEmpty(config.getXmlOutput())) {
            return;
        }
        File dir = new File(config.getXmlOutput());
        dir.mkdirs();
        Iterator<Map.Entry<String, JavaFileObject>> iterator = javaFileObjectMap.entrySet().iterator();
        while (iterator.hasNext()) {
            Map.Entry<String, JavaFileObject> entry = iterator.next();
            JavaFileObject value = entry.getValue();
            String key = entry.getKey();
            // get target file path
            String outPutFilePath = config.getXmlOutput() + (key
                    .substring(config.getInput().length()));
            System.out.println(outPutFilePath);
            File file = new File(outPutFilePath);
            try {
                Utils.makeSureFile(file);
                Writer fileWriter = new FileWriter(file);
                value.getDocument().write(fileWriter);
                fileWriter.close();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }

    public void printFiles() {
        Config config = Config.getInstance();
        //æ¸…ç©ºoutput dir
        File outPutDir = new File(config.getJavaOutput());
        if (!outPutDir.exists()) {
            outPutDir.mkdirs();
        } else {
            File[] files = outPutDir.listFiles();
            if (files != null || files.length == 0) {
                for (File f : files) {
                    f.delete();
                }
            }
        }
        Iterator<Map.Entry<String, JavaFileObject>> iterator = javaFileObjectMap.entrySet().iterator();
        while (iterator.hasNext()) {
            Map.Entry<String, JavaFileObject> entry = iterator.next();
            JavaFileObject value = entry.getValue();
            String key = entry.getKey();
            // get target file path
            String outPutFilePath = config.getJavaOutput() + (key.substring(Config.getWorkspacePath().length(), key.length() - ".xml".length()));
            Writer fileWriter = null;
            try {
                File file = new File(outPutFilePath);
                file.getParentFile().mkdirs();
                fileWriter = new BufferedWriter(
                        new OutputStreamWriter(new FileOutputStream(outPutFilePath, false),
                                Charset.forName("UTF-8")));
                printFile(value.getDocument().getRootElement(), fileWriter);
            } catch (IOException e) {
                e.printStackTrace();
            } finally {
                Utils.close(fileWriter);
            }
        }
    }

    public void printFile(Element root, Writer fileWriter) {
        Iterator<Node> elements = root.nodeIterator();
        while (elements.hasNext()) {
            Node next = elements.next();
            if (next instanceof Element) {
                printFile((Element) next, fileWriter);
            } else {
                if (!(next instanceof Namespace)) {
                    try {
                        fileWriter.write(next.getText());
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                }
            }
        }
    }
}
