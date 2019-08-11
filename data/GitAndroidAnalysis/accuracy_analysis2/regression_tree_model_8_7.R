# Regression Tree Example
library(rpart)
library(rpart.plot)
library(maptree)
library(tree)

#select the most appropriate cp value
cp.select <- function(big.tree) {
  min.x <- which.min(big.tree$cptable[, 4]) #column 4 is xerror
  for(i in 1:nrow(big.tree$cptable)) {
    if(big.tree$cptable[i, 4] < big.tree$cptable[min.x, 4] + big.tree$cptable[min.x, 5]) {
      cp = big.tree$cptable[i, 1] #column 5: xstd, column 1: cp
      
      # prevent overfitting
      if (cp > 0.1 && i != nrow(big.tree$cptable)) {
        print("CP VALUE is:")
        print(big.tree$cptable[i + 1, 1])
        return(big.tree$cptable[i + 1, 1])
      }
      else {
        return(cp) #column 5: xstd, column 1: cp 
      }
    }
  }
}


#define the regression tree model
m_fit.reg_tree <- function(reg_tree,dataset){
  #reg_tree$m = lm(Effort~reg_tree, data=dataset)
  #fit <- rpart(Effort~UseCase_Num + Tran_Num + Activity_Num + Component_Num + Precedence_Num + Stimulus_Num + Tran_Num, 
  #             method="anova", data=android_dataset_4_26)
  
  #if (features == 'default') {
    # 51 features left after dropping: 1. cols containing all missing values (all zeros); 2. duplucated cols 
  #  features <- c('Effort', 'NT', 'NORT', 'EUCP', 'DM', 'Tran_Num', 'EXUCP', 'EXT', 'ANPC', 'class_num', 'Attribute_num', 'real_num', 'MPC', 'COSMIC', 'Complex_UC', 'ANAPUC', 'EF', 'NEM', 'Personnel', 'TRAN_NA', 'EXTIVK', 'Avg_TD', 'avg_attribute', 'objectdata_num', 'NOP', 'SWTIII', 'NOR', 'NOUC', 'ControlNum', 'IFPUG', 'Average_UC', 'Component_num', 'WMC', 'RR', 'Arch_Diff', 'UCP', 'Type', 'Activity_Num', 'ANWMC', 'Actor_Num', 'MKII', 'Priori_COCOMO_Estimate', 'Avg_TL', 'INT', 'UseCase_Num', 'avg_real', 'NT.1', 'EXTCLL', 'avg_usage', 'Boundary_Num', 'Simple_UC', 'COCOMO_Estimate')
  #}
  #train_df <- dataset[,names(dataset)%in%features]
  # train_df['Type'] <- apply(train_df['Type'], 1, function(x) if(x == 'Website') 1 else if (x =='Mobile App') 2 else if (x=='Information System') 3 else 4)

  #features = 'default'
  #dataset = modelData
  
  prune = TRUE
  plot_tree = FALSE
  
  regression_cols = reg_tree$regression_cols;
  regressionData <- dataset[, regression_cols];
  train_df <- clean_tree(regressionData[, colnames(regressionData)!="Effort"])
  dims <- colnames(train_df)
  reg_tree$dims <- dims
  train_df$Effort = regressionData$Effort  
  
  # rt = rpart(Effort~., method="class", data=train_df)
  
  # define the regression model with formula Effort ~ x1 + x2 +..
  rt = rpart(str_frm <- paste("Effort ~", paste(dims, collapse="+")), control = rpart.control(minsplit = 2), data=train_df)
  
  # show the result of the regression tree
  # draw.tree(rt) 
  
  # show a better looking tree
  # prp(rt,box.col=c("Grey", "Orange")[rt$frame$yval],varlen=0, type=1,under=TRUE)
  
  # show the relation between Complexity Parameter and x-error
  # For getting higher mmre and lower pre
  plotcp(rt)
  printcp(rt)
  

  reg_tree$m <- rt

  # plotcp(rt)
  #cross validation to check where to stop pruning
  
  # set.seed(3)
  # 
  # cv_tree = cv.tree(rt, FUN = prune.misclass)
  # 
  # name(cv_tree)
  # 
  # plot(cv_tree$size,
  #      cv_tree$dev,
  #      type = "b"
  #      )
  
  # rt$cptable
  
  #pruning
  if (prune == TRUE) {
    # cp_id <- which.min(rt$cptable[,"xerror"]) #id of min xerror
    # cp <- rt$cptable[cp_id,"CP"] #cp threshold
    # rt_pruned <- prune(rt,cp=0.05)
    
    getCP = cp.select(rt)
    if (getCP <= 0.05) {
      rt_pruned <- prune(rt, cp = getCP)
      # rt_pruned=prune(rt,cp=rt$cptable[which.min(rt$cptable[,"xerror"]),"CP"])
    }
    else {
      rt_pruned <- prune(rt,cp=0.05)
    }
    reg_tree$m <- rt_pruned
  }
  
  if (plot_tree == TRUE) {
    print(reg_tree$m)
    plot(reg_tree$m)
    text(reg_tree$m)
  }
  
  reg_tree
}

