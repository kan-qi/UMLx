package org.umlx.graphs;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.umlx.units.AttrUnit;
import org.umlx.units.ClassUnit;
import org.umlx.units.CompositeClassUnit;
import org.umlx.writers.GraphsWriter;

public class CompositionGraph{

    public static void convertCompositionGraph(HashMap<String, AttributeDependencyGraphNode> attributeCompGraph){
        GraphsWriter.v().writeGraph("compositionGraph","{\"nodes\":[");

        // Loop through each class node
        int classIter=0;
        int classCount=attributeCompGraph.size();
        for(AttributeDependencyGraphNode node:attributeCompGraph.values()){
        GraphsWriter.v().writeGraph("compositionGraph","{\"class\":\""+node.className+"\",\"uuid\":\""+node.uuid+"\",\"dependencies\":[");

        // Loop through each class it has an attribute dependency on
        int typeDepIter=0;
        int typeDepCount=node.attributeDependencies.size();
        for(AttributeDependencyUnit dependency:node.attributeDependencies.values()){
        GraphsWriter.v().writeGraph("compositionGraph","{\"class\":\""+dependency.AttributeDependency.className+"\",\"uuid\":\""+dependency.AttributeDependency.uuid+"\"");

        int depCount;
        int iterCount=0;

        GraphsWriter.v().writeGraph("compositionGraph",",\"attrDependencies\":[");
        depCount=dependency.attributeDependencies.size();
        iterCount=0;
        for(String attrDep:dependency.attributeDependencies){
        String attrUuid=node.attributes.get(attrDep);
        GraphsWriter.v().writeGraph("compositionGraph","{\"attributeName\":\""+attrDep+"\",\"attributeUuid\":\""+attrUuid+"\"}");
        iterCount++;
        if(iterCount<depCount){
        GraphsWriter.v().writeGraph("compositionGraph",",");
        }
        }
        GraphsWriter.v().writeGraph("compositionGraph","]}");

        typeDepIter++;
        if(typeDepIter<typeDepCount){
        GraphsWriter.v().writeGraph("compositionGraph",",");
        }
        }

        GraphsWriter.v().writeGraph("compositionGraph","]}");

        classIter++;
        if(classIter<classCount){
        GraphsWriter.v().writeGraph("compositionGraph",",");
        }
        }

        GraphsWriter.v().writeGraph("compositionGraph","]}");

//	return output;
        }


public static void constructCompositionGraph(List<ClassUnit> classUnits,List<CompositeClassUnit> compositeClassUnits,Map<String, ClassUnit> classUnitByName,Map<String, ClassUnit> classUnitByUUID,Map<String, CompositeClassUnit> compositeClassUnitByUUID,Map<String, String> classUnitToCompositeClassDic){

        System.out.println("composition graph construct starts.");
        HashMap mappings=new HashMap<String, AttributeDependencyGraphNode>();

        for(ClassUnit classUnit:classUnits){
        // Create a AttributeDependencyGraphNode for the class if it doesn't exist yet
        if(!mappings.containsKey(classUnit.getName())){
        AttributeDependencyGraphNode classNode=new AttributeDependencyGraphNode(classUnit);
        mappings.put(classUnit.getName(),classNode);
        }

        AttributeDependencyGraphNode currentClassNode=(AttributeDependencyGraphNode)mappings.get(classUnit.getName());

        // Loop through attributes of the class
        List<AttrUnit> attributes=classUnit.getAttributes();
        for(AttrUnit attribute:attributes){
        // Create a AttributeDependencyGraphNode for the attribute type if it doesn't exist yet
        if(classUnitByName.containsKey(attribute.getType())){
        ClassUnit attrType=(ClassUnit)classUnitByName.get(attribute.getType());
        if(!mappings.containsKey(attribute.getType())){
        AttributeDependencyGraphNode node=new AttributeDependencyGraphNode(attrType);
        mappings.put(attribute.getType(),node);
        }

        // Add the attribute type dependency
        AttributeDependencyGraphNode attrNode=(AttributeDependencyGraphNode)mappings.get(attribute.getType());
        currentClassNode.addAttributeAttributeDependency(attrNode,attribute.getName());
        }
        }
        }

        convertCompositionGraph(mappings);
        System.out.println("composition graph construct ends.");
        }

}


class AttributeDependencyGraphNode {
    String className;
    String uuid;
    Map<String, String> attributes;
    Map<String, AttributeDependencyUnit> attributeDependencies;    // Other classes that this class has relationships with

    public AttributeDependencyGraphNode(ClassUnit classUnit) {
        this.className = classUnit.getName();
        this.uuid = classUnit.getUuid();
        this.attributes = new HashMap<String, String>();
        this.attributeDependencies = new HashMap<String, AttributeDependencyUnit>();

        for (AttrUnit attribute : classUnit.getAttributes()) {
            this.attributes.put(attribute.getName(), attribute.getUuid());
        }
    }

    public void addAttributeAttributeDependency(AttributeDependencyGraphNode attributeDependency, String attrName) {
        AttributeDependencyUnit edge = this.getAttributeDependencyUnit(attributeDependency);
        edge.addAttributeDependency(attrName);
    }

    private AttributeDependencyUnit getAttributeDependencyUnit(AttributeDependencyGraphNode attributeDependency) {
        if (!this.attributeDependencies.containsKey(attributeDependency.className)) {
            AttributeDependencyUnit attrDepEdge = new AttributeDependencyUnit(attributeDependency);
            this.attributeDependencies.put(attributeDependency.className, attrDepEdge);
        }

        return (AttributeDependencyUnit) this.attributeDependencies.get(attributeDependency.className);
    }
}


class AttributeDependencyUnit {
    AttributeDependencyGraphNode AttributeDependency;    // The class that the parent node has a dependency on
    List<String> attributeDependencies;    // Keep track of attribute names

    public AttributeDependencyUnit(AttributeDependencyGraphNode AttributeDependency) {
        this.AttributeDependency = AttributeDependency;
        this.attributeDependencies = new ArrayList<String>();
    }

    public void addAttributeDependency(String attrName) {
        this.attributeDependencies.add(attrName);
    }
}