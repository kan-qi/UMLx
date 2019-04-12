selectData <- function(dataPath, selector="default"){
  
#dataPath <- "modelEvaluations-1-3.csv"
#selector <- "SLOC2ndQ25"

modelData <- read.csv(dataPath)
modelData$Project <- as.character(modelData$Project)
modelData$transaction_file <- as.character(modelData$transaction_file)
effort <- subset(modelData, select=c("Effort"))
transactionFileList <- subset(modelData, select=c("transaction_file"))
rownames(effort) <- modelData$Project
rownames(transactionFileList) <- modelData$Project

if(selector == "SLOC2ndQ25"){
modelData <- selectBySLOC2ndQ25(modelData)
}

projects <- rownames(effort)
numOfTrans <- 0
transactionFiles <- list()
    for (project in projects) {
        filePath <- transactionFileList[project, "transaction_file"]
        print(filePath)
        if (!file.exists(filePath)) {
          print("file doesn't exist")
          next
        }
        fileData <- read.csv(filePath)
        fileData <- data.frame(apply(subset(fileData, select = c("TL", "TD", "DETs")), 2, function(x) as.numeric(x)))
        fileData <- na.omit(fileData)
        
        if(nrow(fileData) < 1){
          transactionFiles[[project]] <-list()
          next
        }
        
        transactionFiles[[project]] <- fileData
        numOfTrans = numOfTrans + nrow(fileData)
    }


print(numOfTrans)
    
combined <- combineData(transactionFiles)

dataSet <- list()
dataSet[["modelData"]] <- modelData
dataSet[["combined"]] <- combined
dataSet[["effort"]] <- effort
dataSet
}

selectBySLOC2ndQ25 <- function(modelData){

    range <- c(l = quantile(modelData$KSLOC, 0.25), u = quantile(modelData$KSLOC, 0.5));

    selectedRows <- c();

    #print(range[1])
    for (i in 1:nrow(modelData)) {
      modelDataItem <- modelData[i, ]
      if(modelDataItem$KSLOC > range[1] && modelDataItem$KSLOC <= range[2]){
        selectedRows <- c(selectedRows, i)
      }
    }

    print(selectedRows)

    modelData <- modelData[selectedRows,]
}
