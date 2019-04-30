#Define the generic functions and classes for model calibration and evaluation

m_fit <- function(x,...) UseMethod('m_fit', x)
  

fit <- function(dataset, label, params = list()){
    model <- structure(params, class = label)
    model <- m_fit(model, dataset)
}
	
m_predict <- function(x,...) UseMethod('m_predict', x)
	