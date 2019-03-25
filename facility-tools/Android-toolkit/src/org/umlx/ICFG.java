package org.umlx;

import soot.SootMethod;
import soot.Unit;

import java.util.*;

public class ICFG implements Iterable<ICFG.CallEdge>{
    protected Set<CallEdge> edges = new HashSet<CallEdge>();
    protected Map<SootMethod, Set<CallEdge>> srcMethodToEdges;

    public ICFG() {
        this.srcMethodToEdges = new HashMap();
    }

    public void addEdge(CallEdge edge){
            edges.add(edge);
            Set<CallEdge> calledEdges = srcMethodToEdges.get(edge.src);
            if(calledEdges == null){
                calledEdges = new HashSet<CallEdge>();
                srcMethodToEdges.put(edge.src, calledEdges);
            }
            calledEdges.add(edge);
    }

    @Override
    public Iterator<CallEdge> iterator() {
        return edges.iterator();
    }

    //output the call graph to JSON formate
    public String toJSON(CodeAnalysis.CodeAnalysisResult codeAnalysisResult){
        Map<SootMethod, String> methodUnitUUIDs = codeAnalysisResult.methodUnitUUIDs;

        StringBuilder json = new StringBuilder();
        json.append("{");

        int i = 0;
        for(SootMethod srcMtd: srcMethodToEdges.keySet()){
            if(i != 0){
                json.append(",");
            }

            String srcUUID = methodUnitUUIDs.get(srcMtd);
            json.append("\""+srcMtd.getName()+"\":{");
            json.append("\"cls\":\""+srcMtd.getDeclaringClass().getName()+"\",");
            json.append("\"srcUUID\":\""+ (srcUUID == null ? "" : srcUUID) +"\",");
            json.append("\"calls\":[");
            Set<CallEdge> callEdges = srcMethodToEdges.get(srcMtd);

            List<CallEdge> callEdgesSorted = new ArrayList<>();
            for(CallEdge callEdge : callEdges) {
                callEdgesSorted.add(callEdge);
            }

            Collections.sort(callEdgesSorted, new Comparator<CallEdge>() {
                @Override
                public int compare(CallEdge o1, CallEdge o2) {
                    return o1.order - o2.order;
                }
            });


            int j = 0;
            for(CallEdge edge : callEdgesSorted){
                String targetUUID = methodUnitUUIDs.get(edge.tgt);
                edge.tgtUUID = targetUUID;
                if(j != 0){
                    json.append(",");
                }

                json.append(edge.toJSON());

                j++;
            }
            json.append("]}");
            i++;
        }

        json.append("}");

        return json.toString();
    }

    public String serialize(CodeAnalysis.CodeAnalysisResult codeAnalysisResult) {
        StringBuilder json = new StringBuilder();
        json.append("{");

        Map<SootMethod, String> methodUnitUUIDs = codeAnalysisResult.methodUnitUUIDs;

        int i = 0;
        for(SootMethod srcMtd: srcMethodToEdges.keySet()) {
            String srcUUID = methodUnitUUIDs.get(srcMtd);

            if (srcUUID == null) {
                continue;
            }

            if (i != 0) {
                json.append(",");
            }

            json.append("\"" + srcUUID + "\":{");

            json.append("\"calls\":[");
            Set<CallEdge> callEdges = srcMethodToEdges.get(srcMtd);

            List<CallEdge> callEdgesSorted = new ArrayList<>();
            for(CallEdge callEdge : callEdges) {
                callEdgesSorted.add(callEdge);
            }

            Collections.sort(callEdgesSorted, new Comparator<CallEdge>() {
                @Override
                public int compare(CallEdge o1, CallEdge o2) {
                    return o1.order - o2.order;
                }
            });

            int j = 0;
            for(CallEdge edge : callEdgesSorted){
                String targetUUID = methodUnitUUIDs.get(edge.tgt);
                if(targetUUID != null) {
                    if(j != 0){
                        json.append(",");
                    }
                    json.append("\""+targetUUID+"\"");
                    j++;
                }
            }
            json.append("]}");

            i++;
        }

        json.append("}");


        return json.toString();
    }

    static class CallEdge{
        public String tgtUUID;
        SootMethod src = null;
        Unit srcUnit = null;
        SootMethod tgt = null;
        int order = -1;
        public CallEdge(SootMethod src, Unit srcUnit, SootMethod tgt, int order) {
            this.src = src;
            this.srcUnit = srcUnit;
            this.tgt = tgt;
            this.order = order;
        }

        public String toJSON() {
            return "{" +
                    "\"tgtCls\": \"" + tgt.getDeclaringClass().getName() +
                    "\", \"tgt\": \"" + tgt.getName() +
                    "\", \"tgtUUID\": \"" + (tgtUUID == null ? "" : tgtUUID) +
                    "\", \"order\": \"" + order +
                    "\"}";
        }
    }
}
