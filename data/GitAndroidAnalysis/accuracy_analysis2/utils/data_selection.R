selectData <- function(dataPath, selector="default"){
  
#dataPath <- "modelEvaluations-1-3.csv"
#selector <- "SLOC2ndQ25"

modelData <- read.csv(dataPath)

if(selector == "SLOC2ndQ25"){
modelData <- selectBySLOC2ndQ25(modelData)
}

#dataSet <- list()
#dataSet[["modelData"]] <- modelData
#dataSet

modelData
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
