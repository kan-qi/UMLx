
#define the ucp model
m_fit.ucp <- function(ucp,dataset){
  ucp$m = lm(Effort~UCP, data=dataset)
  ucp
}

m_predict.ucp <- function(ucp, testData){
  predict(ucp$m, testData)
}

m_fit.cocomo <- function(cocomo,dataset){
  cocomo
}

m_predict.cocomo <- function(cocomo, testData){
  testData$COCOMO_Estimate
}



m_fit.fp <- function(fp,dataset){
  fp$m = lm(Effort~IFPUG, data=dataset)
  fp
}

m_predict.fp <- function(fp, testData){
  predict(fp$m, testData)
}

m_fit.cocomo_apriori <- function(cocomo_apriori,dataset){
  cocomo_apriori
}

m_predict.cocomo_apriori <- function(cocomo_apriori, testData){
  testData$Priori_COCOMO_Estimate
}

m_fit.cosmic <- function(cosmic,dataset){
  cosmic$m = lm(Effort~COSMIC, data=dataset)
  cosmic
}

m_predict.cosmic <- function(cosmic, testData){
  predict(cosmic$m, testData)
}

m_fit.mkii <- function(mkii,dataset){
  mkii$m = lm(Effort~MKII, data=dataset)
  mkii
}

m_predict.mkii <- function(mkii, testData){
  predict(mkii$m, testData)
}
m_fit.sloc <- function(sloc,dataset){
  sloc$m = lm(Effort~KSLOC, data=dataset)
  sloc
}

m_predict.sloc <- function(sloc, testData){
  predict(sloc$m, testData)
}

m_fit.ln_sloc <- function(ln_sloc, dataset){
  dataset$log_effort = log(dataset$Effort)
  dataset$log_sloc = log(dataset$KSLOC)
  ln_sloc$m = lm(log_effort~log_sloc, data=dataset)
  ln_sloc
}

m_predict.ln_sloc <- function(ln_sloc, testData){
  
  a = summary(ln_sloc$m)$coefficients[1,1]
  b = summary(ln_sloc$m)$coefficients[2,1]
  cbind(predicted=testData$KSLOC^b+exp(a), actual=testData$Effort)
  
}

	
size_metric_models <- function(){
	  
	  models = list()
	  
	  print('ucp size metric based models')
	  
	  models$ucp = list()
	#define the cocomo model
	
	  models$cocomo = list()
	
	#define the fp model
	
	models$fp = list()
	
	#define the cocomo apriori model
	
	models$cocomo_apriori = list()
	
	#define the cosmic model
	
	models$cosmic = list()
	
	#define the mkii model
	
	models$mkii = list()
	
	#define the sloc model
	
	
	models$sloc = list()
	
	#define the ln_sloc model
	
	models$ln_sloc = list()
	
	models
	
}
	