#define the regression tree model
library(rpart)

m_fit.reg_tree <- function(reg_tree, dataset, features = 'default', prune = FALSE, plot_tree = FALSE){
#Args:
#features: vector of predict and target variable names. 
#prune: bool, if pruning is needed to avoid overfitting. Current tree too simple to be pruned, will result in 1 split only.
#plot_tree: bool, plot the regression tree
    if (features == 'default') {
        # 51 features left after dropping: 1. cols containing all missing values (all zeros); 2. duplucated cols 
        features <- c('Effort', 'NT', 'NORT', 'EUCP', 'DM', 'Tran_Num', 'EXUCP', 'EXT', 'ANPC', 'class_num', 'Attribute_num', 'real_num', 'MPC', 'COSMIC', 'Complex_UC', 'ANAPUC', 'EF', 'NEM', 'Personnel', 'TRAN_NA', 'EXTIVK', 'Avg_TD', 'avg_attribute', 'objectdata_num', 'NOP', 'SWTIII', 'NOR', 'NOUC', 'ControlNum', 'IFPUG', 'Average_UC', 'Component_num', 'WMC', 'RR', 'Arch_Diff', 'UCP', 'Type', 'Activity_Num', 'ANWMC', 'Actor_Num', 'MKII', 'Priori_COCOMO_Estimate', 'Avg_TL', 'INT', 'UseCase_Num', 'avg_real', 'NT.1', 'EXTCLL', 'avg_usage', 'Boundary_Num', 'Simple_UC', 'COCOMO_Estimate')
    }
    train_df <- dataset[,names(dataset)%in%features]
    train_df['Type'] <- apply(train_df['Type'], 1, function(x) if(x == 'Website') 1 else if (x =='Mobile App') 2 else if (x=='Information System') 3 else 4)

    rt = rpart(Effort~., data=train_df)
    reg_tree$m <- rt
    
    #pruning
    if (prune == TRUE) {
        cp_id <- which.min(rt$cptable[,"xerror"]) #id of min xerror
        cp <- rt$cptable[cp_id,"CP"] #cp threshold
        rt_pruned <- prune(rt,cp=cp)
        reg_tree$m <- rt_pruned
    }
        
    if (plot_tree == TRUE) {
        print(reg_tree$m)
        plot(reg_tree$m)
        text(reg_tree$m)
    }
                    
    reg_tree
}

m_predict.reg_tree <- function(reg_tree, testData, predictors = 'default'){
#Args:
#predictors: vector of predict variable names. Same as features except removing the target variable.

    if (predictors == 'default') {
        # predict variable names (no target variable)
        predictors <- c('NT', 'NORT', 'EUCP', 'DM', 'Tran_Num', 'EXUCP', 'EXT', 'ANPC', 'class_num', 'Attribute_num', 'real_num', 'MPC', 'COSMIC', 'Complex_UC', 'ANAPUC', 'EF', 'NEM', 'Personnel', 'TRAN_NA', 'EXTIVK', 'Avg_TD', 'avg_attribute', 'objectdata_num', 'NOP', 'SWTIII', 'NOR', 'NOUC', 'ControlNum', 'IFPUG', 'Average_UC', 'Component_num', 'WMC', 'RR', 'Arch_Diff', 'UCP', 'Type', 'Activity_Num', 'ANWMC', 'Actor_Num', 'MKII', 'Priori_COCOMO_Estimate', 'Avg_TL', 'INT', 'UseCase_Num', 'avg_real', 'NT.1', 'EXTCLL', 'avg_usage', 'Boundary_Num', 'Simple_UC', 'COCOMO_Estimate')
    }
    test_df <- testData[,names(testData)%in%predictors]
    test_df['Type'] <- apply(test_df['Type'], 1, function(x) if(x == 'Website') 1 else if (x =='Mobile App') 2 else if (x=='Information System') 3 else 4)

    predict(reg_tree$m, test_df)
}

regression_tree_model <- function(dataset){
  
  parameters = list()
  
  parameters
  
}
