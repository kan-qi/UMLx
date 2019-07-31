package org.umlx.units;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import soot.SootClass;
import soot.SootField;
import soot.SootMethod;

public class ClassUnit{
		public ClassUnit(SootClass sootClass, boolean isWithinBoundary) {
			this.setName(sootClass.getName());
			this.setAttachment(sootClass);
			this.setUuid(UUID.randomUUID().toString());
			this.setWithinBoundary(isWithinBoundary);

			methodUnits = new ArrayList<MethodUnit>();
			attrUnits = new ArrayList<AttrUnit>();
			for(SootMethod method: this.getAttachment().getMethods()) {
				methodUnits.add(new MethodUnit(method));
			}

			for(SootField sootField : this.getAttachment().getFields()) {
				AttrUnit attrUnit = new AttrUnit(sootField.getName(), sootField.getType().toString());
				attrUnits.add(attrUnit);
			}
		}
		private String uuid;
		private SootClass attachment;
		private boolean isWithinBoundary;
		List<MethodUnit> methodUnits;
		List<AttrUnit> attrUnits;
		private String name;

		public List<AttrUnit> getAttr(){
			return this.attrUnits;
		}

		public List<MethodUnit> getMethods(){
			return this.methodUnits;
		}

		public List<AttrUnit> getAttributes() {
			return this.attrUnits;
		}

		public String toJSONString() {
			StringBuilder str = new StringBuilder();
			str.append("{\"UUID\":\""+
					this.getUuid()+"\","+
					"\"name\":\""+
					this.getName()+"\","+
					"\"isWithinBoundary\":\""+
					this.isWithinBoundary()+"\","+
					"\"methodUnits\":["
			);
			int i = 0;
			for(MethodUnit methodUnit : methodUnits) {
				str.append(methodUnit.toJSONString());
				if(i != methodUnits.size() - 1) {
					str.append(",");
				}
				i++;
			}
			str.append( "],\"attrUnits\":[");
			i = 0;
			for(AttrUnit attrUnit : attrUnits) {
				str.append(attrUnit.toJSONString());
				if(i != attrUnits.size() - 1) {
					str.append(",");
				}
				i++;
			}
			str.append("]}");
			return str.toString();
		}

		public String getName() {
			return name;
		}

		public void setName(String name) {
			this.name = name;
		}

		public String getUuid() {
			return uuid;
		}

		public void setUuid(String uuid) {
			this.uuid = uuid;
		}

		public SootClass getAttachment() {
			return attachment;
		}

		public void setAttachment(SootClass attachment) {
			this.attachment = attachment;
		}

		public boolean isWithinBoundary() {
			return isWithinBoundary;
		}

		public void setWithinBoundary(boolean isWithinBoundary) {
			this.isWithinBoundary = isWithinBoundary;
		}
	}