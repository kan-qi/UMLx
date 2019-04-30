import java.io.*;
import java.util.*;

public class AutomateGroupSequence {

    String name ="use cases";
    String mainXmlId = "EAPK_0D4BE3DE_DBA4_430b_9F5D_2D1DC1F19C54";
    int localId = 25;
    String packagedEltId1 = "EAID_586BCAF6_15CB_4a03_81A9_"; //Should be used in diagram tag
    String packagedEltId2 = "EF34AE4B312B";
    String packagedName = "Add Users";
    int nameVal = 1;



    String nestedId1 = "EAID_CB000000_AF6_15CB_4a03_81A9_";
    String nestedId2 = "EF34AE4B312";
    String nestedName ="EA_Collaboration";
    int nestedNameVal = 1;

    String ownedId1 = "EAID_IN000000_AF6_15CB_4a03_81A9_";
    String ownedId2 = "EF34AE4B312";
    String ownedName = "EA_Interaction";
    int ownedNameVal = 1;


    String lifelineXmiId1 = "EAID_7183D05E_D892_423c_850E_";
    String lifelineXmiId2 = "8109476FDED0";
    String lifelineRepresentsId1 = "EAID_AT000000_D892_423c_850E_";
    String lifelineRepresentsId2 = "8109476FDED0";


    //EAID_3E9162E8_3B10_4fb1_9A31_1C5FE49ED8FD
    String diagramXmiId1 = "EAID_3E9162E8_3B10_4fb1_9A31_";
    String diagramXmiId2 = "1C5FE49ED8FD";

    String xmiIdRef1 = "EAID_9977D5D6_D839_4e85_9EF1_";
    String xmiIdRef2 = "38844704F245";

    int left =99, right = 189;
    int seqno = 1;

    BufferedWriter bw;
    Set<String> uniqueIds = new HashSet<>();

    Map<String,String> packagedEltMap = new HashMap<>();
    Map<String,String> pathToId = new HashMap<>();
    Map<String, Integer> stringToId = new HashMap<>();
    Map<String, String> idToEaid = new HashMap<>();
    Map<String, String> fragmentMap = new HashMap<>();
    Map<String, String> messageMap = new HashMap<>();
    List<String> tempList = new ArrayList<>();




    String actorId = "";
    Map<String,String> actorIdMap = new HashMap<>();
    String packgdEltName ="";



    //parentmaps value to be used in diagram parent id.
    Map<String, String> parentMap = new HashMap<>();


    public static void main(String[] args) throws IOException {
        AutomateGroupSequence ags = new AutomateGroupSequence();
        ags.generateSequence1();
        ags.generateSequence2();
    }

    public void generateSequence1() throws IOException {
        bw = new BufferedWriter(new FileWriter(new File("C:\\Users\\HOME\\Desktop\\output\\model\\sequence_models_1.xml")));
        String str = "<?xml version=\"1.0\" encoding=\"windows-1252\"?>\n" +
                "<xmi:XMI xmi:version=\"2.1\" xmlns:uml=\"http://schema.omg.org/spec/UML/2.1\" xmlns:xmi=\"http://schema.omg.org/spec/XMI/2.1\">\n" +
                "\t<xmi:Documentation exporter=\"Enterprise Architect\" exporterVersion=\"6.5\"/>\n" +
                "\t<uml:Model xmi:type=\"uml:Model\" name=\"EA_Model\" visibility=\"public\">\n" +
                "\t\t<packagedElement xmi:type=\"uml:Package\" xmi:id=\"EAPK_0D4BE3DE_DBA4_430b_9F5D_2D1DC1F19C54\" name=\"use cases\" visibility=\"public\">";
        bw.write(str);
        bw.newLine();
    }

