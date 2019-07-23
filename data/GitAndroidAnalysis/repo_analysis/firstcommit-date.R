# This script takes in a .xlsx file with a specific format (see repos.xlsx for reference),
# finds the date of first commit, and stores the result in a text file.
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
  
  release_page <- paste(url, "/releases?page=1", sep="")
  info <- GET(release_page, authentication)
	pages <- getTotalPages(info)
	
	last_page <- paste(url, "/releases?page=", pages, sep="")
	oldest_release <- GET(last_page, authentication)
	oldest_release_data <- content(oldest_release)
	l <- length(oldest_release_data)
	oldest_date <- oldest_release_data[[l]]$published_at
	oldest_date <- substr(oldest_date, 0, 10)
	print(project_name)
	print(oldest_date)
	
	# append to output file
	cat(project_name, file=output_filename, append=TRUE, sep="\n")
	cat(url, file=output_filename, append=TRUE, sep="\n")
	cat(oldest_date, file=output_filename, append=TRUE, sep="\n")
	cat("\n", file=output_filename, append=TRUE)
}