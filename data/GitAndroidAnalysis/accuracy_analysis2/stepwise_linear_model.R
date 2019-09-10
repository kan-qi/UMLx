#define the stepwise linear model
m_fit.step_lnr <- function(step_lnr,dataset){
  #step_lnr <- models$step_lnr
  #dataset = modelData
  
  cols = step_lnr$regression_cols
  #for(i in 1:length(cols)){
  #  print(cols[i])
  #  print(dataset[, cols[i]])
  #}
  dataset <- dataset[, cols]
  
  cleanData <- clean_step(dataset[, colnames(dataset) != "Effort"])
  #str_frm <- paste("Effort ~",step_lnr$formula)
  dims <- colnames(cleanData)
  print(dims)
  step_lnr$dims <- dims
  str_frm <- paste("Effort ~", paste(dims, collapse="+"))
  #print(str_frm)
  regressionData <- cleanData
  regressionData$Effort <- dataset$Effort
  frm <- as.formula(str_frm)
  #step_m <- lm(frm, data=dataset)
  step_m <- lm(frm, data=regressionData)
  step_lnr$m <- step_m
  
  tryCatch( { step_lnr$m <- stepAIC(step_m, direction = "both", trace = FALSE) }
            , error = function(e) {
              print("-infinite AIC")
              })
 
  #step_lnr$cols_removed = c()
  #print(step_lnr$m)
  step_lnr
}

m_predict.step_lnr <- function(step_lnr, testData){
  # numeric data only
  testData <- testData[, step_lnr$dims]
  numeric_columns <- unlist(lapply(testData, is.numeric))
  data.numeric <- testData[, numeric_columns]
  data.numeric <- data.frame(apply(testData, 2, as.numeric))
  #cols_removed = step_lnr$cols_removed
  predicted <- predict(step_lnr$m, testData)
}

m_profile.step_lnr <- function(step_lnr, dataset){
  #testData <- modelData
  profileData <- data.frame(STEP=m_predict(step_lnr, dataset), row.names=rownames(dataset))
}

stepwise_linear_model <- function(modelData, regression_cols=c()){
  
  #modelData <- selectData("dsets/android_dataset_5_15.csv")
  #rownames(modelData) <- modelData$Project
  #c1<-c1[-c(5,9,18,19,20,21,25,33,36,38,50,51,52,53,54,55,56,60,61,70,75,79,80,81,83,84,85,89,90,91,92,102,103.106,107,112,114,120,124,125,128,129,130,131,134,135,136,137)]
  #c_name <- list("Tran_Num","Activity_Num","Component_Num","Precedence_Num","Stimulus_Num","Response_Num")
  
  step_lnr <- list(
    regression_cols=regression_cols
  )
  
  #str_frm <- gsub("[\r\n]", "", str_frm)
  #frm <- as.formula(str_frm)
  
  }

  # Preprocess dataset
clean_step <- function(dataset){
  #print("clean....")
  #print(rownames(dataset))
  # numeric data only
  numeric_columns <- unlist(lapply(dataset, is.numeric))
  data.numeric <- dataset[, numeric_columns]
  data.numeric <- data.frame(apply(dataset, 2, as.numeric))
  
  ## Impute
  library(mice)
  library(randomForest)
  # perform mice imputation, based on random forests.
  # print(md.pattern(data))
  
  data.imputed = data.numeric
  tryCatch( { 
       miceMod <- mice(data.numeric, method="rf", print=FALSE, remove_collinear = TRUE)
       # generate the completed data.
       data.imputed <- mice::complete(miceMod)
    }, error = function(e) {
          print("nothing left to impute")
  })
  
  # remove near zero variance columns
  library(caret)
  nzv_cols <- nearZeroVar(data.imputed)
  if(length(nzv_cols) > 0) data <- data.imputed[, -nzv_cols]
  
  #sapply(data, function(x) sum(is.na(x)))
  
  if(is.null(data) || is.null(dim(data)) || dim(data)[2] < 2){
    data = data.imputed
  }
  
  # remove collinear columns
  #need to consider the number of columns after colinearity analysis to make sure that the column number is fewer than row number.
  
  descrCorr <- cor(data)
  data.done = data
  #cor_limits <- c(0.99, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1)
  cor_limits <- seq(0.99, 0.01, by = -0.02)
  for(i in 1:length(cor_limits)){
    highCorr <- findCorrelation(descrCorr, cor_limits[i])
    
    data.removed <- data[, -highCorr]
    #coli <- findLinearCombos(data.imputed1)
    
    #print("data frame removed: ")
    #print(highCorr)
    #print(c(ncol = ncol(data.removed), nrow = nrow(data.removed)))
    
    if(is.null(data.removed) || is.null(dim(data.removed)) || dim(data.removed)[2] < 2){
      break
    }
    
    #ste the ratio between variables and data to avoid "inifite -AIC" proglem.
    if(nrow(data.removed) > ncol(data.removed)*2){
      data.done = data.removed
      break
    }
  }
  
  #coli <- findLinearCombos(data.imputed)
  #print(coli)
  #data.done <- data.imputed[, -coli$remove]
  
  return(data.done)
}
