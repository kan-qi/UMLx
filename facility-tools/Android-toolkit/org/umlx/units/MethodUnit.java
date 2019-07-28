class MethodUnit {
		public MethodUnit(SootMethod method) {
			this.uuid = UUID.randomUUID().toString();
			this.name = method.getName();
			this.returnType = method.getReturnType().toString();
			this.parameterTypes = new ArrayList<String>();
			for(Type parameter : method.getParameterTypes()) {
				this.parameterTypes.add(parameter.toString());
			}
			this.attachment = method;
			this.signature = method.getSignature();
		}
		String returnType;
		List<String> parameterTypes;
		String name;
		String uuid;
		SootMethod attachment;
		String signature;

		public String getReturnType() {
			return this.returnType;
		}

		public List<String> getParameterTypes() {
			return this.parameterTypes;
		}

		public String toJSONString() {
			StringBuilder str = new StringBuilder();
			str.append("{");
			str.append("\"name\":\""+name+"\",");
			str.append("\"UUID\":\""+uuid+"\",");
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
	}