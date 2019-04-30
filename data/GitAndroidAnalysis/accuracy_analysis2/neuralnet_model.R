#define the neuralnet model
m_fit.neuralnet <- function(neuralnet,dataset){
  neuralnet$m = lm(Effort~neuralnet, data=dataset)
  neuralnet
}

m_predict.neuralnet <- function(neuralnet, testData){
  predict(neuralnet$m, testData)
}

neuralnet_model <- function(){
  
  models = list()
  
  models$neuralnet = list()
  
  models
  
}