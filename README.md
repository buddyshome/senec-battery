# senec-battery

API to read charging level and state from senec battery using lala.cgi

You can try the curl statement to determine if it in gernal works with your senec battery

curl -k -X POST "https://<IP_ADDRESS>/lala.cgi" -H "Content-Type: application/json" -d "{ \"ENERGY\": { \"GUI_HOUSE_POW\": \"\", \"GUI_GRID_POW\": \"\", \"GUI_INVERTER_POWER\": \"\", \"GUI_BAT_DATA_POWER\": \"\", \"GUI_BAT_DATA_FUEL_CHARGE\": \"\", \"STAT_STATE\": \"\", \"STAT_STATE_TEXT\": \"\" }, \"STATISTIC\": { \"LIVE_GRID_IMPORT\": \"\" }, \"PM1OBJ1\": { \"P_AC\": \"\" } }"

Replace the <IP_ADDRESS> with the ip of the senec battery.