source('regression_tree_model.R')

validationRegressionTree <- function(model, testData){
  predicted = m_predict.reg_tree(model, testData)
  
  return(predicted)
}

fit_by_data <- function(model,dataset){
  reg_tree = m_fit.reg_tree(model,dataset)
  return(reg_tree)
}

dataset = data.frame(read.csv(file="dsets/D1.csv", header = T))
reg_tree = regression_tree_model(data)
reg_tree = fit_by_data(reg_tree,dataset)
prp(reg_tree$m,box.col=c("Grey", "Orange")[reg_tree$m$frame$yval],varlen=0, type=1,under=TRUE)

dataset = data.frame(read.csv(file="dsets/D2.csv", header = T))
reg_tree = regression_tree_model(data)
reg_tree = fit_by_data(reg_tree,dataset)
prp(reg_tree$m,box.col=c("Grey", "Orange")[reg_tree$m$frame$yval],varlen=0, type=1,under=TRUE)

dataset = data.frame(read.csv(file="dsets/D3.csv", header = T))
reg_tree = regression_tree_model(data)
reg_tree = fit_by_data(reg_tree,dataset)
prp(reg_tree$m,box.col=c("Grey", "Orange")[reg_tree$m$frame$yval],varlen=0, type=1,under=TRUE)

dataset = data.frame(read.csv(file="dsets/D4.csv", header = T))
reg_tree = regression_tree_model(data)
reg_tree = fit_by_data(reg_tree,dataset)
prp(reg_tree$m,box.col=c("Grey", "Orange")[reg_tree$m$frame$yval],varlen=0, type=1,under=TRUE)
# print(reg_tree$dims)

# predict model
# testData = data.frame(read.csv(file="dsets/D2.csv", header = T))
# predicted = validationRegressionTree(reg_tree,testData)
