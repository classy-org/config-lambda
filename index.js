'use strict';
const async = require('async');
const _ = require('lodash');
let configuration;
let factories;

module.exports = function(config) {
  if (!config || !config.environments || !config.stage) {
    console.log(!config, !config.environments, !config.stage);
    throw new Error(`You must provide an environments object and stage.`);
  }
  configuration = config.environments[config.stage];
  return {
    load: (factoryList, next) => {
      factories = factoryList;
      async.each(factories, function(factory, callback) {
        factory.load(callback);
      }, next);
    },
    get: key => {
      let value = _.get(configuration, key, null);
      if (value) {
        return value;
      }
      for (let factory of factories) {
        let value = factory.get(key);
        if (value) {
          return value;
        }
      }
      return null;
    }
  };
};