m_predict.reg_tree <- function(reg_tree, testData){
  
  #if (predictors == 'default') {
    # predict variable names (no target variable)
  #  predictors <- c('NT', 'NORT', 'EUCP', 'DM', 'Tran_Num', 'EXUCP', 'EXT', 'ANPC', 'class_num', 'Attribute_num', 'real_num', 'MPC', 'COSMIC', 'Complex_UC', 'ANAPUC', 'EF', 'NEM', 'Personnel', 'TRAN_NA', 'EXTIVK', 'Avg_TD', 'avg_attribute', 'objectdata_num', 'NOP', 'SWTIII', 'NOR', 'NOUC', 'ControlNum', 'IFPUG', 'Average_UC', 'Component_num', 'WMC', 'RR', 'Arch_Diff', 'UCP', 'Type', 'Activity_Num', 'ANWMC', 'Actor_Num', 'MKII', 'Priori_COCOMO_Estimate', 'Avg_TL', 'INT', 'UseCase_Num', 'avg_real', 'NT.1', 'EXTCLL', 'avg_usage', 'Boundary_Num', 'Simple_UC', 'COCOMO_Estimate')
  #}
  
  #print(reg_tree$dims)
  
  for(i in 1:length(reg_tree$dims)){
    print(reg_tree$dims[i])
    testData[, reg_tree$dims[i]]
  }
  test_df <- testData[, reg_tree$dims]
  #test_df <- testData[,names(testData)%in%predictors]
  # test_df['Type'] <- apply(test_df['Type'], 1, function(x) if(x == 'Website') 1 else if (x =='Mobile App') 2 else if (x=='Information System') 3 else 4)

  predict(reg_tree$m, test_df)
}

regression_tree_model <- function(modelData, regression_cols){
  
  reg_tree = list()
  
  reg_tree$regression_cols = regression_cols

  reg_tree
  
}



# Preprocess dataset
clean_tree <- function(dataset){
  
  # numeric data only
  #numeric_columns <- unlist(lapply(dataset, is.numeric))
  #data.numeric <- dataset[, numeric_columns]
  #data.numeric <- data.frame(apply(dataset, 2, as.numeric))
  
  # remove near zero variance columns
  #dataset <- regressionData
  
  library(caret)
  nzv_cols <- nearZeroVar(dataset)
  if(length(nzv_cols) > 0) data <- dataset[, -nzv_cols]
  
  sapply(data, function(x) sum(is.na(x)))
  
  ## Impute
  library(mice)
  library(randomForest)
  # perform mice imputation, based on random forests.
  # print(md.pattern(data))
  miceMod <- mice(data, method="rf", print=FALSE, remove_collinear = TRUE)
  # generate the completed data.
  data.imputed <- mice::complete(miceMod)
  # remove collinear columns
  
  #descrCorr <- cor(data.imputed)
  #highCorr <- findCorrelation(descrCorr, 0.90)
  #data.imputed1 <- data.imputed[, -highCorr]
  #coli <- findLinearCombos(data.imputed1)
  
  
  #coli <- findLinearCombos(data.imputed)
  #data.done <- data.imputed[, -coli$remove]
  #data.done$Effort <- dataset$Effort
  data.done <- data.imputed
  return(data.done)
}


# 
# printcp(fit) # display the results
# plotcp(fit) # visualize cross-validation results
# summary(fit) # detailed summary of splits
# 
# # create additional plots
# par(mfrow=c(1,2)) # two plots on one page
# rsq.rpart(fit) # visualize cross-validation results
# 
# # plot tree
# plot(fit, uniform=TRUE,
#      main="Regression Tree for Mileage ")
# text(fit, use.n=TRUE, all=TRUE, cex=.8)
# 
# # create attractive postcript plot of tree
# post(fit, file = "tree2.ps",
#      title = "Regression Tree for Mileage ")
# # prune the tree
# pfit<- prune(fit, cp=0.01160389) # from cptable
# 
# # plot the pruned tree
# plot(pfit, uniform=TRUE,
#      main="Pruned Regression Tree for Mileage")
# text(pfit, use.n=TRUE, all=TRUE, cex=.8)
# post(pfit, file = "ptree2.ps",
#      title = "Pruned Regression Tree for Mileage")
# 