    public void generateSequence2() throws IOException {

        List<String> sequence_diagrams_file_paths = new ArrayList<>();
        BufferedReader br = new BufferedReader(new FileReader("C:\\Users\\HOME\\Desktop\\output\\text_files\\filelist.txt"));
        String line = br.readLine();
        while (line != null && line.length() !=0){
            String line1 = line.replace("\\","\\\\");
            sequence_diagrams_file_paths.add(line1);
            line = br.readLine();
        }

        /*sequence_diagrams_file_paths.add("C:\\Users\\HOME\\Documents\\Google Drive\\10-25\\f14a_gotrla_2018-9-26@1540542856843_analysis\\EAID_B8A0ABCE_A0A9_4a5e_B2D2_9FF08A7FFCBB\\sequence_diagram.txt");
        sequence_diagrams_file_paths.add("C:\\Users\\HOME\\Documents\\Google Drive\\10-25\\f14a_gotrla_2018-9-26@1540542856843_analysis\\EAID_C6FB9501_DB90_4d0f_9F4F_F77B7BE4645D\\sequence_diagram.txt");
        sequence_diagrams_file_paths.add("C:\\Users\\HOME\\Documents\\Google Drive\\10-25\\f14a_gotrla_2018-9-26@1540542856843_analysis\\EAID_9462AAAE_7289_41b0_8161_39E401D6DC6A\\sequence_diagram.txt");
        sequence_diagrams_file_paths.add("C:\\Users\\HOME\\Documents\\Google Drive\\10-25\\f14a_gotrla_2018-9-26@1540542856843_analysis\\EAID_926EEA0C_E270_4ebc_8A12_18D9115B69FD\\sequence_diagram.txt");
        sequence_diagrams_file_paths.add("C:\\Users\\HOME\\Documents\\Google Drive\\10-25\\f14a_gotrla_2018-9-26@1540542856843_analysis\\EAID_9F4148C7_B0BB_4647_912D_30E9FE72CE7D\\sequence_diagram.txt");
        sequence_diagrams_file_paths.add("C:\\Users\\HOME\\Documents\\Google Drive\\10-25\\f14a_gotrla_2018-9-26@1540542856843_analysis\\EAID_7F8DE68B_9D93_4e07_9018_22205F07A2B5\\sequence_diagram.txt");
        sequence_diagrams_file_paths.add("C:\\Users\\HOME\\Documents\\Google Drive\\10-25\\f14a_gotrla_2018-9-26@1540542856843_analysis\\EAID_7BF1210A_6BD5_4ad9_9318_70EAF164FBB6\\sequence_diagram.txt");
        sequence_diagrams_file_paths.add("C:\\Users\\HOME\\Documents\\Google Drive\\10-25\\f14a_gotrla_2018-9-26@1540542856843_analysis\\EAID_2BAC5FC5_202E_4265_99E6_12D54ABA42D5\\sequence_diagram.txt");*/
        for (String each : sequence_diagrams_file_paths) {
            if(!checkEligible(each))
                continue;
            generatePackagedElt(each);
            generateNestedElt();
            generateOwnedBehavior();
            writeLifeLine(each);
            writeSecondPart(each);
            writeThirdPart(each);
            bw.write("</ownedBehavior>");
            bw.newLine();
            writeOwnedAtribute(each);
            bw.newLine();

            tempList.clear();
        }
        bw.write("</packagedElement>");
        bw.newLine();
        bw.write("</uml:Model>");
        bw.newLine();
        firstPart();

        for (String each : sequence_diagrams_file_paths) {
            writeExtensionPart(each);
            left = 99;
            right = 189;
            seqno = 1;
        }
        bw.write("</diagrams>\n" +
                "\t</xmi:Extension>");
        bw.write("</xmi:XMI>");
        bw.close();
    }

    public boolean checkEligible(String each) throws IOException {
        BufferedReader br = new BufferedReader(new FileReader(each));
        String line =  br.readLine();
        while (line != null){
            if(line.trim().contains("activate"))
                return true;
            if(line.contains("actor")){
                String [] parts = line.split(" ");
                if(parts.length>2)
                    return false;
            }
            line = br.readLine();
        }
        return false;
    }

    public void generatePackagedElt(String path) throws IOException {
        //<packagedElement xmi:type="uml:UseCase" xmi:id="EAID_586BCAF6_15CB_4a03_81A9_EF34AE4B312B" name="test1" visibility="public">
        String str1 = "<packagedElement xmi:type=\"uml:UseCase\" xmi:id=\"";
        String id = packagedEltId1+packagedEltId2;
        pathToId.put(path,id);
        String str2 = "\" name=\"";
        String str3 = "\" visibility=\"public\">";
        String node = str1+id+str2+packagedName+nameVal+str3;
        packagedEltMap.put(packagedName+nameVal,id);
        bw.write(node);
        bw.newLine();
        packagedEltId2 = getAlphaNumeric(12);
        nameVal++;
    }

