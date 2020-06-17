#library(rpart)
#library(rpart.plot)
#library(maptree)
#library(tree)
#library(cluster)
library(caret)
library(lattice)
library(ggplot2)

#loads dataset.
data_load <- function(){
  dataset <- read.table("/Users/Shared/Relocated Items/Security/Rachel/Study/USC/Coursework/Directed Research/git/data/Benchmark/dsets/D1.csv", 
                        header = TRUE, sep = ",")
  
  #demonstrates the structure of dataset.
  str(dataset)
  
  #checks if there are missing values.
  sum(is.na(dataset))
  dataset[!complete.cases(dataset),] #checks the row of missing values.
  newdata <- na.omit(dataset) #delects the row of missing values 
  #since there are some other data entry problems.
  return(newdata)
}

#Pre-processing data.
data_clean <- function(newdata){
  
  #select numeric data only.
  num_cols <- unlist(lapply(newdata, is.numeric))
  data_num <- newdata[, num_cols]
  
  #removes near zero variance columns.
  nzv_cols <- nearZeroVar(data_num) #returns the cols number of nearZeroVar
  data <- data_num[, -nzv_cols]
  
  #removes the first column - ID.
  data <- data[, -1]
  
  #draws hist of Efforts to check if any outliers.
  hist(data$Effort, breaks = 200, main="Distribution of Effort",xlab="Effort")
  return(data)
}

#Resamples the dataset - removes ouliers - >=20000-#5.
data_resample = data[data$Effort < 20000, ]

#Splits datasets into train and test - 80% for train, 20% for test.
train.index <- sample(x = 1: nrow(data_resample), size = ceiling(0.8 * nrow(data_resample)))
train = data_resample[train.index, ]
test = data_resample[-train.index, ]

#Features Selection - Random Forest.
set.seed(1234)

feature_selection <- function(data_resample, train, test){
  library(randomForest)

  #checks the importance of features
  rf.features = randomForest(Effort~., data = data_resample, mtry=3, importance=TRUE, na.action = na.omit)
  features_imp = round(importance(rf.features),2)
  varImpPlot(rf.features) #plots the features importance.
  
  #Cross Validation for features selection.
  myfeatures = cbind(data_resample[1:88], 
                     matrix(runif(10 * nrow(data_resample)), nrow(data_resample), 10))
  result = rfcv(myfeatures, data_resample$Effort, cv.fold = 5)
  #plots the relation between error and number of variables.
  with(result, plot(n.var, error.cv, log="x", type="o", lwd=2))#selects top 6 features.
  
  top_imp = head(features_imp[order(-features_imp[,1]),]) #dec order to find top 6 features.
  return(top_imp)
}

#Model Building & Prediction- Random Forest.
m_fit.rf <- function(data_resample, train, test){
  #initiates ntree to check the appropriate number.
  rf_ntree <- randomForest(Effort~., data = data_resample, ntree = 100, importance = TRUE, proximity=TRUE)
  plot(rf_ntree) #treesize = 40
  
  #trains Random Forest model with the most important features.
  #formula depends on the top 6 measures output in function feature_selection.
  formula <- Effort~Personnel + activePersonnel + Commits + Blanks + NOC + NOASSOC
  m.rf <- randomForest(formula, data = train, 
                        importance=TRUE, ntree=40)
  
  #predicts the Efforts of the test data.
  pred <- predict(m.rf, test)
  sum <- 0
  for(i in 1:nrow(test)){
    sum <- sum + abs(test[i:i, 1:1] - pred[i:i])
  }
  #returns the average errors of the predictions.
  avg_error = sum/nrow(test)
  return(avg_error)
}
