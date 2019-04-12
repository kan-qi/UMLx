size_metric_models <- function(){
  
  #otherSizeMetricsData=modelData[c("Effort", "KSLOC", "COCOMO_Estimate", "Priori_COCOMO_Estimate", "UCP", "IFPUG", "MKII", "COSMIC")]
  #otherSizeMetricsData <- na.omit(otherSizeMetricsData)

  models = list()
	
	print('ucp size metric based model')
	ucp.train = function(trainData){
	  ucp.m = lm(Effort~UCP, data=trainData)
	}
	ucp.predict = function(testData){
	  predict(ucp.m, testData)
	}
	models[["ucp"]] = ucp
	
	
	models
	
}
	