    public void generateNestedElt() throws IOException {
        //<nestedClassifier xmi:type="uml:Collaboration" xmi:id="EAID_CB000000_AF6_15CB_4a03_81A9_EF34AE4B312" name="EA_Collaboration1" visibility="public">
        String str1= "<nestedClassifier xmi:type=\"uml:Collaboration\" xmi:id=\"";
        String id = nestedId1+nestedId2;
        String str2 = "\" name=\"";
        String name = nestedName+nestedNameVal;
        String str3 = "\" visibility=\"public\">";
        String node =str1+id+str2+name+str3;
        bw.write(node);
        bw.newLine();

        nestedId2 = getAlphaNumeric(11);
        nestedNameVal++;

    }


    public void generateOwnedBehavior() throws IOException {
        String str1 = "<ownedBehavior xmi:type=\"uml:Interaction\" xmi:id=\"";
        String ownedId = ownedId1+ownedId2;
        ownedId2 = getAlphaNumeric(11);
        String str2 = "\" name=\"";
        String name = ownedName+ownedNameVal;
        ownedNameVal++;
        String str3 = "\" visibility=\"public\">";

        String node = str1+ownedId+str2+name+str3;
        bw.write(node);
        bw.newLine();
    }

    public void writeLifeLine(String path) throws IOException {
        BufferedReader br = new BufferedReader(new FileReader(path));
        String line = br.readLine();
        while (line != null && ! line.contains("actor")) {
            line = br.readLine();
        }

        if(line == null || line.length()==0)
            return;
        String[] actors = line.split(" ");
        String s1 ="<lifeline xmi:type=\"uml:Lifeline\" xmi:id=\"";
        String s2 = "\" name=\"";
        String s3 = "\" visibility=\"public\" represents=\"";
        String s4= "\"/>";
        packgdEltName = actors[1].trim();
        String lifelineXmlId = lifelineXmiId1+lifelineXmiId2;
        lifelineXmlId = lifelineXmlId.substring(0,4)+"_LL000000_"+ lifelineXmlId.substring(14);

        tempList.add(lifelineRepresentsId1+lifelineRepresentsId2);
        idToEaid.put(actors[1]+path,lifelineXmlId);
        String node = s1+lifelineXmlId+s2+actors[1]+s3+lifelineRepresentsId1+lifelineRepresentsId2+s4;
        bw.write(node);
        bw.newLine();
        line = br.readLine();
        while (line != null && line.length()!=0){
            String[] lifelines = line.split(" ");
            stringToId.put(lifelines[1].trim()+path,Integer.valueOf(lifelines[lifelines.length-1]));
            lifelineXmiId2 = getAlphaNumeric(12);
            lifelineXmlId = lifelineXmiId1+lifelineXmiId2;
            idToEaid.put(lifelines[lifelines.length-1]+path,lifelineXmlId);
            String representsId = lifelineXmlId.substring(0,4)+"_AT000000_"+ lifelineXmlId.substring(14);
            actorId = representsId;
            int n1 = line.indexOf("\"");
            int n2 = line.indexOf("\"",n1+1);
            //System.out.println(n1+" "+n2);
            String name = line.substring(n1+1,n2);
            node = s1+lifelineXmlId+s2+name+s3+representsId+s4;
            bw.write(node);
            bw.newLine();
            tempList.add(representsId);
            line = br.readLine();
        }

        //System.out.println(idToEaid);
    }

