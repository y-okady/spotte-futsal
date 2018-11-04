#/bin/sh
curl -X DELETE "localhost:9200/futsal"
curl -X PUT "localhost:9200/futsal" -H 'Content-Type: application/json' -d @../create_index_futsal.json