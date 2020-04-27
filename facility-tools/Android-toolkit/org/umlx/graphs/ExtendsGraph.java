package org.umlx.graphs;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.umlx.units.ClassUnit;
import org.umlx.units.CompositeClassUnit;
import org.umlx.writers.GraphsWriter;

import soot.SootClass;
import soot.util.Chain;

public class ExtendsGraph {
    public static void constructExtendsGraph(List<ClassUnit> classUnits, List<CompositeClassUnit> compositeClassUnits, Map<String, ClassUnit> classUnitByName, Map<String, ClassUnit> classUnitByUUID, Map<String, CompositeClassUnit> compositeClassUnitByUUID, Map<String, String> classUnitToCompositeClassDic) {
        System.out.println("construct of extends graph starts.");

        List<List<ClassUnit>> extendsClasses = new ArrayList<List<ClassUnit>>();
        GraphsWriter.v().writeGraph("extendsGraph", "{");
        for (ClassUnit classUnit : classUnits) {
            SootClass sootClassUnit = classUnit.getAttachment();
            SootClass superClassUnit = null;
            try {
                superClassUnit = sootClassUnit.getSuperclass();
            } catch (Exception e) {
                System.out.println(e.toString());
            }

            if (superClassUnit != null) {
                String from = superClassUnit.getName();
                //if parent class is not in the map, ignore it
                if (classUnitByName.containsKey(classUnit.getName()) && classUnitByName.containsKey(from)) {
                    ClassUnit parent = classUnitByName.get(from);
                    List<ClassUnit> temp = new ArrayList();
                    temp.add(parent);
                    temp.add(classUnit);
                    extendsClasses.add(temp);
                }
            }

            Chain<SootClass> interfaces = null;

            try {
                interfaces = sootClassUnit.getInterfaces();
            } catch (Exception e) {
                System.out.println(e.toString());
            }

            if (interfaces != null) {
                for(SootClass interfaceUnit : interfaces) {
                    String from = interfaceUnit.getName();
                    //if parent class is not in the map, ignore it
                    if (classUnitByName.containsKey(classUnit.getName()) && classUnitByName.containsKey(from)) {
                        ClassUnit parent = classUnitByName.get(from);
                        List<ClassUnit> temp = new ArrayList();
                        temp.add(parent);
                        temp.add(classUnit);
                        extendsClasses.add(temp);
                    }
                }
            }
        }


        int i = 0;
        for (List<ClassUnit> extendpair : extendsClasses) {
            String parentName = extendpair.get(0).getName();
            String parentUUID = extendpair.get(0).getUuid();
            String childName = extendpair.get(1).getName();
            String childUUID = extendpair.get(1).getUuid();
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