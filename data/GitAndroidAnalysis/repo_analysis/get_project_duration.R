# This script takes in a .xlsx file with a specific format (see repos.xlsx for reference),
# calculates project duration, and stores the output in a text file.
# 
# To run this script, make sure to have the following libraries installed, and have the
# input file "repos.xlsx" in your work directory (you can also change the filename below).
# Simply highlight all lines and click run.

# import libraries
library(httr)
library(jsonlite)
library(openxlsx)
library(stringr)


# Repository and github username/pw
input_filename = "repos.xlsx"
output_filename = "outfile.txt"

user <- "flyqk"
pw <- "qk@github/910304"
authentication <- authenticate(user, pw)


getTotalPages <- function(info) {
  # Finds the last page from the API GET request.
  #
  # Args:
  #   info: content from API GET request -> http response object
  #
  # Returns:
  #   The last page number; the number of pages in the request -> integer
  
  linkHeaderStr = info$headers$link
  totalPages = 1
  if (!is.null(linkHeaderStr)) {
    last_page <- stringr::str_match(linkHeaderStr, "page=(\\d+)>; rel=\\\"last\\\"")
    totalPages = as.integer((last_page[, 2]))
  }
  return(as.integer(totalPages))
}

convertToAPI <- function(repo_url) {
  # Converts Github repo URL to API URL.
  #
  # Args:
  #   repo_url: Github repository URL -> characters
  #
  # Returns:
  #   The converted URL -> characters
  
  api_path = "https://api.github.com/repos"
  extracted_repo_name = unlist(strsplit(as.character(repo_url), "https://github.com/"))[2]
  return(paste(api_path, extracted_repo_name, sep="/", collapse=NULL))
}


input_data = read.xlsx(input_filename, colNames=TRUE) # import datasheet as DataFrame
for(project in 1:nrow(input_data)) {
  project_name <- input_data[project, 1]
  project_url <- input_data[project, 2]
  url <- convertToAPI(project_url)
  
  # get the latest commit date
  commit_url <- paste(url, "/commits?page=1", sep="")
	info <- GET(commit_url, authentication)
  last_page <- getTotalPages(info)
  latest_commit_data <- content(info)
	latest_date <- latest_commit_data[[1]]$commit$author$date
	latest_date <- substr(latest_date, 0, 10)
	
	# get oldest commit
	commit_url <- paste(url, "/commits?page=", last_page, sep="")
	info <- GET(commit_url, authentication)
	oldest_commit_data <- content(info)
	l <- length(oldest_commit_data)
	oldest_date <- oldest_commit_data[[l]]$commit$author$date
	oldest_date <- substr(oldest_date, 0, 10)
	
	# calculate time difference
	date_list <- strptime(c(latest_date, oldest_date), format="%Y-%m-%d")
	diff_in_days <- difftime(date_list[1], date_list[2], units="days")
  print(diff_in_days)
    
  # append to output file
	cat(project_name, file=output_filename, append=TRUE, sep="\n")
	cat(url, file=output_filename, append=TRUE, sep="\n")
	cat(diff_in_days, file=output_filename, append=TRUE)
	cat(" days\n", file=output_filename, append=TRUE, sep="\n")
}