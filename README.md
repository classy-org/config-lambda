# config-lambda
Simple file based configuration for multi stage lambda deployments with support for other configuration factories like credstash-lambda.

# installation

 $ npm install --save config-lambda

# options

* file: (STRING) the configuration file in JSON format
* stage: (STRING) the stage of deployment, referring to which section of the JSON file should be used for configuration

# usage

Config.get(key)

environment.json
```json
{
  "dev": {
    "SAMPLE_KEY": "SAMPLE_VALUE"
  }
}
```

```javascript
const Config = require('config-lambda')({
  file: 'environment.json',
  stage: 'dev'
});

function doSomething(..., sampleValue, callback) {
   ...
   callback();
}

module.exports.handle = (event, context, callback) => {
  let sampleValue = Config.get('SAMPLE_KEY');
  console.log(`SAMPLE_KEY: ${sampleValue}`);
  doSomething(..., sampleValue, callback);
}
```

Config.load([factory]) / Config.get(key)

```json
{
  "dev": {
    "SAMPLE_KEY": "SAMPLE_VALUE"
  }
}
```

```javascript
const Config = require('config-lambda')({
  file: 'environment.json',
  stage: 'dev'
});
const CredstashLambda = require('credstash-lambda')({
  table: 'SECRET_TABLE',
  region: 'AWS_REGION',
  keys: ['SAMPLE_SECRET_KEY']
});

function doSomething(..., sampleValue, sampleSecret, callback) {
   ...
   callback();
}

module.exports.handle = (event, context, callback) => {
  Config.load([CredstashLambda], function(error) {
    if (error) {
      callback(error);
    } else {
      let sampleValue = Config.get('SAMPLE_KEY'),
        sampleSecret = Config.get('SAMPLE_SECRET_KEY');
      console.log(`SAMPLE_KEY: ${sampleValue} SAMPLE_SECRET: ${sampleSecret}`);
      doSomething(..., sampleValue, sampleSecret, callback);
    }
  })
}
```
