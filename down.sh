#!/bin/bash

CONFIGPATH='config/bashconfig.json' 	#path to generate configuration from current settings
RESULTPATH='../gen/'					#path where results will be saved 
LIST_OF_URLS="./service-urls"			#path to file containing list of urls - each on sepearate line
START_INDEX=0   						#number of line to start  (while reading from `LIST_OF_URLS`) 
ITERATIONS=0 							#max number of iterations, 0 = all
WIDTH=1000								#width of browser window
HEIGHT=1000								#height of browser window
TIMEOUT=20000							#timeout in ms

#initialization
I=0
COUNT=0
WEBPAGE=''

while read -r line; do

	if [[ ( "$I" -ge "$START_INDEX" ) && ( ( "$ITERATIONS" -eq 0 ) || ( "$COUNT" -le "$ITERATIONS" ) ) ]]; then 
		WEBPAGE="$line"
		
		NEWRESULTPATH=$RESULTPATH$COUNT
		
		#generate JSON configuration file
		printf '{"width":%d,"height":%d,"resultPath":"%s", "wrap":true, "timeout" : %d}\n' "$WIDTH" "$HEIGHT" "$NEWRESULTPATH" "$TIMEOUT" > "$CONFIGPATH"

		#run program
		phantomjs main.js ${WEBPAGE} -c "$CONFIGPATH"

		((COUNT++))
	fi

	((I++))

	# break

done < "$LIST_OF_URLS"


#this should

echo "has been downloaded ${COUNT}"