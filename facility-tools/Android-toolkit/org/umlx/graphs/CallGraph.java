public class CallGraph{
    private class CallGraphNode{
		MethodUnit methodUnit;
		ClassUnit classUnit;

		CallGraphNode(MethodUnit methodUnit, ClassUnit classUnit) {
			super();
			this.methodUnit = methodUnit;
			this.classUnit = classUnit;
		}
	}

	//output the call graph to JSON format
	public static void constructCallGraph(CallGraph cg, List<ClassUnit> classUnits, List<CompositeClassUnit> compositeClassUnits, Map<String, MethodUnit> methodBySig, Map<String, String> methodToClass, Map<String, ClassUnit> classUnitByName, Map<String, ClassUnit> classUnitByUUID, Map<String, CompositeClassUnit> compositeClassUnitByUUID, Map<String, String> classUnitToCompositeClassDic){

		System.out.println("construct of call graph starts.");
		Set<CallGraphNode[]> edges = new HashSet<CallGraphNode[]>();

		if(cg != null) {
			Iterator<Edge> itr = cg.iterator();

			while(itr.hasNext()){
				Edge e = itr.next();
				String srcSig = e.getSrc().toString();
				String destSig = e.getTgt().toString();

				MethodUnit srcMethod = methodBySig.get(srcSig);
				MethodUnit destMethod = methodBySig.get(destSig);

				if(srcMethod == null || destMethod == null) {
					continue;
				}

				String srcClassUUID = methodToClass.get(srcMethod.uuid);
				String targetClassUUID = methodToClass.get(destMethod.uuid);

				ClassUnit srcClass = classUnitByUUID.get(srcClassUUID);
				ClassUnit targetClass = classUnitByUUID.get(targetClassUUID);

				CallGraphNode srcNode = new CallGraphNode(srcMethod, srcClass);
				CallGraphNode targetNode = new CallGraphNode(destMethod, targetClass);

				edges.add(new CallGraphNode[] {srcNode, targetNode});
			}
		}


		System.out.println("construct of call graph finishes.");

		convertCallGraphToJSON(edges);
	}


	void convertCallGraphToJSON(Set<CallGraphNode[]> edges) {

		GraphsWriter.v().writeGraph("callGraph", "{");
		GraphsWriter.v().writeGraph("callGraph", "\"edges\":[");

		int i = 0;
		for (CallGraphNode[] edge : edges) {
			if (edge[0] == null || edge[1] == null) {
				continue;
			}
			i++;
			if (i != 1) {
				GraphsWriter.v().writeGraph("callGraph", ",");
			}
			GraphsWriter.v().writeGraph("callGraph", "{\"start\":{\"methodUnit\":\"" + edge[0].methodUnit.uuid + "\",\"classUnit\":\"" + edge[0].classUnit.uuid + "\"},");
			GraphsWriter.v().writeGraph("callGraph", "\"end\":{\"methodUnit\":\"" + edge[1].methodUnit.uuid + "\",\"classUnit\":\"" + edge[1].classUnit.uuid + "\"}}");

		}
		GraphsWriter.v().writeGraph("callGraph", "]}");

	}

}