class ClassUnit{
		public ClassUnit(SootClass sootClass, boolean isWithinBoundary) {
			this.name = sootClass.getName();
			this.attachment = sootClass;
			this.uuid = UUID.randomUUID().toString();
			this.isWithinBoundary = isWithinBoundary;

			methodUnits = new ArrayList<MethodUnit>();
			attrUnits = new ArrayList<AttrUnit>();
			for(SootMethod method: this.attachment.getMethods()) {
				methodUnits.add(new MethodUnit(method));
			}

			for(SootField sootField : this.attachment.getFields()) {
				AttrUnit attrUnit = new AttrUnit(sootField.getName(), sootField.getType().toString());
				attrUnits.add(attrUnit);
			}
		}
		String uuid;
		SootClass attachment;
		boolean isWithinBoundary;
		List<MethodUnit> methodUnits;
		List<AttrUnit> attrUnits;
		String name;

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
					this.uuid+"\","+
					"\"name\":\""+
					this.name+"\","+
					"\"isWithinBoundary\":\""+
					this.isWithinBoundary+"\","+
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
	}