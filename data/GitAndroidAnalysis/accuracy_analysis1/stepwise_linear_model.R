#define the stepwise linear model
m_fit.step_lnr <- function(step_lnr,dataset){
  step_lnr$m = lm(Effort~step_lnr, data=dataset)
  step_lnr
}

m_predict.step_lnr <- function(step_lnr, testData){
  predict(step_lnr$m, testData)
}

stepwise_linear_model <- function(){
  
  models = list()
  
  models$step_lnr = list()
  
  models
  
}