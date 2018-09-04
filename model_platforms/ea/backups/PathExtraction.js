/**
 * http://usejsdoc.org/
 */

//install graphlib package 
// create a script to run this file with input to  the file any xml file
(function() {
	var fs = require('fs');
	var xml2js = require('xml2js');
	var parser = new xml2js.Parser();
	var Graph=require('graphlib').Graph;
	var g=new Graph();
	var count=0;
	var total_count=0; //including decision nodes path
	function Extracting_path(parsedResult){
		var components = {};
		var elements = parsedResult['xmi:XMI']['xmi:Extension'][0]['elements'][0]['element'];
		var Conn=parsedResult['xmi:XMI']['xmi:Extension'][0]['connectors'][0]['connector'];
		var nodelist_start=new Array();
		var nodelist_end=new Array();
		var connections=[];
		var start_nodes=new Array(); // stores all the starting nodes
		var end_nodes=new Array();//stores all the stop nodes
		
		for(var i in elements){
			var element = elements[i];
			var component = {
					Category: 'Element',
					StereoType: element['$']['xmi:type'],
					Name: element['$']['name']
			};
			
	 if(component.StereoType==='uml:Activity' || component.StereoType==='uml:Decision' || component.StereoType==='uml:StateNode'){
			if(component.StereoType==='uml:Decision')
				total_count++;
			component.Type='activity';
			var node_ID=element['$']['xmi:idref'];
			if(element['links']&&element['links'][0]&&element['links'][0]['ControlFlow'])
				{
			
				for(var j=0;j<element['links'][0]['ControlFlow'].length;j++)
					{
						var ControlFlow=element['links'][0]['ControlFlow'][j];	
						var ControlFlow_ID=element['links'][0]['ControlFlow'][j]['$']['xmi:id'];
						var start_ID=ControlFlow['$']['start'];
						var end_ID=ControlFlow['$']['end'];
						if(!g.hasNode(start_ID))
							g.setNode(start_ID);
						if(!g.hasNode(end_ID))
							g.setNode(end_ID);
						g.setEdge(start_ID,end_ID);
						if(start_ID===node_ID)
							connections.push([start_ID,end_ID]);
						if(!nodelist_start.includes(start_ID))
							{
							nodelist_start.push(start_ID);
							}
						if(!nodelist_end.includes(end_ID))
							{
							nodelist_end.push(end_ID);
							}
						for(var k=0;k<Conn.length;k++)
							{
							if(Conn[k]['$']['xmi:idref']===ControlFlow_ID)
									{
									
									var start_Name=Conn[k]['source'][0]['model'][0]['$']['name'];
									var end_Name=Conn[k]['target'][0]['model'][0]['$']['name'];
									break;
									}
							}
					}
				}
			}
		}// end of outer most for loop	
		
		for(var p=0,len=nodelist_end.length;p<len;p++)
		{
			if(!nodelist_start.includes(nodelist_end[p]))
				{
				
					end_nodes.push(nodelist_end[p]);
				}
		}
		for(var p=0,len=nodelist_start.length;p<len;p++)
			{
				if(!nodelist_end.includes(nodelist_start[p]))
					{
						start_nodes.push(nodelist_start[p]);
					}
			}
		count=0;
		for(var p=0,len=start_nodes.length;p<len;p++)
			{
				var s=start_nodes[p];
			for(var q=0,len1=end_nodes.length;q<len1;q++)
				{
					var e=end_nodes[q];
					var visited=new Array();
					visited.push(s);
					DFS(g,visited,e);
					
				}
			}
		console.log("total count of paths ",total_count);
	}
	function DFS(g,visited,e)
	{
		var a=g.outEdges(visited[visited.length-1]);
		var adjacencyNodes=new Array();// stores the adjacency nodes for a particular node
		for(var t=0,len=a.length;t<len;t++){
		adjacencyNodes.push(a[t]['w']);
		}  //adjacent nodes
		
		for(var u=0,len=adjacencyNodes.length;u<len;u++)
			{
				if(visited.includes(adjacencyNodes[u])){
				continue;
				}
				if(adjacencyNodes[u]==e){
					visited.push(adjacencyNodes[u]);
					count++;
					total_count++;
					printPath(visited,count);
					
					visited.pop(0);
					break;
				}
			}
		for(var u=0,len=adjacencyNodes.length;u<len;u++)
			{
				if(visited.includes(adjacencyNodes[u])|| adjacencyNodes[u]==e){
					continue;
				}
				visited.push(adjacencyNodes[u]);
				DFS(g,visited,e);
				visited.pop(0);
			}
	}
	function printPath(visited,count)
		{
		console.log(count);
			for(var u=0,len=visited.length;u<len;u++)
				{
				console.log(visited[u]+"->");
				
				}
		}
	module.exports = {
			Extracting_path:function(file,func){
				fs.readFile(file,function(err,data){
					parser.parseString(data,function(err,result){
					var paths=Extracting_path(result);
					if(func){
						fun(paths);
					}
					})
				});
			},
	}
}());