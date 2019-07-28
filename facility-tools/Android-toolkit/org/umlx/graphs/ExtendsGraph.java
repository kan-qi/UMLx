public class ExtendsGraph {
    public static void constructExtendsGraph(List<ClassUnit> classUnits, List<CompositeClassUnit> compositeClassUnits, Map<String, ClassUnit> classUnitByName, Map<String, ClassUnit> classUnitByUUID, Map<String, CompositeClassUnit> compositeClassUnitByUUID, Map<String, String> classUnitToCompositeClassDic) {
        System.out.println("construct of extends graph starts.");

        List<List<ClassUnit>> extendsClasses = new ArrayList<List<ClassUnit>>();
        GraphsWriter.v().writeGraph("extendsGraph", "{");
        for (ClassUnit classUnit : classUnits) {
            SootClass sootClassUnit = classUnit.attachment;
            SootClass superClassUnit = null;
            try {
                superClassUnit = sootClassUnit.getSuperclass();
            } catch (Exception e) {
                System.out.println(e.toString());
            }

            if (superClassUnit == null) {
                continue;
            }

            String from = superClassUnit.getName();
            //if parent class is not in the map, ignore it
            if (classUnitByName.containsKey(classUnit.name) && classUnitByName.containsKey(from)) {
                ClassUnit parent = classUnitByName.get(from);
                List<ClassUnit> temp = new ArrayList();
                temp.add(parent);
                temp.add(classUnit);
                extendsClasses.add(temp);
            }
        }


        int i = 0;
        for (List<ClassUnit> extendpair : extendsClasses) {
            String parentName = extendpair.get(0).name;
            String parentUUID = extendpair.get(0).uuid;
            String childName = extendpair.get(1).name;
            String childUUID = extendpair.get(1).uuid;
            GraphsWriter.v().writeGraph("extendsGraph", "\"" + i + "\":{\"from\":{\"name\":\"" + parentName + "\",\"uuid\":\"" + parentUUID + "\"},\"to\":{\"name\":\"" + childName + "\",\"uuid\":\"" + childUUID + "\"}}");
            if (i != extendsClasses.size() - 1) {
                GraphsWriter.v().writeGraph("extendsGraph", ",");
            }
            i++;

        }

        GraphsWriter.v().writeGraph("extendsGraph", "}");

        System.out.println("construct of extends graph finishes.");

//	int ind = 10;
//	return res;
    }
}