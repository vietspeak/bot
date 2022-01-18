#!/bin/bash

echo "-----------------------------------
🅗🅔🅛🅛🅞 reboot VIETSPEAK:
-----------------------------------
"
#remove .dbdata when re-runing docker-compose up 
echo "Remove the volume named .mysql_data (if any) folder (mysql) which was created on the host during the development: "
# When explitly declare a volume for mysql_data in docker-compose.yml, then there will be no hidden folder name mysql_data created here, inside the code folder. So the following command might not make any sense.
sudo rm -rf ./mysql_data
echo \


echo "Displaying system-wide information:"
docker system info
echo \


#LIST the volumne;
echo "List of the current volume(s):"
docker volume ls;

echo \;
echo "Do you want to update node_modules which is needed when you add a new package via npm? Type 'y' (Yes) or 'n' (No): ";
read answer;

if [[ $answer == "y" ]] || [[ $answer == "Y" ]]
then
  echo "➊ Turn the docker down. ➋ Remove the node_modules if update package.json ➌ Rebuild:"
  docker-compose down && docker volume rm bot_vietspeak_kiwi_node_modules && docker-compose build --build-arg kiwi_arg=1 #build and run, with cache. CANNOT pass --no-cache here: KEEP PERSISTENT DATA in MYSQL
else
  echo "➊ Turn the docker down and ➋ Rebuild:"
  docker-compose down && docker-compose build --build-arg kiwi_arg=1 #build and run, with cache. CANNOT pass --no-cache here: KEEP PERSISTENT DATA in MYSQL
fi

# Run the images built
docker-compose up -d --no-build;


#-----------------------------------------------------------------------------------------------------#
#                                                                                                     #
#                      note: please use "bash zboot.sh" instead of "sh zboot.sh"                      #
#                                                                                                     #
#-----------------------------------------------------------------------------------------------------#