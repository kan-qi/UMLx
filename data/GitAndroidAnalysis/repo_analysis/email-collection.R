# import libraries
library(xlsx)
library(jsonlite)
library(httr)
library(stringr)

# local functions
getTotalPages <- function(linkHeaderStr){
  matched <- 
    stringr::str_match(linkHeaderStr, "page=(\\d+)>; rel=\\\"last\\\"")
  as.integer((matched[ ,2]))
}


rbind.match.columns <- function(input1, input2) {
  n.input1 <- ncol(input1)
  n.input2 <- ncol(input2)
  
  if (n.input2 < n.input1) {
    TF.names <- which(names(input2) %in% names(input1))
    column.names <- names(input2[, TF.names])
  } else {
    TF.names <- which(names(input1) %in% names(input2))
    column.names <- names(input1[, TF.names])
  }
  
  return(rbind(input1[, column.names], input2[, column.names]))
}

# set user-agent
user = "flyqk"
pw = "qk@github/910304"

# import urls
data = read.xlsx("repos.xlsx",sheetName="data",header=T)
data[i,1] = as.character(data[i,1])
data[i,2] = as.character(data[i,2])

# read email segment and return data
out <- data.frame()
for(i in 63:nrow(data)){
  
  repo_name = as.character(data[i,1])
  repo_url = data[i,2]
  
  print(paste("## ",repo_name, " ##"))
  
  # find contriutor list
  contributors <- list()
  url = paste("https://api.github.com/repos", unlist(strsplit(as.character(repo_url), "https://github.com/"))[2], sep="/", collapse=NULL)
  info <- GET(paste(url, "/contributors?page=1", sep=''), authenticate(user, pw))
  pages <- getTotalPages(info$headers$link)
  
  if(length(pages)>0){
    print(paste(i, "if"))
    for(k in seq(1:pages)){
      resp <- GET(paste(url, "/contributors?page=", k, sep=''), authenticate(user, pw))
      currentPage <- fromJSON(content(resp, "text"), flatten = TRUE)
      currentPage$repo_name <- repo_name
      contributors[[k]] <- currentPage
    }
  }else{
    print(paste(i, "else"))
    resp <- GET(paste(url, "/contributors", sep=''), authenticate(user, pw))
    currentPage <- fromJSON(content(resp, "text"), flatten = TRUE)
    currentPage$repo_name <- repo_name
    contributors[[i]] <- currentPage
  }
  contributors <- rbind_pages(contributors)
  contributors_info = contributors[ , 1]
  
  # find user info
  
  max = 200
  line <- data.frame(name=c(), email=c(), contributions = c(), repo_name=c())
  for(k in 1:nrow(contributors[1])){
    user_url = paste("https://api.github.com/users", contributors[k, 1], "events/public", sep="/")
    print(user_url)
    user_info <- GET(user_url, authenticate(user, pw))
    user_info = as.character(user_info)
    
    email = stringr::str_split(user_info, "email", 2)[[1]][2]
    email = stringr::str_split(email, "name", 2)[[1]][1]
    email = stringr::str_split(email, "\": \"", 2)[[1]][2]
    email = stringr::str_split(email, "\",\n", 2)[[1]][1]
    
    name = as.character(contributors[[1]][k])
    
    if(is.na(email)==FALSE){
      sub_line <- data.frame(name = name, email = email, contributions = contributors[["contributions"]][k], repo_name = contributors[["repo_name"]][k])
      line <- rbind(line,sub_line)
      email = NA
      print(sub_line)
    }
  }
  out <- rbind(out, line)
}

write.xlsx(out, "email.xlsx")
