#!/bin/bash

CONFIGPATH='config/bashconfig.json' 	#path to generate configuration from current settings
RESULTPATH='../gen/'					#path where results will be saved 
LIST_OF_URLS="./service-urls"			#path to file containing list of urls - each on sepearate line
START_INDEX=0   						#number of line to start  (while reading from `LIST_OF_URLS`) 
ITERATIONS=0 							#max number of iterations, 0 = all
WIDTH=1000								#width of browser window
HEIGHT=1000								#height of browser window
TIMEOUT=3000							#timeout in ms
CLEAR_STORAGE=true						#flag to delete all files and directories inside result path

SERVICES=('klipfolio' 'clicdata' 'datapine')
SERVICE_NAME='other'

#initialization
I=0
COUNT=0
WEBPAGE=''


if [ ${CLEAR_STORAGE} = true ]; then
	rm -r "$RESULTPATH"
fi

while read -r line; do

	if [[ ( "$I" -ge "$START_INDEX" ) && ( ( "$ITERATIONS" -eq 0 ) || ( "$COUNT" -le "$ITERATIONS" ) ) ]]; then 
		WEBPAGE="$line"

		for SERVICE in ${SERVICES[@]}; do
			if [[ ${WEBPAGE} == *".$SERVICE."* ]]; then
				SERVICE_NAME="$SERVICE"
			fi
		done

		SERVICE_NAME="$SERVICE_NAME/"
		NEWRESULTPATH=$RESULTPATH$SERVICE_NAME

		SERVICE_COUNT=0	
		if [ -d ${NEWRESULTPATH} ]; then
			SERVICE_COUNT=`ls -l ${NEWRESULTPATH} | grep -c ^d`
		fi

		NEWRESULTPATH=$NEWRESULTPATH$SERVICE_COUNT
		
		#generate JSON configuration file
		printf '{"url" : "%s", "width":%d,"height":%d,"resultPath":"%s", "wrap":true, "timeout" : %d}\n' "$WEBPAGE" "$WIDTH" "$HEIGHT" "$NEWRESULTPATH" "$TIMEOUT" > "$CONFIGPATH"

		#run program
		phantomjs main.js -c "$CONFIGPATH"
		break

		((COUNT++))
	fi

	((I++))

	# break

done < "$LIST_OF_URLS"


#this should

echo "has been downloaded ${COUNT}"