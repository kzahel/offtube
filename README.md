This app lets you download youtube videos to play offline

## Installation (debian/ubuntu)

- `apt install python3-pip`
- `pip3 install youtube-dl`
- install nodejs
- edit config.json.example and add your youtube api key, save as config.json
- build third party JS dependencies. `cd makedeps; npm install; npm run make`
- build the assets `npm run watch` (then ctrl-C)
- run the server `node server.js`
