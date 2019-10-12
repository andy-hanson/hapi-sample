#!/bin/sh
# Note: Run `npm start` in a separate console,
# then run this and manually verify the output in both consoles
curl localhost:3000/users --header "Content-Type: application/json" --data '{ "name": "andy", "email": "e", "password": "p", "phone": "800-867-5309" }'
echo ""
curl localhost:3000/users/andy/events --header "Content-Type: application/json" --data '{ "type": "LOGIN" }'
echo ""
curl localhost:3000/users/andy/events
echo ""
curl localhost:3000/users
echo ""
curl 'localhost:3000/events?today=true'
echo ""
