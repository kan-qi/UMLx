---
title: "Report"
author: "Kan Qi"
output:
  html_document:
    df_print: paged
  pdf_document: default
---

feature_select_by_corr <- function(modelEvalFile)
      
data <- read.csv(modelEvalFile, stringsAsFactors= T)
#summary(data)

#The columns to search for the influential factors
cols <- c(
    "Tran_Num"  
  , "UseCase_Num"                              
  , "KSLOC"     
  , "Personnel"   
  , "Priori_COCOMO_Estimate"                   
  , "COCOMO_Estimate"                          
 , "Activity_Num"                             
 , "Actor_Num" 
 , "Avg_Actor" 
 , "Boundary_Num"                             
 , "ControlNum"
 , "Entity_Num"
 , "Component_num"                            
 , "Attribute_num"                            
 , "Operation_num"                            
 , "class_num" 
 , "Top_Level_Classes"                        
 , "Average_Depth_Inheritance_Tree"           
 , "Average_Number_Of_Children_Per_Base_Class"
 , "Number_Of_Inheritance_Relationships"      
 , "Depth_Inheritance_Tree"                   
 , "para_num"  
 , "usage_num" 
 , "real_num"  
 , "assoc_num" 
 , "externaloper_num"                         
 , "objectdata_num"                           
 , "avg_operation"                            
 , "avg_attribute"                            
 , "avg_parameter"                            
 , "avg_usage" 
 , "avg_real"  
 , "avg_assoc" 
 , "avg_instVar"                              
 , "weightedoper_num"                         
 , "method_size"                              
 , "EI"        
 , "EQ"        
 , "INT"       
 , "DM"        
 , "CTRL"      
 , "EXTIVK"    
 , "EXTCLL"    
 , "TRAN_NA"   
 , "NT"        
 , "Avg_TL"    
 , "Avg_TD"    
 , "Arch_Diff" 
 , "Type.1"    
 , "Effort_Norm"                              
 , "Norm_Factor"                              
 , "Effort"    
 , "UAW"       
 , "TCF"       
 , "EF"        
 , "Simple_UC" 
 , "Average_UC"
 , "Complex_UC"
 , "Effort_Norm_UCP"                          
 , "Effort_Norm_COCOMO"                       
 , "UUCP"      
 , "UCP"       
 , "EUCP"      
 , "EXUCP"     
 , "DUCP"      
 , "SWTI"      
 , "SWTII"     
 , "SWTIII"    
 , "NOET"      
 , "NOAAE"     
 , "NORT"      
 , "NEM"       
 , "NSR"       
 , "NOA"       
 , "NOS"       
 , "WMC"       
 , "MPC"       
 , "NOCH"      
 , "DIT"       
 , "CBO"       
 , "NIVPC"     
 , "NUMS"      
 , "NCI"       
 , "NCIF"      
 , "RR"        
 , "NTLC"      
 , "ANWMC"     
 , "ADIT"      
 , "NOCPBC"    
 , "EIF"       
 , "ILF"       
 , "IFPUG"     
 , "NI"        
 , "NE"        
 , "MKII"      
 , "EXT"       
, "ERY"       
, "RED"       
, "WRT"       
, "COSMIC"    
, "DET"       
, "FTR"       
, "NT.1"      
, "NOC"       
, "NOA.1"     
, "NOA.2"     
, "NOUC"      
, "NOR"       
, "ANAPUC"    
, "ANRPUC"    
, "UCP.1"     
, "NOC.1"     
, "NOIR"      
, "NOUR"      
, "NORR"      
, "NOM"       
, "NOP"       
, "NOCAL"     
, "NOASSOC"   
, "ANMC"      
, "ANPC"      
, "ANCAC"     
, "ANASSOCC"  
, "ANRELC"    
, "NOC.2"     
, "NOAPC"     
, "NODET"     
, "NORET"     
, "NOA.3"     
, "NOMPC"     
, "NPPM"      
, "NMT"       
, "Num_User_Story"                           
, "Num_Tasks" 
, "project_manager_estimate"                 
, "developer_estimate"
          )
ncol <- length(cols)

#intropolate the NA values
data[cols] <- lapply(data[cols], function(x) ifelse(is.na(x), ave(x, FUN = function(y) mean(y, na.rm = TRUE)), x))


## Preparing the independent variables
#1. Removing all the variables with zero value for all the observations. 
#2. Facoterizing the type variable
#3. Calculating the corelation between all the independent and dependent variables.
#4. Choosing all the variables with highest corelation values. 

#Calculating the correlation and choosing the independent variables with correlation higher than 0.6 with the dependent variable (Effort).

# rank the variables by the correlation.
r_limit <- 0.6
x <- data[cols]
x <- subset(x, select = colnames(x) != "Effort")
y <- data[c("Effort")]
corr <- cor(x, y)
corr <- na.omit(corr)

corr <- as.data.frame(corr)
corr <- subset(corr, corr["Effort"] >= r_limit)
ind_variables <- row.names(corr)

#Looking at the graph, following are the most correlated independent variables:  
#1. Effort_Norm_UCP
#2. UseCase_Num
#3. CTRL
#4. NT
#5. Complex_UC
#6. UEUCW
#7. TCF
#8. EUCP
#9. EXUCP
#10. DUCP
#11. Top_Level_Classes
#12. Number_Of_Inheritance_Relationships
#13. Number_Of_Derived_Classes
#14. Number_Of_Classes_Inherited
#15. Number_Of_Classes_Inherited_From
#16. Number_Of_Children
#17. Depth_Inheritance_Tree
#18. Coupling_Between_Objects
#19. FUNC_NA
#20. UAW

vars <- data[ind_variables]
vars <- cbind(vars, data[c("Effort")])

}