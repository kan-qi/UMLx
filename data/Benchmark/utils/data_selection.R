selectData <- function(dataset, selector="Default"){
  
  #dataPath <- "modelEvaluations-1-3.csv"
  #selector <- "SLOC2ndQ25"
  #dataPath = "../android_analysis_datasets/android_dataset_6_20_1.csv"
  
  # dataset$Project = as.character(dataset$Project)
  # rownames(dataset) <- dataset$Project
  
  # dataset$ID = as.character(dataset$ID)
  # rownames(dataset) <- dataset$ID
  
  # dataset$NUM = as.character(dataset$NUM)
  # if(!is.na(row.names)){
  #   rownames(dataset) <- dataset$NUM
  # }else{
  #   rownames(dataset) <- dataset$NUM
  # }
  # 
  #dataset$Project <- NULL
  
  #if(selector == "SLOC2ndQ25"){
  #dataset <- selectBySLOC2ndQ25(dataset)
  #}
  
  modelData = subset(dataset, Effort != 0)
  
  if(selector == "Default"){
    
  }
  else if(selector[1] == "Size"){
    modelData = selectProjectsBySize(modelData, selector[2])
  }
  else if(selector[1] == "InitialDate"){
    modelData = selectProjectsByInitialDate(modelData, selector[2])
  }
  else if(selector[1] == "Type"){
    modelData = selectProjectsByType(modelData, selector[2])
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

selectProjectsByInitialDate <- function(modelData, initDate){
  #initDate = "early"
  modelData$StartTimeNumeric = as.numeric(as.POSIXct(strptime(modelData$StartTime, "%m/%d/%Y")))
  start_time_points <- getCutPoints(modelData$StartTimeNumeric)
  start_time_points <- t(as.matrix(start_time_points))
  rownames(start_time_points) <- c("StartTimeNumeric")
  #matrix(StartTime = start_time_points)
  classifiedProjects = classifyProjectsbyCutPoints(modelData, start_time_points)
  
  
  projectIndices = c()
  
  if(initDate == "Early"){
    
    projectIndices = c(projectIndices, classifiedProjects$l1)
    
  }
  else if(initDate == "Normal"){
    
    projectIndices = c(projectIndices, classifiedProjects$l2)
    
  }
  else if(initDate == "Late"){
    
    projectIndices = c(projectIndices, classifiedProjects$l3)
    
  }
  
  datapoints <- modelData[projectIndices,]
  
}

selectProjectsBySize <- function(modelData, size){
  #size = "small"
  
  sloc_cut_points <- getCutPoints(modelData$SLOC)
  duration_cut_points <- getCutPoints(modelData$Duration)
  personnel_cut_points <- getCutPoints(modelData$Personnel)
  
  cutpoints = matrix(nrow = 3, ncol = length(sloc_cut_points))
  rownames(cutpoints) = c("SLOC", "Duration", "Personnel")
  cutpoints["SLOC",] = sloc_cut_points
  cutpoints["Duration",] = duration_cut_points
  cutpoints["Personnel",] = personnel_cut_points
  print(cutpoints)
  
  classifiedDataPoints <- classifyProjectsbyCutPoints(modelData, cutpoints)
  print(classifiedDataPoints)
  
  projectIndices = c()
  if(size == "Small"){
    projectIndices = c(projectIndices, classifiedDataPoints$l1)
    projectIndices = c(projectIndices, classifiedDataPoints$l2)
  }
  else if(size == "Medium"){
    projectIndices = c(projectIndices, classifiedDataPoints$l3)
    projectIndices = c(projectIndices, classifiedDataPoints$l4)
  }
  else{
    projectIndices = c(projectIndices, classifiedDataPoints$l5)
    projectIndices = c(projectIndices, classifiedDataPoints$l6)
    projectIndices = c(projectIndices, classifiedDataPoints$l7)
  }
  
  print(projectIndices)
  datapoints <- modelData[projectIndices,]
  print(datapoints)
  
}


classifyProjectsbyCutPoints <- function(data, cutPoints) {
  #cutPoints = cutpoints
  #cutPoints = start_time_points
  #print(cutPoints)
  #data <- modelData
  
  numVariables <- nrow(cutPoints)
  numBins <- ncol(cutPoints) - 1
  
  totalClassifications <- numVariables*numBins - numVariables + 1
  
  levels <- paste("l", 1:totalClassifications, sep = "")
  
  result <- list()
  
  if(nrow(data) > 0){
    for (i in 1:nrow(data)) {
      sumCoord <- 0
      #classifications <- c()
      for (p in rownames(cutPoints)) {
        #print(p)
        #print(i)
        #print(data$Personnel)
        #i = 3
        #p = "SLOC"
        #print(p)
        #print(data[i, p])
        coord <- cut(data[i, p], breaks = cutPoints[p, ], labels = FALSE)
        #classifications <- c(classifications, parameterResult)
        #print(data[i, p])
        #print(coord)
        if(is.na(coord)){
          coord = 3
        }
        sumCoord <- sumCoord + coord
      }
      print(sumCoord)
      combinedClass <- paste("l", sumCoord-nrow(cutPoints)+1, sep = "")
      print(combinedClass)
      if(is.null(result[[combinedClass]])){
        result[[combinedClass]] = c()
      }
      result[[combinedClass]] <- c(result[[combinedClass]], data[i, "Project"])
      print( result[[combinedClass]])
    }
  }
  print(result)
  return(result)
}


getCutPoints <- function(dataset){
  #dataset <- na.omit(modelData$SLOC)
  
  cutPoints <- as.vector(classIntervals(na.omit(dataset), 3)$brks)
  cutPoints[1] <- -Inf
  cutPoints[length(cutPoints)] <- Inf
  lastPoint <- -1;
  for(i in 1:length(cutPoints)){
    if(cutPoints[i] <= lastPoint){
      cutPoints[i] = lastPoint+0.1;
    }
    lastPoint = cutPoints[i]
  }
  cutPoints
}

selectProjectsByType <- function(modelData, type){
  #type = "tools/system info"
  modelData$Category <- as.character(modelData$Category)
  modelData <- modelData[which(modelData$Category == type),]
}

