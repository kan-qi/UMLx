#define the regression tree model
m_fit.reg_tree <- function(reg_tree,dataset){
  reg_tree$m = lm(Effort~reg_tree, data=dataset)
  reg_tree
}

m_predict.reg_tree <- function(reg_tree, testData){
  predict(reg_tree$m, testData)
}

regression_tree_model <- function(){
  
  models = list()
  
  models$reg_tree = list()
  
  models
  
}