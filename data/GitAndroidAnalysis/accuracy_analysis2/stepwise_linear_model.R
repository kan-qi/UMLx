#define the stepwise linear model
m_fit.step_lnr <- function(step_lnr,dataset){

	str_frm <- paste("Effort ~",step_lnr$formula)
	frm <- as.formula(str_frm)
    step_m <- lm(frm, data=dataset)
    step_lnr$m <- stepAIC(step_m, direction = "both", trace = FALSE)
    step_lnr$cols_removed = c()
    step_lnr
}

m_predict.step_lnr <- function(step_lnr, testData){
  cols_removed = step_lnr$cols_removed
  predicted <- predict(step_lnr$m, testData)
}

stepwise_linear_model <- function(modelData){
  
  #modelData <- selectData("dsets/android_dataset_5_15.csv")
  #rownames(modelData) <- modelData$Project
  #c1<-c1[-c(5,9,18,19,20,21,25,33,36,38,50,51,52,53,54,55,56,60,61,70,75,79,80,81,83,84,85,89,90,91,92,102,103.106,107,112,114,120,124,125,128,129,130,131,134,135,136,137)]
  c_name <- list("Tran_Num","Activity_Num","Component_Num","Precedence_Num","Stimulus_Num","Response_Num")
  step_lnr <- list(formula = paste(c_name, collapse="+"))

  #str_frm <- gsub("[\r\n]", "", str_frm)
  #frm <- as.formula(str_frm)

}
