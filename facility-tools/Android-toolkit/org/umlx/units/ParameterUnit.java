public class ParameterUnit{
	String name;
	String type;

	Parameter(name, type){
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