singleHypoTest <- function(x, y, method='boot'){
  #Args:
  #method: 'boot': bootstrap shift test (default); 
  #        't_test': T Test;
  #Return:
  #p: p value
  
  if (method == 't_test'){
    t_test <- t.test(x, y)
    p <- t_test$p.value
  }
  else if (method == 'double boot'){
    #sample from H0 with no distribution assumption
    #https://stats.stackexchange.com/questions/136661/using-bootstrap-under-h0-to-perform-a-test-for-the-difference-of-two-means-repl
    print("double bootstrap")
    nrounds <- 10000 #bootstrapping rounds
    
    z <- c(x,y)
    xt <- x - mean(x) + mean(z)
    yt <- y - mean(y) + mean(z)
    
    boot.t <- c(1:nrounds)
    for (i in 1:nrounds){
      sample.x <- sample(xt,size=50)
      sample.y <- sample(yt,size=50)
      boot.t[i] <- t.test(sample.x, sample.y)$statistic
    }
    p <- (1 + sum(abs(boot.t) > abs(t_test$statistic))) / (10000+1)
  }
  else if(method == "boot"){
    print("bootstrap hypothesis test")
    diff = x[1] - y[1]
    diffs = (x[-c(1)]-mean(x[-c(1)])) - (y[-c(1)]-mean(y[-c(1)]))
    #diffs = diffs - mean(diffs)
    p <- (1+sum(diff > diffs))/((length(diffs)+1)*2.3)
  }
  
  return(p)
}


familywiseHypoTest <- function(iterationResults, metric_names, model_names, method){

#Args:
#iterationResults: matrix of (nmoldes*nmetrics) columns, iteration results from CV or bootstrapping
#model_names: vecotr of model names, e.g., c('ducp','ucp','cocomo','cocomo_apriori','IFPUG','MKII','COSMIC','SLOC','SLOC_LN')
#metric_names: vector of metric names, e.g., c('mmre','pred15','pred25','pred50', "mdmre", "mae")
#Return:
#sig_df: dataframe of 9 columns: model1, model2, metric, direction, model1_mean, model2_mean, p_value, BH_p_value, bonferroni_p_value
#        metric: mmre, pred15, pred25, pred50, mdmre, mae
#        direction: +/-/=: model1_mean is greater than/less than/equal to model2_mean on accuracy value measured by metric
#        p_value: p value of null hypothesis
#        BH_p_value: adjusted p value using BH method
#        bonferroni_p_value: adjusted p value using Bonferroni method

#model_names <- c('ducp','ucp','cocomo','cocomo_apriori','IFPUG','MKII','COSMIC','SLOC','SLOC_LN')
#metric_names <- c('mmre','pred15','pred25','pred50', "mdmre", "mae")
#metric_names <- accuracy_metrics
#iterationResults <- iterResults
#method <- 'boot'

nmodels <- length(model_names)

if(nmodels < 2){
    print("At least two models should be provided for hypothesis test.")
    return
}


nmetrics <- length(metric_names)

nhypo <- choose(nmodels,2) * nmetrics
print("number of hypothesis:")
print(nhypo)

model_labels <- c()
for(i in 1:nmodels){
  for(j in 1:nmetrics){
    model_labels = c(model_labels, model_names[i])
  }
}

metric_labels <- c()
for(i in 1:nmodels){
  for(j in 1:nmetrics){
    metric_labels = c(metric_labels, metric_names[j])
  }
}


measurement_labels <- paste(model_labels, metric_labels, sep="_")
iterationResults <- iterationResults[, measurement_labels]

dfHypothesis <- matrix(nrow=nhypo,ncol=4)
colnames(dfHypothesis) <- c('model1','model2','metric','direction')
dfPValue <- matrix(nrow=nhypo,ncol=5)
colnames(dfPValue) <- c('model1_mean','model2_mean', 'p_value','BH_p_value','bonferroni_p_value')

dfeffectS <- matrix(nrow=nhypo, ncol=1)
colnames(dfeffectS) <- c('cohen_d')

# for each accuracy metric, pair two models to construct hypothesis and run significance test
# total number of hypothesis = C(nmodels, 2) * nmetrics
i <- 1
while (i<=nhypo){
for (j in 1:nmetrics){
print(metric_names[j])
to_pair <- seq(from = j , to = j+(nmodels-1)*nmetrics ,by = nmetrics)
print(to_pair)
for (k in 1:(nmodels-1)){
    for (l in (k+1):nmodels){
      print(paste(model_names[k], model_names[l], sep=" vs "))
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

            if(method == 'cv'){
              p <- singleHypoTest(x,y,'t_test')
            }
            else {
              p <- singleHypoTest(x,y,'boot')
            }
            
            #calculating cohen's d to report the effect size.
            mu_1 <- mean(x)
            mu_2 <- mean(y)
            
            n1 = length(x)
            n2 = length(y)
            s1_squared = sum((x-mu_1)^2)/(n1-1)
            s2_squared = sum((y-mu_2)^2)/(n2-1)
            s = sqrt(((n1-1)*s1_squared+(n2-1)*s2_squared)/(n1+n2-2))
            cohen_d <- (mu_1-mu_2)/s
            print(mu_1)
            print(mu_2)
            d <- mu_1 - mu_2
            direction = "="
            
            if (d>0){
                direction <- '+'
            }
            else if (d<0){
                direction <- '-'
            }
            
            if(metric_names[j] %in% c("mae", "mdmre", "mmre")){
              if(direction == "+"){
                direction = "-"
              }
              else if(direction == "-"){
                direction = "+"
              }
            }

            dfHypothesis[i,] <- c(model_labels[id1], model_labels[id2], metric_labels[id1], direction)
            dfPValue[i,1:3] <- c(mu_1, mu_2, p)
            dfeffectS[i, 1] <- cohen_d
            
            i <- i+1
        }        
    }
}
}
}

#run Benjamini Hochberg correction procedure.
dfPValue[,4] <- p.adjust(dfPValue[,'p_value'], method='BH')
#run Bonferroni correction procedure.
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
                  bonferroni_p_value=dfPValue[,'bonferroni_p_value'],
                  cohen_d=dfeffectS[,'cohen_d'])
return(sig_df)
}