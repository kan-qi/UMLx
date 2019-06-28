package kqi.slicer;

import java.util.ArrayList;

class CallgraphEdge{
		CallgraphNode start;
		CallgraphNode end;
		ArrayList<String> tags = new ArrayList<String>();
		
		CallgraphEdge(CallgraphNode start, CallgraphNode end, String...tags){
			this.start = start;
			this.end = end;
			for(String tag : tags){
				this.tags.add(tag);
			}
		}
		
		public String toString(){
			return start+"->"+end;
		}
		
		public String getPrintable(){
			StringBuilder tagString = new StringBuilder();
			if(tags.size() > 0){
				tagString.append("[");
				for(int i=0; i<tags.size(); i++){
					tagString.append(tags.get(i));
					if(i != tags.size() -1){
						tagString.append(",");
					}
				}
				tagString.append("]");
			}
			return "\""+start.label+"\"->\""+end.label+"\""+tagString.toString();
		}

		@Override
		public boolean equals(Object obj) {
			if(!(obj instanceof CallgraphEdge)){
				return false;
			}
			else{
				CallgraphEdge counterPart = (CallgraphEdge)obj;
				return start == counterPart.start && end == counterPart.end;
			}
		}

		public void putTags(String...tags) {
			for(String tag : tags){
				this.tags.add(tag);
			}
			
		}
		
	}