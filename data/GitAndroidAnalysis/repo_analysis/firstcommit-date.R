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
  release_page <- paste(url, "/releases?page=1", sep="")
  info <- GET(release_page, authentication)
	pages <- getTotalPages(info)
	
	last_page <- paste(url, "/releases?page=", pages, sep="")
	oldest_release <- GET(last_page, authentication)
	oldest_release_data <- content(oldest_release)
	l <- length(oldest_release_data)
	oldest_date <- oldest_release_data[[l]]$published_at
	oldest_date <- substr(oldest_date, 0, 10)
	print(oldest_date)
	
	# append to output file
	cat(url, file=output_filename, append=TRUE, sep="\n")
	cat(oldest_date, file=output_filename, append=TRUE, sep="\n")
	cat("\n", file=output_filename, append=TRUE)
}