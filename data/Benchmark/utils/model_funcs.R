#Define the generic functions and classes for model calibration and evaluation
#S3 and generic function...

m_fit <- function(x,...) UseMethod('m_fit', x)
  

fit <- function(dataset, label, params = list()){
    model <- structure(params, class = label)
    model <- m_fit(model, dataset)
}
	
m_predict <- function(x,...) UseMethod('m_predict', x)
	
m_profile <- function(x,...) UseMethod('m_profile', x)

m_save <- function(x,...) UseMethod('m_save', x)

m_load <- function(x,...) UseMethod('m_load', x)

model_load <- function(model_names){
  #return a list of saved trained models from the files.
  models <- list()
  for(i in 1:length(model_names)){
    model_name = model_names[i]
    model <- structure(list(), class = model_name)
    model <- m_load(model)
    models[[model_name]] = model
  }
  models
}


m_profile.default <- function(model, dataset){
  data.frame(matrix(nrow=0, ncol=0))
}
