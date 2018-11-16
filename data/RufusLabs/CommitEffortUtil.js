(function(){

	//var debug = require("./DebuggerOutput.js");
	
	//every other functions which call R script should call this function.
	
	function analyseEffort(data, timesheet, callbackfunc){
			
			var projectDurationDic = {};
			var weeklyContributionDic = {};
			
			var totalDurationStart = Number.POSITIVE_INFINITY;
			var totalDurationEnd = Number.NEGATIVE_INFINITY;
			
			var personnelTimeSheet = timesheet[0];
			console.log(personnelTimeSheet);
			//calculate the project duration and total duration
			for(var i in data){
				data[i].Date = Date.parse(data[i].Date.substring(0,4)+"-"+data[i].Date.substring(4,6)+"-"+data[i].Date.substring(6, 8));
//				console.log(data[i].Date.substring(0,4)+"-"+data[i].Date.substring(4,6)+"-"+data[i].Date.substring(6, 8));
				var projectDuration = projectDurationDic[data[i].Project];
				if(!projectDuration){
					projectDuration = {
							start:Number.POSITIVE_INFINITY,
							end: Number.NEGATIVE_INFINITY
					}
					projectDurationDic[data[i].Project] = projectDuration;
				}
				
				
				var personnel = data[i].Author;
				
				var date = data[i].Date;
				if(date < projectDuration.start){
					projectDuration.start = date;
				}
				if(date > projectDuration.end){
					projectDuration.end = date;
				}
				
				if(date < totalDurationStart){
					totalDurationStart = date;
				}
				if(date > totalDurationEnd){
					totalDurationEnd = date;
				}
			}
			
			function calculateWeeks(start, end){
					var weeks = {};
				 	var ONE_WEEK = 1000 * 60 * 60 * 24 * 7;
				 	
				    var i = 1;
				    var startTime = start;
				    while(startTime+ONE_WEEK < end){
				    	weeks[i] = {
				    			id: i,
				    			start: startTime,
				    			end: startTime+ONE_WEEK
				    	}
				    	startTime = startTime + ONE_WEEK;
				    	i++;
				    }
				    
				    if((startTime-ONE_WEEK) != end)
				    weeks[i+1] = {
				    		id: i+1,
				    		start: startTime-ONE_WEEK,
				    		end: end
				    }
				    
				    
				    return weeks;
			}
			
			function findWeeks(start, end, weeks){
				var coveredWeeks = {};
				
				for(var i in weeks){
					if(start < weeks[i].start && weeks[i].end <= end){
						coveredWeeks[i] = weeks[i];
					}
					
				}
				return coveredWeeks;
			}
			
			function findWeek(date, weeks){
				for(var i in weeks){
					if(date > weeks[i].start && date <= weeks[i].end){
						return weeks[i];
					}
				}
			}
			
			var weeks = calculateWeeks(totalDurationStart, totalDurationEnd);
			
			console.log(weeks);
			
			
			for(var i in projectDurationDic){
				var projectDuration = projectDurationDic[i];
				var coveredWeeks = findWeeks(projectDuration.start, projectDuration.end, weeks);
				projectDuration.weeks = coveredWeeks;
			}
			
			console.log(projectDurationDic);
			
			var personnelContribution = {};
			for(var i in data){
				var personnel = data[i].Author;
				var project = data[i].Project;
				var date = data[i].Date;
				
					if(!personnelContribution[personnel]){
						personnelContribution[personnel] = {};
					}
					
					if(!personnelContribution[personnel][project]){
						personnelContribution[personnel][project] = {};
					}
					
					var week = findWeek(data[i].Date, weeks);
					
					if(!week){
						continue;
					}
					
					if(!personnelContribution[personnel][project][week.id]){
						personnelContribution[personnel][project][week.id] = 1;
					}
				
			}
			
			//populate more on weeks.
			for(var i in personnelContribution){
				for(var j in personnelContribution[i]){
					var weeks = {};
					var lastWeek = 1;
					for(var k in personnelContribution[i][j]){
						k = Number(k);
						if(k - lastWeek <= 5){
							for(var l = 0; l < k - lastWeek; l++){
								weeks[l+lastWeek+1] = 1;
							}
						}
						else{
							weeks[k] = 1;
						}
						lastWeek = k;
					}
					
					personnelContribution[i][j] = weeks;
//					console.log(Object.keys(weeks).length);
				}
			}
			
//			console.log("weeks");
//			console.log(personnelContribution);

			for(var i in personnelContribution){
				
				for(var j in personnelContribution[i]){
					
					for(var k in personnelContribution[i][j]){
						
						if(!weeklyContributionDic[k]){
							weeklyContributionDic[k] = {};
						}
						
						var contributionList = weeklyContributionDic[k];
						
						var weeklyHours = personnelTimeSheet[personnel.replace(/ /g, "")];
						
						if(!contributionList[i]){
							contributionList[i] = {};
						}
						
						projectList = contributionList[i];
						
						if(!projectList[j]){
							projectList[j] = 1;
						}
						
						contributionList[i]['WeeklyHours'] = weeklyHours;
					}
					
				}
				
			}
			
//			console.log(personnelContribution);
			


//			console.log(weeklyContributionDic);	
			
			for(var i in projectDurationDic){
//				if(i !== 'Alltheapps'){
//					continue;
//				}
				
//				console.log(projectDurationDic[i]);
				var effort = 0;
				for(var j in projectDurationDic[i].weeks){
//					var week = projectDurationDic[i].weeks[j];
//					console.log(j);
					var contributionList = weeklyContributionDic[j];
//					console.log(contributionList);
					for(var k in contributionList){
						var projectNum = 0;
						var contributed = false;
						for(var l in contributionList[k]){
							if(l !== "WeeklyHours"){
								projectNum++;
							}
							
							if(l === i){
								contributed = true;
							}
						}
						if(contributed){
						effort  += 1/projectNum*contributionList[k].WeeklyHours;
						}
//						console.log(k+" "+1/projectNum*contributionList[k].WeeklyHours);
					}
				}
				
				projectDurationDic[i].effort = effort;
				console.log(i+" "+effort);
			}
			
			
//			console.log(projectDurationDic['Alltheapps']);
	}
	
	module.exports = {
			analyseEffort: analyseEffort
	}
})();
