familywiseHypoTest <- function(iterationResults){

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

nmodels <- 9
nmetrics <- 6

nhypo <- choose(nmodels,2) * nmetrics
dfHypothesis <- matrix(nrow=nhypo,ncol=4)
colnames(dfHypothesis) <- c('model1','model2','metric','direction')
dfPValue <- matrix(nrow=nhypo,ncol=5)
colnames(dfPValue) <- c('model1_mean','model2_mean','p_value','BH_p_value','bonferroni_p_value')

model_metric_name <- c(
        'ducp_mmre','ducp_pred15','ducp_pred25','ducp_pred50', "ducp_mdmre", "ducp_mae",
        'ucp_mmre','ucp_pred15','ucp_pred25','ucp_pred50', "ucp_mdmre", "ucp_mae",
        'cocomo_mmre','cocomo_pred15','cocomo_pred25','cocomo_pred50', "cocomo_mdmre", "cocomo_mae",
        'cocomo_apriori_mmre','cocomo_apriori_pred15','cocomo_apriori_pred25','cocomo_apriori_pred50', "cocomo_apriori_mdmre", "cocomo_apriori_mae",
        'IFPUG_mmre','IFPUG_pred15','IFPUG_pred25','IFPUG_pred50', "IFPUG_mdmre", "IFPUG_mae",
        'MKII_mmre','MKII_pred15','MKII_pred25','MKII_pred50', "MKII_mdmre", "MKII_mae",
        'COSMIC_mmre','COSMIC_pred15','COSMIC_pred25','COSMIC_pred50', "COSMIC_mdmre", "COSMIC_mae",
        'SLOC_mmre','SLOC_pred15','SLOC_pred25','SLOC_pred50', "SLOC_mdmre", "SLOC_mae",
        'SLOC_LN_mmre','SLOC_LN_pred15','SLOC_LN_pred25','SLOC_LN_pred50', "SLOC_LN_mdmre", "SLOC_LN_mae")

model_name <- c(
        'ducp','ducp','ducp','ducp','ducp','ducp',
        'ucp','ucp','ucp','ucp','ucp','ucp',
        'cocomo','cocomo','cocomo','cocomo','cocomo','cocomo',
        'cocomo_apriori','cocomo_apriori','cocomo_apriori','cocomo_apriori','cocomo_apriori','cocomo_apriori',
        'IFPUG','IFPUG','IFPUG','IFPUG','IFPUG','IFPUG',
        'MKII','MKII','MKII','MKII','MKII','MKII',
        'COSMIC','COSMIC','COSMIC','COSMIC','COSMIC','COSMIC',
        'SLOC','SLOC','SLOC','SLOC','SLOC','SLOC',
        'SLOC_LN','SLOC_LN','SLOC_LN','SLOC_LN','SLOC_LN','SLOC_LN')

metric_name <- c('mmre','pred15','pred25','pred50', "mdmre", "mae",
                 'mmre','pred15','pred25','pred50', "mdmre", "mae",
                 'mmre','pred15','pred25','pred50', "mdmre", "mae",
                 'mmre','pred15','pred25','pred50', "mdmre", "mae",
                 'mmre','pred15','pred25','pred50', "mdmre", "mae",
                 'mmre','pred15','pred25','pred50', "mdmre", "mae",
                 'mmre','pred15','pred25','pred50', "mdmre", "mae",
                 'mmre','pred15','pred25','pred50', "mdmre", "mae",
                 'mmre','pred15','pred25','pred50', "mdmre", "mae")


singleHypoTest <- function(x,y){
is_var_equal <- function(x,y){
    var_test = var.test(x,y)
    if (z$p.value > 0.05){
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
to_pair <- seq(from = j , to = j+48 ,by = 6)
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

            dfHypothesis[i,] <- c(model_name[id1], model_name[id2], metric_name[id1], direction)
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