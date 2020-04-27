package org.umlx.graphs;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.umlx.DebugOutput;
import org.umlx.units.AttrUnit;
import org.umlx.units.ClassUnit;
import org.umlx.units.CompositeClassUnit;
import org.umlx.units.MethodUnit;
import org.umlx.writers.GraphsWriter;

import soot.Body;
import soot.SootClass;
import soot.Unit;
import soot.jimple.FieldRef;
import soot.jimple.Stmt;

public class AccessGraph {

	public static void constructAccessGraph(List<ClassUnit> classUnits, List<CompositeClassUnit> compositeClassUnits, Map<String, ClassUnit> classUnitByName, Map<String, ClassUnit> classUnitByUUID, Map<String, CompositeClassUnit> compositeClassUnitByUUID, Map<String, String> classUnitToCompositeClassDic) {

		Set<AccessGraphNode[]> edges = new HashSet<AccessGraphNode[]>();

		for (ClassUnit classUnit : classUnits) {

			String compositeClassUnitUUID = classUnitToCompositeClassDic.get(classUnit.getUuid());
			CompositeClassUnit compositeClassUnit = compositeClassUnitByUUID.get(compositeClassUnitUUID);

			Set<ClassUnit> referencedClassUnits = new HashSet<ClassUnit>();

			List<MethodUnit> methodUnits = classUnit.getMethods();
			for (MethodUnit methodUnit : methodUnits) {
				//need to identify the methods within the boundary.

				DebugOutput.v().printf("method:%s", methodUnit.getName());

				Body methodBlockUnit = null;

				try {
					methodBlockUnit = methodUnit.getAttachment().retrieveActiveBody();
				} catch (Exception e) {
					e.printStackTrace();
					continue;
				}

				DebugOutput.v().printf("active body:%s", methodUnit.getName());

				AccessGraphNode srcAccessGraphNode = new AccessGraphNode(methodUnit, null, classUnit);
				ArrayList<AccessGraphNode> referencedAccessGraphNodes = new ArrayList<AccessGraphNode>();

				for (Unit u : methodBlockUnit.getUnits()) {
					Stmt s = (Stmt) u;
					if (s.containsFieldRef()) {
						FieldRef fieldRef = s.getFieldRef();
//				        org.umlx.DebugOutput.v().printf("field:%s\n", fieldRef.toString());
						SootClass targetClassUnitType = fieldRef.getFieldRef().declaringClass();

						ClassUnit targetClassUnit = classUnitByName.get(targetClassUnitType.getName());

						if (targetClassUnit == null) {
							continue;
						}

						AttrUnit attrUnit = new AttrUnit(fieldRef.getField().getName(), fieldRef.getField().getType().toString());

						AccessGraphNode targetAccessGraphNode = new AccessGraphNode(null, attrUnit, targetClassUnit);

						referencedAccessGraphNodes.add(targetAccessGraphNode);

					}
				}

				for (AccessGraphNode accessGraphNode : referencedAccessGraphNodes) {
					edges.add(new AccessGraphNode[]{srcAccessGraphNode, accessGraphNode});
				}

			}
		}

		System.out.println("construct of access graph finishes");

		convertAccessGraphToJSON(edges);

	}

	public static void convertAccessGraphToJSON(Set<AccessGraphNode[]> edges) {

		System.out.println("convert access graph starts.");

		GraphsWriter.v().writeGraph("accessGraph", "{");

		GraphsWriter.v().writeGraph("accessGraph", "\"edges\":[");

		int i = 0;
		for (AccessGraphNode[] edge : edges) {
			if (edge[0] == null || edge[1] == null) {
				continue;
			}
			i++;
			System.out.println("processing method: " + edge[0].methodUnit.getUuid());

			if (i != 1) {
				GraphsWriter.v().writeGraph("accessGraph", ",");
			}

			GraphsWriter.v().writeGraph("accessGraph", "{\"start\":{\"methodUnit\":\"" + edge[0].methodUnit.getUuid() + "\",\"classUnit\":\"" + edge[0].classUnit.getUuid() + "\"},");

			GraphsWriter.v().writeGraph("accessGraph", "\"end\":{\"attrUnit\":" + edge[1].attrUnit.toJSONString() + ",\"classUnit\":\"" + edge[1].classUnit.getUuid() + "\"}}");

		}
		GraphsWriter.v().writeGraph("accessGraph", "]}");

		System.out.println("convert access graph finishes.");

	}
}


class AccessGraphNode {
	MethodUnit methodUnit;
	AttrUnit attrUnit;
	ClassUnit classUnit;

	AccessGraphNode(MethodUnit methodUnit, AttrUnit attrUnit, ClassUnit classUnit) {
		super();
		this.methodUnit = methodUnit;
		this.classUnit = classUnit;
		this.attrUnit = attrUnit;
	}

}
