
#define the ucp model
m_fit.ucp <- function(ucp,dataset){
  print("ucp fit")
  ucp$m = lm(Effort~UCP, data=dataset)
  ucp
}

m_predict.ucp <- function(ucp, testData){
  print("ucp predict")
  #print(testData$Effort)
  predict(ucp$m, testData)
}

m_profile.ucp <- function(ucp, dataset){
  profileData <- data.frame(UUCP=dataset$UUCP, row.names=rownames(dataset))
}

#define the cocomo model
#m_fit.cocomo <- function(cocomo,dataset){
#  print("cocomo fit")
#  cocomo
#}

#m_predict.cocomo <- function(cocomo, testData){
#  print("cocomo predict")
#  predicted$cocomo_estimate
#}

#define the fp model
m_fit.fp <- function(fp,dataset){
  fp$m = lm(Effort~IFPUG, data=dataset)
  fp
}

m_predict.fp <- function(fp, testData){
  predict(fp$m, testData)
}

m_profile.fp <- function(fp, dataset){
  profileData <- data.frame(AFP=dataset$IFPUG, row.names=rownames(dataset))
}

#define the cocomo apriori model
#m_fit.cocomo_apriori <- function(cocomo_apriori,dataset){
#  cocomo_apriori
#}

#m_predict.cocomo_apriori <- function(cocomo_apriori, testData){
#  predicted = testData$Priori_COCOMO_Estimate
#  names(predicted) = rownames(testData)
#  predicted
#}

#define the cosmic model
m_fit.cosmic <- function(cosmic,dataset){
  cosmic$m = lm(Effort~COSMIC, data=dataset)
  cosmic
}

m_predict.cosmic <- function(cosmic, testData){
  predict(cosmic$m, testData)
}

m_profile.cosmic <- function(cosmic, dataset){
  profileData <- data.frame(COSMIC=dataset$COSMIC, row.names=rownames(dataset))
}

#define the mkii model
#m_fit.mkii <- function(mkii,dataset){
#  mkii$m = lm(Effort~MKII, data=dataset)
#  mkii
#}

#m_predict.mkii <- function(mkii, testData){
#  predict(mkii$m, testData)
#}

# #define the sloc model
# m_fit.sloc <- function(sloc,dataset){
#   sloc$m = lm(Effort~SLOC, data=dataset)
#   sloc
# }
# 
# m_predict.sloc <- function(sloc, testData){
#   predict(sloc$m, testData)
# }
# 
# m_profile.sloc <- function(sloc,dataset){
#   profileData <- data.frame(SLOC=dataset$SLOC, row.names=rownames(dataset))
# }

#define the ksloc model
m_fit.ksloc <- function(ksloc,dataset){
  ksloc$m = lm(Effort~KSLOC, data=dataset)
  ksloc
}

m_predict.ksloc <- function(ksloc, testData){
  predict(ksloc$m, testData)
}

m_profile.ksloc <- function(ksloc,dataset){
  profileData <- data.frame(KSLOC=dataset$KSLOC, row.names=rownames(dataset))
}

# #define the ln_sloc model
# #the simplified version of cocomo model with log transformation: log(y) = log(a) + b*log(x)
# m_fit.ln_sloc <- function(ln_sloc, dataset){
#   #dataset <- categorizedDataset
#   #ln_sloc <- list()
#   dataset <- dataset[dataset$SLOC!=0 & dataset$Effort != 0,]
#   dataset$log_effort = log(dataset$Effort)
#   dataset$log_sloc = log(dataset$SLOC)
#   ln_sloc$m = lm(log_effort~log_sloc, data=dataset)
#   ln_sloc
# }
# 
# m_predict.ln_sloc <- function(ln_sloc, testData){
#   #testData <- modelData
#   a = summary(ln_sloc$m)$coefficients[1,1]
#   b = summary(ln_sloc$m)$coefficients[2,1]
#   predicted=exp(a)*testData$SLOC^b
#   names(predicted) = rownames(testData)
#   predicted
# }
# 
# m_profile.ln_sloc <- function(ln_sloc, dataset){
#   #testData <- modelData
#   profileData <- data.frame(LOG_SLOC=log(dataset$SLOC), row.names=rownames(dataset))
# }

#the baseline model which only takes the average of the output traning dataset.
m_fit.baseline_model <- function(baseline_model, dataset){
  baseline_model$m = list(mean_value = mean(dataset$Effort))
}

m_predict.baseline_model <- function(baseline_model, testData){
  baseline_model$m$mean_value
}

size_metric_models <- function(dataset){
  
  models = list()
  
  #define the cocomo model
  
  models$ucp = list()
  
  #define the cocomo model
  
  #models$cocomo = list()
  
  #define the fp model
  
  models$fp = list()
  
  #define the cocomo apriori model
  
  #models$cocomo_apriori = list()
  
  #define the cosmic model
  
  models$cosmic = list()
  
  #define the mkii model
  
  #models$mkii = list()
  
  # #define the sloc model
  # 
  # models$sloc = list()
  
  #define the Ksloc model
  
  models$ksloc = list()
  
  # #define the ln_sloc model
  # 
  # models$ln_sloc = list()
  
  #define the baseline model
  #models$baseline_model = list()
  
  models
  
}
