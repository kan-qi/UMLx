
size_metric_models <- function(){

  models = list()
  
	print('ucp size metric based models')
	
	#define the ucp model
  m_fit.ucp <- function(ucp,dataset){
    ucp$m = lm(Effort~UCP, data=dataset)
    ucp
  }
  
	m_predict.ucp <- function(ucp, testData){
	  predict(ucp$m, testData)
	}
	
	models = c(models, "ucp")
	
	#define the cocomo model
	
	m_fit.cocomo <- function(cocomo,dataset){
	  
	}
	
	m_predict.cocomo <- function(cocomo, testData){
	  testData$COCOMO_Estimate
	}
	
	models = c(models, "cocomo")
	
	#define the fp model
	m_fit.fp <- function(fp,dataset){
	  fp$m = lm(Effort~IFPUG, data=dataset)
	  fp
	}
	
	m_predict.fp <- function(fp, testData){
	  predict(fp$m, testData)
	}
	
	models = c(models, "fp")
	
	#define the cocomo apriori model
	m_fit.cocomo_apriori <- function(cocomo_apriori,dataset){
	  
	}
	
	m_predict.cocomo_apriori <- function(cocomo_apriori, testData){
	  testData$Priori_COCOMO_Estimate
	}
	
	models = c(models, "cocomo_apriori")
	
	#define the cosmic model
	m_fit.cosmic <- function(cosmic,dataset){
	  cosmic$m = lm(Effort~cosmic, data=dataset)
	  cosmic
	}
	
	m_predict.cosmic <- function(cosmic, testData){
	  predict(cosmic$m, testData)
	}
	
	models = c(models, "cosmic")
	
	#define the mkii model
	m_fit.sloc <- function(mkii,dataset){
	  mkii$m = lm(Effort~MKII, data=dataset)
	  mkii
	}
	
	m_predict.mkii <- function(mkii, testData){
	  predict(mkii$m, testData)
	}
	
	models = c(models, "mkii")
	
	#define the sloc model
	m_fit.sloc <- function(sloc,dataset){
	  sloc$m = lm(Effort~KSLOC, data=dataset)
	  sloc
	}
	
	m_predict.sloc <- function(sloc, testData){
	  predict(sloc$m, testData)
	}
	
	models = c(models, "sloc")
	
	#define the ln_slock model
	m_fit.cosmic <- function(ln_sloc,dataset){
	  dataset$log_effort = log(dataset$Effort)
	  dataset$log_sloc = log(dataset$KSLOC)
	  ln_sloc.m = lm(log_effort~log_sloc, data=dataset)
	  ln_sloc
	}
	
	m_predict.ln_slock <- function(ln_slock, testData){
	  
	  a = summary(ln_sloc.m)$coefficients[1,1]
	  b = summary(ln_sloc.m)$coefficients[2,1]
	  cbind(predicted=testData$KSLOC^b+exp(a), actual=testData$Effort)
	  
	}
	
	models = c(models, "ln_slock")
	
	models
	
}
	