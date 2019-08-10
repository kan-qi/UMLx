#define the stepwise linear model
m_fit.step_lnr <- function(step_lnr,dataset){
  cols = regression_cols()
  dataset <- dataset[, cols]
  cleanData <- clean(dataset)
  #str_frm <- paste("Effort ~",step_lnr$formula)
  dims <- colnames(cleanData)
  step_lnr$dims <- dims
  str_frm <- paste("Effort ~", paste(dims, collapse="+"))
  frm <- as.formula(str_frm)
  #step_m <- lm(frm, data=dataset)
  step_m <- lm(frm, data=cleanData)
  step_lnr$m <- stepAIC(step_m, direction = "both", trace = FALSE)
  #step_lnr$cols_removed = c()
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

stepwise_linear_model <- function(modelData){
  
  #modelData <- selectData("dsets/android_dataset_5_15.csv")
  #rownames(modelData) <- modelData$Project
  #c1<-c1[-c(5,9,18,19,20,21,25,33,36,38,50,51,52,53,54,55,56,60,61,70,75,79,80,81,83,84,85,89,90,91,92,102,103.106,107,112,114,120,124,125,128,129,130,131,134,135,136,137)]
  #c_name <- list("Tran_Num","Activity_Num","Component_Num","Precedence_Num","Stimulus_Num","Response_Num")
  step_lnr <- list()
  
  #str_frm <- gsub("[\r\n]", "", str_frm)
  #frm <- as.formula(str_frm)
  
}

# Preprocess dataset
clean <- function(dataset){
  
  # numeric data only
  numeric_columns <- unlist(lapply(dataset, is.numeric))
  data.numeric <- dataset[, numeric_columns]
  data.numeric <- data.frame(apply(dataset, 2, as.numeric))
  
  # remove near zero variance columns
  library(caret)
  nzv_cols <- nearZeroVar(data.numeric)
  if(length(nzv_cols) > 0) data <- data.numeric[, -nzv_cols]
  
  sapply(data, function(x) sum(is.na(x)))
  
  ## Impute
  library(mice)
  library(randomForest)
  # perform mice imputation, based on random forests.
  # print(md.pattern(data))
  miceMod <- mice(data, method="rf", print=FALSE, remove_collinear = TRUE)
  # generate the completed data.
  data.imputed <- complete(miceMod)
  # remove collinear columns
  
  #descrCorr <- cor(data.imputed)
  #highCorr <- findCorrelation(descrCorr, 0.90)
  #data.imputed1 <- data.imputed[, -highCorr]
  #coli <- findLinearCombos(data.imputed1)
  
  
  coli <- findLinearCombos(data.imputed)
  data.done <- data.imputed[, -coli$remove]
  data.done$Effort <- dataset$Effort
  return(data.done)
}

regression_cols <- function(){
  #duplicate:
  #"Avg_Actor",
  #"Component_num",
  #"Attribute_num",
  #"Operation_num",
  #"class_num",
  #"Top_Level_Classes",
  #"Average_Depth_Inheritance_Tree",
  #"Average_Number_Of_Children_Per_Base_Class",
  #"Number_Of_Inheritance_Relationships",
  #"Depth_Inheritance_Tree",
  #"para_num", 
  #"usage_num", 
  #"real_num",
  #"assoc_num",
  #"external_oper_num",
  #"data_object_num",
  #"avg_operation",
  #"avg_attribute",
  #"avg_parameter",
  #"avg_usage",
  #"avg_real",
  #"avg_assoc",
  #"avg_instVar",
  #"weighted_oper_num",
  cols <- c(
    ##Karner
    "UseCase_Num",
    "Tran_Num",
    "Actor_Num",
    ##Albrecht
    "DET",
    "RET",
    "ILF",
    "EIF",
    "EI",
    "EO",
    "EQ",
    ##Nitze
    "EXT",
    "ERY",
    "RED",
    "WRT", 
    ##Tan
    "NOET",
    "NOAAE",
    "NORT",
    "NEM",
    "NSR",
    ##Minkiewicz
    "NOS",
    "WMC",
    "MPC",
    "DIT",
    "NIVPC",
    "NUMS",
    "NTLC",
    #"ANWMC",
    #"ADIT",
    "NOCPBC",
    ##kim
    "NOC",
    "NOR",
    "ANAPUC",
    "ANRPUC",
    "NOC",
    "NOIR",
    "NOUR",
    "NORR",
    "NOM",
    "NOP",
    "NOCA",
    "NOASSOC",
    "ANMC",
    "ANPC",
    "ANCAC",
    "ANASSOCC",
    "ANRELC",
    ##zivkovic
    "NOC",
    "NOAPC",
    "NODET",
    "NORET",
    "NOMPC",
    "NPPM",
    "NMT",
    #"Num_User_Story",
    #"Num_Tasks",
    #"project_manager_estimate",
    #"developer_estimate",
    ##Robles & Qi
    "Duration", #NODAY
    "Personnel", #NOCTR
    "PublishTime",
    "StartTime",
    "ActivePersonnel",
    "Commits", #NOCMT
    "Files",
    #"Blanks",
    "Comments",
    "SLOC",
    "Type",
    ##Frances
    #"Services", #"NSCRN", #adding number of screens
    #"Activities",
    #"BroadcastReceivers",
    #"ContentProviders",
    #"LayoutFiles", #"NXML"
    #"Screens",
    ##De Souza
    #"EventHandlers", #"NODV",
    #"Views", #"NOSV",
    "Effort"
  )
}
