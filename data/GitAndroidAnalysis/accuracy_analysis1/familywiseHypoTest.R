familywiseHypoTest <- function(iterationResults, metric_names, model_names){

#Args:
#iterationResults: iteration results from CV or bootstrapping, a matrix of 54 columns (9 models * 6 metrics)
#        if more models or metrics added, update: model_metric_name, model_name, metric_name
#Returns:
#sig_df: dataframe of 9 columns: model1, model2, metric, direction, model1_mean, model2_mean, p_value, BH_p_value, bonferroni_p_value
#        metric: mmre, pred15, pred25, pred50, mdmre, mae
#        direction: +/-/=: model1_mean is greater than/less than/equal to model2_mean on accuracy value measured by metric
#        p_value: p value from t t_test
#        BH_p_value: adjusted p value using BH method
#        bonferroni_p_value: adjusted p value using Bonferroni method
  
#iterationResults = iterResults

nmodels <- length(model_names)

if(nmodels < 2){
  print("At least two models should be provided for hypothesis test.")
  return
}

nmetrics <- length(metric_names)

nhypo <- choose(nmodels,2) * nmetrics
dfHypothesis <- matrix(nrow=nhypo,ncol=4)
colnames(dfHypothesis) <- c('model1','model2','metric','direction')
dfPValue <- matrix(nrow=nhypo,ncol=5)
colnames(dfPValue) <- c('model1_mean','model2_mean','p_value','BH_p_value','bonferroni_p_value')

model_metric_name <- names(iterationResults)

model_labels <- c()
for(i in 1:length(models)){
  for(j in 1:length(accuracy_metrics)){
    model_labels = c(model_labels, names(models)[i])
  }
}

metric_labels <- c()
for(i in 1:length(models)){
  for(j in 1:length(accuracy_metrics)){
    metric_labels = c(metric_labels, accuracy_metrics[j])
  }
}

singleHypoTest <- function(x,y){
is_var_equal <- function(x,y){
    var_test = var.test(x,y)
    if (var_test$p.value > 0.05){
        return(TRUE)
    }
    else {
        return(FALSE)
    }
}
var_euqal <- is_var_equal(x,y)

t_test <- t.test(x,y,var.equal = var_euqal)
p <- t_test$p.value

return(p)
}

# for each accuracy metric, pair two models to construct hypothesis and run t test
# total number of hypothesis = C(nmodels, 2) * nmetrics
i <- 1
while (i<=nhypo){
for (j in 1:nmetrics){
to_pair <- seq(from = j , to = j+nmodels*nmetrics ,by = nmetrics)
#print(to_pair)
for (k in 1:(nmodels-1)){
    for (l in (k+1):nmodels){
        id1 <- to_pair[k]
        id2 <- to_pair[l]
        #print(id1)
        #print(id2)
        if (is.na(id2)){
            break
        }
        else {
            x <- iterationResults[,id1]
            y <- iterationResults[,id2]

            p <- singleHypoTest(x,y)
            
            mu_1 <- mean(x)
            mu_2 <- mean(y)
            
            d <- mu_1 - mu_2
            if (d>0){
                direction <- '+'
            }
            if (d<0){
                direction <- '-'
            }
            if (d==0){
                direction <- '='
            }

            dfHypothesis[i,] <- c(model_labels[id1], model_labels[id2], metric_labels[id1], direction)
            dfPValue[i,1:3] <- c(mu_1, mu_2, p)
            
            i <- i+1
        }        
    }
}
}
}

dfPValue[,4] <- p.adjust(dfPValue[,'p_value'], method='BH')
dfPValue[,5] <- p.adjust(dfPValue[,'p_value'], method='bonferroni')

#ret <- list(dfHypothesis=dfHypothesis, dfPValue=dfPValue)
sig_df <- data.frame(model1=dfHypothesis[,'model1'],
                  model2=dfHypothesis[,'model2'],
                  metric=dfHypothesis[,'metric'],
                  direction=dfHypothesis[,'direction'],
                  model1_mean=dfPValue[,'model1_mean'],
                  model2_mean=dfPValue[,'model2_mean'],
                  p_value=dfPValue[,'p_value'],
                  BH_p_value=dfPValue[,'BH_p_value'],
                  bonferroni_p_value=dfPValue[,'bonferroni_p_value'])
return(sig_df)
}