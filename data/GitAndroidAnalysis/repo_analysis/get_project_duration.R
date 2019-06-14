# import libraries
library(jsonlite)
library(httr)
library(stringr)


# Repository and github username/pw
inputs <- list("https://api.github.com/repos/yeriomin/YalpStore",
               "https://api.github.com/repos/daktak/afh_downloader",
               "https://api.github.com/repos/martykan/webTube")
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


for(url in inputs) {
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
	cat(url, file=output_filename, append=TRUE, sep="\n")
	cat(diff_in_days, file=output_filename, append=TRUE)
	cat(" days\n", file=output_filename, append=TRUE, sep="\n")
}


