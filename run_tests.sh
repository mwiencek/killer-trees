#!/usr/bin/env bash

node --test test/List.js
node --test test/Map.js
node --test test/Record.js
node --test test/Set.js
node --test test/compareValues.js

node --test test/monkey/List.js
node --test test/monkey/Map.js
node --test test/monkey/Record.js
node --test test/monkey/Set.js
