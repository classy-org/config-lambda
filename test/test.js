const keys = JSON.parse(process.argv[4]);
const Config = require('../index.js')({
  environments: require('./environment.json'),
  stage: 'dev'
});
const Credstash = require('credstash-lambda')({
  table: process.argv[2],
  region: process.argv[3],
  keys
});
Config.load([Credstash], function(error) {
  if (error) {
    console.error(error);
  } else {
    console.log(Config.get('SAMPLE_KEY'));
    console.log(Config.get(keys[0]));
  }
});
