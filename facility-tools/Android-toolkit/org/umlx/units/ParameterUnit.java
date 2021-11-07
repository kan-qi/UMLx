package org.umlx.units;

public class ParameterUnit{
	String name;
	String type;

	public ParameterUnit(String name, String type){
		this.name = name;
		this.type = type;
	}

	public String toJSONString() {
		StringBuilder str = new StringBuilder();
		str.append("{");
		str.append("\"name\":\""+name+"\",");
		str.append("\"type\":\""+type);
		str.append("}");
		return str.toString();
	}
}