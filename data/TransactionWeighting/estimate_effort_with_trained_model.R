estimateEffortWithTrainedModels <- function(data, trainedModelParameters){
  
  #trainedModelParameters <- readRDS(file="train_model_parameters.rds")
  data <- data.frame(apply(subset(data, select = c("TL", "TD", "DETs")), 2, function(x) as.numeric(x)))
  data <- na.omit(data)
  
  if(nrow(data) < 1){
    next
  }
  
  classifiedData <- classify(fileData, trainedModelParameters.cutPoints)
  predicted <- predict.blm(trainedModelParameters.model, newdata = classifiedData)
  
  predicted
}
