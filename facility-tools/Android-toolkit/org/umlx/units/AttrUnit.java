	private class AttrUnit {
		String name;
		String type;
		String uuid;

		public AttrUnit(String name, String type) {
			this.name = name;
			this.type = type;
			this.uuid = UUID.randomUUID().toString();
		}

		public String toJSONString() {
			return "{\"name\":\""+this.name+"\", \"type\":\""+this.type+"\", \"UUID\":\""+this.uuid+"\"}";
		}
	}