    public void writeSecondPart(String path) throws IOException {

        //System.out.println(path);
        String str1 = "<fragment xmi:type=\"uml:OccurrenceSpecification\" xmi:id=\"";
        String str2= "\" covered=\"";
        String str3 = "\"/>";


        String tempFragment = "FR000001";
        BufferedReader br = new BufferedReader(new FileReader(path));
        String line = br.readLine();
        while (line != null) {
            if(line.contains("->")) {
                int index = line.indexOf(":");
                String message = line.substring(0,index);
                String[] messageParts = message.split("->");
                String source = messageParts[0].trim();
                String dest = messageParts[1].trim();
                String sourceId = idToEaid.get(messageParts[0].trim()+path);
                if(fragmentMap.containsKey(source)){

                }
                else{
                    int val = tempFragment.charAt(tempFragment.length()-1)-'0';
                    val++;
                    tempFragment = tempFragment.substring(0,tempFragment.length()-1)+val;
                    System.out.println(path);
                    String fragmentXmiId1 = sourceId.substring(0,4)+"_"+tempFragment+"_"+ sourceId.substring(14);
                    fragmentMap.put(source+path,fragmentXmiId1);

                }


                String fragmentXmiId1 = sourceId.substring(0,4)+"_"+tempFragment+"_"+ sourceId.substring(14);
                String fragment1 = str1+fragmentXmiId1+str2+sourceId+str3;
                bw.write(fragment1);
                bw.newLine();
                String destId = idToEaid.get(messageParts[1].trim()+path);
                if(fragmentMap.containsKey(dest)){

                }
                else{
                    int val = tempFragment.charAt(tempFragment.length()-1)-'0';
                    val++;
                    tempFragment = tempFragment.substring(0,tempFragment.length()-1)+val;
                    String fragmentXmiId2 = destId.substring(0,4)+"_"+tempFragment+"_"+ destId.substring(14);
                    fragmentMap.put(dest+path,fragmentXmiId2);
                }

                String fragmentXmiId2 = destId.substring(0,4)+"_"+tempFragment+"_"+ destId.substring(14);
                String fragment2 = str1+fragmentXmiId2+str2+destId+str3;
                bw.write(fragment2);
                bw.newLine();
            }
            line = br.readLine();
        }
        //System.out.println(fragmentMap);
    }

    public void writeThirdPart(String path) throws IOException {
        BufferedReader br = new BufferedReader(new FileReader(new File(path)));
        String line = br.readLine();

        String msgId = "EAID_049D1FF1_0B97_41fb_AC69_41AF";
        String changeId ="B65F70BC";


        while (line != null && !line.contains("-> ")){
            line = br.readLine();
        }
        //<message xmi:type="uml:Message" xmi:id="EAID_049D1FF1_0B97_41fb_AC69_41AFF69J74FG" name="sendresetlinkbyemail" messageKind="complete" messageSort="synchCall" sendEvent="EAID_FR000003_D839_4e85_9EF1_38844704F245" receiveEvent="EAID_FR000003_D839_4e85_9EF1_38844704F245"/>

        String str1 = "<message xmi:type=\"uml:Message\" xmi:id=\"";
        String str2= "\" name=\"";
        String str3 = "\" messageKind=\"complete\" messageSort=\"synchCall\" sendEvent=\"";
        String str4 ="\" receiveEvent=\"";
        String str5 ="\"/>";

        while (line != null){
            if(line.contains("->")){
                String[] messageParts = line.split(":");
                String functionname = messageParts[1].trim();
                functionname = functionname.substring(0, functionname.length() - 2);
                String[] infoMess = messageParts[0].split("->");
                String source = infoMess[0].trim();
                String dest = infoMess[1].trim();
                changeId = getAlphaNumeric(8);

                String key = line+path;
                messageMap.put(key,msgId+changeId);
                String node = str1 + msgId+changeId + str2 + functionname + str3 + fragmentMap.get(source+path) + str4 + fragmentMap.get(dest+path)+ str5;
                bw.write(node);
                bw.newLine();
            }
            line = br.readLine();
        }
    }

    public String getAlphaNumeric(int len) {
        char[] ch = { '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
                'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L',
                'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X',
                'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j',
                'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v',
                'w', 'x', 'y', 'z' };


        char[] c=new char[len];
        while (true) {
            Random random = new Random();
            for (int i = 0; i < len; i++) {
                c[i] = ch[random.nextInt(ch.length)];
            }
            if(! uniqueIds.contains(new String (c)))
                break;
        }

        return new String(c);
    }

    public void writeOwnedAtribute(String path) throws IOException {
        String str1 = "<ownedAttribute xmi:type=\"uml:Property\" xmi:id=\"";
        String str2 = "\"/>";

        for (int i=1;i<tempList.size();i++){
            String node = str1+tempList.get(i)+str2;
            bw.write(node);
            bw.newLine();
        }
        String str3 = "\">";
        String node = str1+tempList.get(0)+str3;
        bw.write(node);
        bw.newLine();

        String xmiIdRef = xmiIdRef1+xmiIdRef2;
        xmiIdRef2 = getAlphaNumeric(12);
        str1 ="<type xmi:idref=\"";
        str2 = "\"/>\n" +
                "\t\t\t\t\t</ownedAttribute>\n" +
                "\t\t\t\t</nestedClassifier>\n" +
                "\t\t\t</packagedElement>";

        node = str1+xmiIdRef+str2;
        bw.write(node);
        bw.newLine();

        String s1 = "<packagedElement xmi:type=\"uml:Actor\" xmi:id=\"";
        String s2 = "\" name=\"";
        String s3="\" visibility=\"public\"/>";
        actorIdMap.put(path,xmiIdRef);
        node = s1+xmiIdRef+s2+packgdEltName+s3;
        bw.write(node);
        bw.newLine();
    }

