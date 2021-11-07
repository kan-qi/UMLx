package org.umlx.units;

import java.util.UUID;

public class AttrUnit {
		private String name;
		private String type;
		private String uuid;

		public AttrUnit(String name, String type) {
			this.setName(name);
			this.setType(type);
			this.setUuid(UUID.randomUUID().toString());
		}

		public String toJSONString() {
			return "{\"name\":\""+this.getName()+"\", \"type\":\""+this.getType()+"\", \"UUID\":\""+this.getUuid()+"\"}";
		}

		public String getUuid() {
			return uuid;
		}

		public void setUuid(String uuid) {
			this.uuid = uuid;
		}

		public String getName() {
			return name;
		}

		public void setName(String name) {
			this.name = name;
		}

		public String getType() {
			return type;
		}

		public void setType(String type) {
			this.type = type;
		}
	}