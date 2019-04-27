library(jsonlite)
library(httr)
library(stringr)

# Repository and github username/pw
urls <- list("https://api.github.com/repos/dkim0419/SoundRecorder","https://api.github.com/repos/javiersantos/MLManager","https://api.github.com/repos/afollestad/photo-affix","https://api.github.com/repos/esoxjem/MovieGuide","https://api.github.com/repos/avjinder/Minimal-Todo","https://api.github.com/repos/AntonioRedondo/AnotherMonitor","https://api.github.com/repos/frogermcs/InstaMaterial","https://api.github.com/repos/federicoiosue/Omni-Notes","https://api.github.com/repos/heruoxin/Clip-Stack","https://api.github.com/repos/AntennaPod/AntennaPod","https://api.github.com/repos/jivacf/archi","https://api.github.com/repos/bitcoin-wallet/bitcoin-wallet","https://api.github.com/repos/google/ExoPlayer","https://api.github.com/repos/codinguser/gnucash-android","https://api.github.com/repos/google/iosched","https://api.github.com/repos/k9mail/k-9","https://api.github.com/repos/byoutline/kickmaterial","https://api.github.com/repos/TeamNewPipe/NewPipe","https://api.github.com/repos/j4velin/Pedometer","https://api.github.com/repos/kabouzeid/Phonograph","https://api.github.com/repos/watabou/pixel-dungeon","https://api.github.com/repos/nickbutcher/plaid","https://api.github.com/repos/moezbhatti/qksms","https://api.github.com/repos/timusus/Shuttle","https://api.github.com/repos/JakeWharton/Telecine","https://api.github.com/repos/vmihalachi/turbo-editor","https://api.github.com/repos/videolan/vlc","https://api.github.com/repos/Musenkishi/wally","https://api.github.com/repos/wordpress-mobile/WordPress-Android","https://api.github.com/repos/joyoyao/superCleanMaster","https://api.github.com/repos/kickstarter/android-oss","https://api.github.com/repos/k0shk0sh/FastHub","https://api.github.com/repos/hidroh/materialistic","https://api.github.com/repos/owncloud/android","https://api.github.com/repos/google/santa-tracker-android","https://api.github.com/repos/uberspot/2048-android","https://api.github.com/repos/DrKLO/Telegram","https://api.github.com/repos/signalapp/Signal-Android","https://api.github.com/repos/MindorksOpenSource/android-mvp-architecture","https://api.github.com/repos/shadowsocks/shadowsocks-android","https://api.github.com/repos/wikimedia/apps-android-wikipedia","https://api.github.com/repos/xcc3641/SeeWeather","https://api.github.com/repos/todoroo/astrid","https://api.github.com/repos/pockethub/PocketHub","https://api.github.com/repos/todotxt/todo.txt-android","https://api.github.com/repos/prey/prey-android-client","https://api.github.com/repos/iFixit/iFixitAndroid","https://api.github.com/repos/manmal/hn-android/","https://api.github.com/repos/gaugesapp/gauges-android","https://api.github.com/repos/cgeo/cgeo","https://api.github.com/repos/talklittle/reddit-is-fun","https://api.github.com/repos/TeamAmaze/AmazeFileManager","https://api.github.com/repos/HoraApps/LeafPic","https://api.github.com/repos/SimpleMobileTools/Simple-Calendar","https://api.github.com/repos/1hakr/AnExplorer","https://api.github.com/repos/naman14/Timber","https://api.github.com/repos/Nightonke/CoCoin","https://api.github.com/repos/project-travel-mate/Travel-Mate","https://api.github.com/repos/Neamar/KISS","https://api.github.com/repos/android10/Android-CleanArchitecture")
user <- ""
pw <- ""
 getTotalPages <- function(linkHeaderStr) {
  matched <-
    stringr::str_match(linkHeaderStr, "page=(\\d+)>; rel=\\\"last\\\"")
  as.integer(matched[, 2])
}

for(url in urls){
	tryCatch({
	    info <- GET(paste(url, "/commits?page=1", sep = ''), authenticate(user, pw))
		pages <- getTotalPages(info$headers$link)
		latest_commit <- GET(paste(url, "/commits?page=1", sep = ''),authenticate(user, pw))
		latest_commit_data <- content(latest_commit)
		latest_date <- latest_commit_data[[1]]$commit$author$date
		latest_date <- substr(latest_date,0,10)
		oldest_commit <- GET(paste(url, "/commits?page=",pages, sep = ''),authenticate(user, pw))
		oldest_commit_data <- content(oldest_commit)
		l <- length(oldest_commit_data)
		oldest_date <- oldest_commit_data[[l]]$commit$author$date
		oldest_date <- substr(oldest_date,0,10)
		date_strings = c(oldest_date,latest_date)
		datetimes = strptime(date_strings, format = "%Y-%m-%d")
		diff_in_days = difftime(datetimes[2], datetimes[1], units = "days")

		cat(url,file="outfile.txt",append=TRUE)
		cat("\n",file="outfile.txt",append=TRUE)
		cat(diff_in_days,file="outfile.txt",append=TRUE,sep="\n")
	}, warning = function(w) {
		print(w)
	}, error = function(e) {
		print(e)
	})
	
}


