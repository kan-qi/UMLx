library(glmnet)
library(plotmo) # for plot_glmnet

Lasso_range = function(x, y, k){
  # inputs:
      # x_matrix, a matrix containing independent variables
      # y: vector of dependent varaibles
      # k: the length of sequence
  # output:
      # seq: a sequence of lambdaa from high to low
  #x = x_data
  #y = y_data
  #k = 100
  
  
  # define my own scale function to simulate that in glmnet
  myscale = function(x) sqrt(sum((x - mean(x)) ^ 2) / length(x))
  
  # normalize x
  sx = as.matrix(scale(x, scale = apply(x, 2, myscale)))
  # sy = as.vector(scale(y, scale = myscale(y)))
  max_lambda = max(abs(colSums(sx * as.vector(y)))) / dim(sx)[1]
  # The default depends on the sample size nobs relative to the number of variables nvars. 
  # If nobs > nvars, the default is 0.0001, close to zero. 
  
  # If nobs < nvars, the default is 0.01. 
  # A very small value of lambda.min.ratio will lead to a saturated fit in the nobs < nvars case. 
  ratio = 0
  if(dim(sx)[1] > dim(sx)[2]){
    ratio = 0.0001
  }else{
    ratio = 0.01
  }
  min_lambda = max_lambda * ratio
  log_seq = seq(from  = log(min_lambda), to = log(max_lambda), length.out = k)
  seq = sort(exp(log_seq), decreasing = T)
  #print(seq)
  return(seq)
}


#define the lasso model
m_fit.lasso <- function(lasso,dataset){
  #lasso = list()
  
  ind_variables = c("Activity_Num", "Component_Num", "Precedence_Num",	"Stimulus_Num",	"Response_Num",	"Tran_Num",	"Boundary_Num")
  x_data <- data.matrix(dataset[ind_variables])
  y_data <- data.matrix(dataset[c("Effort")])
  
  
  #lasso_lm <- glmnet(x = x_data, y = y_data, alpha = 1, standardize = T)
  
  set.seed(2)
  lambda_list <- Lasso_range(x_data,y_data,100)
  cvfit = cv.glmnet(x_data,y_data,
                    standardize = T, lambda = lambda_list, type.measure = 'mse', nfolds = 5, alpha = 1)
  
  lasso_lm = cvfit$glmnet.fit
  
  #print(lasso_lm$lambda)
  #plot(lasso_lm)
  #for 10 biggest final features
  #plot_glmnet(lasso_lm)                             # default colors
  #plot_glmnet(lasso_lm, label=10)
  lasso$m = lasso_lm
  lasso$m$cv_lambda = min(cvfit$cvm)
  lasso$m$cvfit = cvfit
  lasso$m$lambda_list = lambda_list
  lasso$m$ind_variables = ind_variables
  lasso
  
}

m_predict.lasso <- function(lasso, testData){
  #testData <- modelData
  predicted <- predict(lasso$m,newx=as.matrix(testData[,lasso$m$ind_variables]),s=lasso$m$cv_lambda)
  predicted_names <- rownames(predicted)
  predicted <- as.vector(predicted[,1])
  names(predicted) <- predicted_names
  predicted
  #print(predicted)
}

lasso_model <- function(dataset){
  
  parameters = list()
  
}

moel_data_cols <- function(){
  cols <- c(
    #Tan
    
    #Costagliola
    
    #Minkiewicz
    
    #Albrecht
    
    #Karner
    
    #kim
    
    #zivkovic
    
    #Frances
    
    #Nitze
    
    #De Souza
    
    #Robles & Qi
    
    #"UseCase_Num",
    #"Tran_Num",
    #"Actor_Num",
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
    "DET",
    "RET",
    "ILF",
    "EIF",
    "EI",
    "EO",
    "EQ",
    "EXT",
    "ERY",
    "RED",
    "WRT", 
    "NOET",
    "NOAAE",
    "NORT",
    "NEM",
    "NSR",
    "NOS",
    "WMC",
    "MPC",
    "DIT",
    "NIVPC",
    "NUMS",
    "NTLC",
    "ANWMC",
    "ADIT",
    "NOCPBC",
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
    "NOCAL",
    "NOASSOC",
    "ANMC",
    "ANPC",
    "ANCAC",
    "ANASSOCC",
    "ANRELC",
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
    "Effort",
    "Duration", #NODAY
    "Personnel", #NOCTR
    "PublishTime",
    "StartTime",
    "activePersonnel",
    "Commits", #NOCMT
    "Files",
    #"Blanks",
    "Comments",
    "SLOC",
    #"NSCRN", #adding number of screens
    #"NOSV",
    #"NODV",
    #"NXML"
  )
}