    public void writeExtensionPart(String path) throws IOException {
        //System.out.println(pathToId);


        bw.newLine();
        createDiagramTag1(path);
        createPropertiesTag();
        createDump();
        createMessages(path);
        writeExtensionHeader3(path);
    }

    public void createPropertiesTag() throws IOException {
        //<properties name="use cases2" type="Sequence"/>
        String str1 = "<properties name=\"";
        String str2 = "\" type=\"Sequence\"/>";
        String node = str1+name+str2;
        bw.write(node);
        bw.newLine();

    }

    public void firstPart() throws IOException {
        bw.write("<xmi:Extension extender=\"Enterprise Architect\" extenderID=\"6.5\">");
        bw.newLine();
        bw.write("<primitivetypes>\n" +
                "\t\t\t<packagedElement xmi:type=\"uml:Package\" xmi:id=\"EAPrimitiveTypesPackage\" name=\"EA_PrimitiveTypes_Package\" visibility=\"public\"/>\n" +
                "\t\t</primitivetypes>");

        bw.newLine();
        bw.write("<profiles/>");
        bw.write("<diagrams>");
        bw.newLine();
    }

    public void createDiagramTag1(String path) throws IOException {
        diagramXmiId2 = getAlphaNumeric(12);
        String diagramId = diagramXmiId1+diagramXmiId2;
        //<diagram xmi:id="EAID_3E9162E8_3B10_4fb1_9A31_1C5FE49ED8FD">
        String s1 = "<diagram xmi:id=\"";
        String s2 ="\">";
        String node = s1+diagramId+s2;
        bw.write(node);
        bw.newLine();
        //<model package="EAPK_0D4BE3DE_DBA4_430b_9F5D_2D1DC1F19C54" localID="25" owner="EAPK_0D4BE3DE_DBA4_430b_9F5D_2D1DC1F19C54" parent="EAID_586BCAF6_15CB_4a03_81A9_EF34AE4B312B"/>
        String str1 = "<model package=\"";
        String str2 = "\" localID=\"";
        String str3 = "\" owner=\"";
        String str4 = "\" parent=\"";
        String str5 = "\"/>";

        node = str1+mainXmlId+str2+localId+str3+mainXmlId+str4+pathToId.get(path)+str5;
        localId++;
        bw.write(node);
        bw.newLine();
    }
    public void createDump() throws IOException {
        String str1 ="<project author=\"HOME\" version=\"1.0\" created=\"2018-11-27 16:22:38\" modified=\"2018-11-27 16:23:00\"/>\n" +
                "\t\t\t\t<style1 value=\"ShowPrivate=1;ShowProtected=1;ShowPublic=1;HideRelationships=0;Locked=0;Border=1;HighlightForeign=1;PackageContents=1;SequenceNotes=0;ScalePrintImage=0;PPgs.cx=0;PPgs.cy=0;DocSize.cx=850;DocSize.cy=1098;ShowDetails=0;Orientation=P;Zoom=100;ShowTags=0;OpParams=1;VisibleAttributeDetail=0;ShowOpRetType=1;ShowIcons=1;CollabNums=0;HideProps=0;ShowReqs=0;ShowCons=0;PaperSize=1;HideParents=0;UseAlias=0;HideAtts=0;HideOps=0;HideStereo=0;HideElemStereo=0;ShowTests=0;ShowMaint=0;ConnectorNotation=UML 2.1;ExplicitNavigability=0;ShowShape=1;AllDockable=0;AdvancedElementProps=1;AdvancedFeatureProps=1;AdvancedConnectorProps=1;m_bElementClassifier=1;SPT=1;ShowNotes=0;SuppressBrackets=0;SuppConnectorLabels=0;PrintPageHeadFoot=0;ShowAsList=0;\"/>\n" +
                "\t\t\t\t<style2 value=\"ExcludeRTF=0;DocAll=0;HideQuals=0;AttPkg=1;ShowTests=0;ShowMaint=0;SuppressFOC=0;INT_ARGS=;INT_RET=;INT_ATT=;SeqTopMargin=50;MatrixActive=0;SwimlanesActive=1;KanbanActive=0;MatrixLineWidth=1;MatrixLineClr=0;MatrixLocked=0;TConnectorNotation=UML 2.1;TExplicitNavigability=0;AdvancedElementProps=1;AdvancedFeatureProps=1;AdvancedConnectorProps=1;m_bElementClassifier=1;SPT=1;MDGDgm=;STBLDgm=;ShowNotes=0;VisibleAttributeDetail=0;ShowOpRetType=1;SuppressBrackets=0;SuppConnectorLabels=0;PrintPageHeadFoot=0;ShowAsList=0;SuppressedCompartments=;Theme=:119;SaveTag=56D01039;\"/>\n" +
                "\t\t\t\t<swimlanes value=\"locked=false;orientation=0;width=0;inbar=false;names=false;color=-1;bold=false;fcol=0;tcol=-1;ofCol=-1;ufCol=-1;hl=0;ufh=0;hh=0;cls=0;bw=0;hli=0;SwimlaneFont=lfh:-10,lfw:0,lfi:0,lfu:0,lfs:0,lfface:Calibri,lfe:0,lfo:0,lfchar:1,lfop:0,lfcp:0,lfq:0,lfpf=0,lfWidth=0;\"/>\n" +
                "\t\t\t\t<matrixitems value=\"locked=false;matrixactive=false;swimlanesactive=true;kanbanactive=false;width=1;clrLine=0;\"/>\n" +
                "\t\t\t\t<extendedProperties/>";
        bw.write(str1);
        bw.newLine();

    }
    public void createMessages(String path) throws IOException {
        //System.out.println(actorIdMap);
        bw.write("<elements>");
        bw.newLine();
        BufferedReader br = new BufferedReader(new FileReader(path));
        String line = br.readLine();
        while (line != null && ! line.contains("actor")) {
            line = br.readLine();
        }
        String s1 = "<element geometry=\"";

        //String[] actors = line.split(" ");
        String subject = " subject=\"";
        String seqnoStr ="\" seqno=\"";
        String style="\" style=\"DUID=D5409A04;NSL=0;BCol=-1;BFol=-1;LCol=-1;LWth=-1;fontsz=0;bold=0;black=0;italic=0;ul=0;charset=0;pitch=0;\"/>";

        String node = s1+"Left="+Integer.toString(left)+";"+"Top=50;"+"Right="+Integer.toString(right)+";"+"Bottom=390;\""+subject+actorIdMap.get(path)+seqnoStr+Integer.toString(seqno)+style;
        bw.write(node);
        bw.newLine();

        line = br.readLine();
        while (line != null && line.length() != 0){
            left += 200;
            right = left+90;
            seqno++;
            String[] lifelines = line.split(" ");
            //
            // System.out.println(line);
            //int val = Integer.parseInt(lifelines[lifelines.length-1]);
            String id = idToEaid.get(lifelines[lifelines.length-1]+path);
            node = s1+"Left="+Integer.toString(left)+";"+"Top=50;"+"Right="+Integer.toString(right)+";"+";"+"Bottom=390;\""+subject+id+seqnoStr+Integer.toString(seqno)+style;
            bw.write(node);
            bw.newLine();
            line = br.readLine();
        }

    }

    public void writeExtensionHeader3(String path) throws IOException {
        //System.out.println(messageMap);
        BufferedReader br = new BufferedReader(new FileReader(new File(path)));
        String line = br.readLine();
        //String line = br.readLine();
        while (line != null && !line.contains("-> ")){
            line = br.readLine();
        }

        String element = "<element geometry=\"SX=0;SY=0;EX=0;EY=0;Path=;\" subject=\"";
        String style="\" style=\";Hidden=0;\"/>";
        while (line != null){
            if(line.contains("->")){
                String key = line+path;
                String node = element+messageMap.get(key)+style;
                bw.write(node);
                bw.newLine();
            }
            line = br.readLine();
        }
        bw.write("</elements>");
        bw.newLine();
        bw.write("</diagram>\n");

    }

}