package kqi.slicer;

import java.util.HashMap;
import java.util.Map;


public class CallgraphNode{
		
		CallgraphNode(String label) {
			this.label = label;
		}
		
		@Override
		public boolean equals(Object obj) {
			if(obj == null || this.label == null || !(obj instanceof CallgraphNode)){
				return false;
			}
			return this.label.equals(((CallgraphNode)obj).label);
		}
		
		@Override
		public String toString() {
			return this.label+this.getTagValues();
		}
		
		public String getPrintable(){
			String majorCategory = this.getMajorCategory();
			if(majorCategory == null){
				return "";
			}
			if(majorCategory.equals("model")){
				return "\""+this.label+"\" [color=green, shape=box]";
			}
			else if(majorCategory.equals("view")){
				return "\""+this.label+"\" [color=yellow]";
				
			}
			else if(majorCategory.equals("control")){
				return "\""+this.label+"\" [color=red]";
				
			}
			else {
				return "\""+this.label+"\" [color=black]";
			}
		}


		String label;
		Map<String, String> tags = new HashMap<String, String>();
		
		String getMajorCategory(){
			String majorCategory = tags.get("majorCategory");
			if(majorCategory != null){
				return majorCategory;
			}
			else {
				return "none";
			}
		}
		
		void setMajorCategory(String majorCategory){
			tags.put("majorCategory", majorCategory);
		}
		
		void tag(String tagName, String tagValue){
			this.tags.put(tagName, tagValue);
		}
		
		String getTagValues(){
			StringBuilder tagValues = new StringBuilder();
			for(String value : tags.values()){
				tagValues.append("["+value+"]");
			}
			return tagValues.toString();
		}
		
		public Integer getStartPos(){
			return Integer.valueOf(this.tags.get("startPos"));
		}
		
		public Integer getEndPos(){
			return Integer.valueOf(this.tags.get("endPos"));
		}
		
		public String getSourceFile(){
			return this.tags.get("srcFile");
		}
		
		void setSourceInfo(String file, Integer startPos, Integer endPos){
			this.tags.put("srcFile", file);
			this.tags.put("startPos", startPos.toString());
			this.tags.put("endPos", endPos.toString());
		}
		
		
	}