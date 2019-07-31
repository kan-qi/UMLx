package org.umlx.units;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import soot.SootMethod;
import soot.Type;

public class MethodUnit {
		public MethodUnit(SootMethod method) {
			this.setUuid(UUID.randomUUID().toString());
			this.setName(method.getName());
			this.returnType = method.getReturnType().toString();
			this.parameterTypes = new ArrayList<String>();
			for(Type parameter : method.getParameterTypes()) {
				this.parameterTypes.add(parameter.toString());
			}
			this.setAttachment(method);
			this.setSignature(method.getSignature());
		}
		String returnType;
		List<String> parameterTypes;
		private String name;
		private String uuid;
		private SootMethod attachment;
		private String signature;

		public String getReturnType() {
			return this.returnType;
		}

		public List<String> getParameterTypes() {
			return this.parameterTypes;
		}

		public String toJSONString() {
			StringBuilder str = new StringBuilder();
			str.append("{");
			str.append("\"name\":\""+getName()+"\",");
			str.append("\"UUID\":\""+getUuid()+"\",");
			str.append("\"returnType\":\""+returnType+"\",");
			str.append("\"parameterTypes\":[");
			int i = 0;
			for(String parameterType : parameterTypes) {
				str.append("\""+parameterType+"\"");
				if(i != parameterTypes.size()-1) {
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

		public SootMethod getAttachment() {
			return attachment;
		}

		public void setAttachment(SootMethod attachment) {
			this.attachment = attachment;
		}

		public String getUuid() {
			return uuid;
		}

		public void setUuid(String uuid) {
			this.uuid = uuid;
		}

		public String getSignature() {
			return signature;
		}

		public void setSignature(String signature) {
			this.signature = signature;
		}
	}