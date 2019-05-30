# This script takes in a .xlsx file with a specific format (see repos.xlsx for reference),
# and finds a list of emails of contributors for each project in the input.
# 
# To run this script, make sure to have the following libraries installed, and have the
# input file "repos.xlsx" in your work directory (you can also change the filename below).
# Simply highlight all lines and click run.


# import libraries
library(httr)
library(jsonlite)
library(openxlsx)
library(stringr)


# Variables
# set user-agent
user = "flyqk"
password = "qk@github/910304"
input_filename = "repos.xlsx"
output_filename = "emails.xlsx"

# import datasheet as DataFrame
data = read.xlsx(input_filename, colNames=TRUE)
output <- data.frame()


# local functions
getTotalPages <- function(linkHeaderStr) {
  matched <- stringr::str_match(linkHeaderStr, "page=(\\d+)>; rel=\\\"last\\\"")
   return(as.integer((matched[, 2])))
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

# Convert repo URL to API URL
convertToAPI <- function(repo_url) {
  API_path = "https://api.github.com/repos"
  extracted_repo_name = unlist(strsplit(as.character(repo_url), "https://github.com/"))[2]
  return(paste(API_path, extracted_repo_name, sep="/", collapse=NULL))
}

# Get user e-mail
getEmail <- function(user_info) {
  email = stringr::str_split(user_info, "email", 2)[[1]][2]
  email = stringr::str_split(email, "name", 2)[[1]][1]
  email = stringr::str_split(email, "\": \"", 2)[[1]][2]
  return(stringr::str_split(email, "\",\n", 2)[[1]][1])
}


# read email segment and return data
for(i in 1:nrow(data)) {
  repo_name = data[i, 1]
  repo_url = data[i, 2]
  contributors <- list()    # list of contributors
  
  print(paste("## ", repo_name, " ##"))
  
  # find contriutor list by retrieving info from the contributor page
  url = convertToAPI(repo_url)
  contrib_page = paste(url, "/contributors?page=1", sep='')
  info <- GET(contrib_page, authenticate(user, password))
  pages <- getTotalPages(info$headers$link)
  
  if (length(pages) > 0) {
    print(paste(i, ": if"))
    
    for (k in seq(1:pages)) {
      contrib_page = paste(url, "/contributors?page=", k, sep='')
      info <- GET(contrib_page, authenticate(user, password))
      currentPage <- fromJSON(content(info, "text"), flatten = TRUE)
      currentPage$repo_name <- repo_name
      contributors[[k]] <- currentPage
    }
  } else {
    print(paste(i, ": else"))
    
    contrib_page = paste(url, "/contributors", sep='')
    info <- GET(contrib_page, authenticate(user, password))
    currentPage <- fromJSON(content(info, "text"), flatten = TRUE)
    currentPage$repo_name <- repo_name
    contributors[[i]] <- currentPage
  }
  
  contributors <- rbind_pages(contributors)
  contributors_info = contributors[, 1]
  
  # find user info
  max = 200
  line <- data.frame(name=c(), email=c(), contributions = c(), repo_name=c())
  for (k in 1:nrow(contributors[1])) {
    user_url = paste("https://api.github.com/users", contributors[k, 1], "events/public", sep="/")
    print(paste("User URL:", user_url))
    
    user_info <- GET(user_url, authenticate(user, password))
    user_info = as.character(user_info)
    email = getEmail(user_info)
    name = as.character(contributors[[1]][k])
    
    if (is.na(email) == FALSE) {
      sub_line <- data.frame(name = name, email = email,
                             contributions = contributors[["contributions"]][k],
                             repo_name = contributors[["repo_name"]][k])
      line <- rbind(line, sub_line)
      email = NA
      print(sub_line)
    }
  }
  
  # append our result to the output
  output <- rbind(output, line)
}

write.xlsx(output, output_filename)
