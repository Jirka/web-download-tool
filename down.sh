#!/bin/bash

CONFIGPATH='config/bashconfig.json' 	#path to generate configuration from current settings
RESULTPATH='../gen/'					#path where results will be saved 
LIST_OF_URLS="./service-urls"			#path to file containing list of urls - each on sepearate line
START_INDEX=0	 						#number of line to start  (while reading from `LIST_OF_URLS`) 
ITERATIONS=0							#max number of iterations, 0 = all
WIDTH=800								#width of browser window
HEIGHT=800								#height of browser window
TIMEOUT=6000							#timeout in ms
REMOVE_ELEMENTS_BIGGER_THAN=70

#CLEAN_STORAGE recommended set to true, otherwise there may be problem with sequencing folders
CLEAN_STORAGE=true						#flag to delete all files and directories inside result path
SERVICES=('klipfolio' 'clicdata' 'datapine')
SERVICE_NAME='other'

#initialization
I=0
COUNT=0
WEBPAGE=''


if [ ${CLEAN_STORAGE} = true ]; then
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

		ZERO=''
		if [ $SERVICE_COUNT -lt 10 ]; then
			ZERO='0'
		fi

		NEWRESULTPATH=$NEWRESULTPATH$ZERO$SERVICE_COUNT
		# echo ${NEWRESULTPATH}
		# break		

		#generate JSON configuration file
		printf '{"url" : "%s", "width":%d,"height":%d,"resultPath":"%s", "timeout" : %d, "removeElementsBiggerThan" : %d}\n' "$WEBPAGE" "$WIDTH" "$HEIGHT" "$NEWRESULTPATH" "$TIMEOUT" "$REMOVE_ELEMENTS_BIGGER_THAN" > "$CONFIGPATH"
	

		#run program
		phantomjs main.js -c "$CONFIGPATH"

		((COUNT++))
	fi

	((I++))

	# break

done < "$LIST_OF_URLS"


#this should

echo "has been downloaded ${COUNT}"