#!/usr/bin/env -S node --no-deprecation
const CogearJS = require('../lib/cogear.js');
const cogear = new CogearJS();
cogear.emit('cli');
