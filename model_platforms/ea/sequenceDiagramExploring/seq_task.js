 generateSeqDia = function(){
 var jsonObj = {
	"actor": {
		"name": "Bob",
		"color": "red"
	},
	"participant": {
		"name": "Alice",
		"L": "I have a really\nlong name"
	},
	"directions": [{
			"pairs": "Alice->Bob",
			"content": "Authentication Request"
		},
		{
			"pairs": "Bob->Alice",
			"content": "Authentication Response"
		},
		{
			"pairs": "Bob->L",
			"content": "log transaction"
		}
	]
}

var result = "@startuml actor ";
result += jsonObj.actor.name + " #"+jsonObj.actor.color;
result += " participant " + jsonObj.participant.name;
result +=" participant '" + jsonObj.participant.L+"'"+"as L #99ff99";
for(var i = 0; i < jsonObj.directions.length;i++){
  result += " "+jsonObj.directions[i]['pairs']+":"+jsonObj.directions[i]['content'];
}
result += " @enduml";
console.log(result);
return result;
}
