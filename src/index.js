'use strict';
require('regenerator-runtime/runtime');
const _ = require('lodash');

function Once(f) {
  this.oncePromise = f();
}

Once.prototype.do = function() {
  return this.oncePromise;
};

module.exports = function(config) {
  let secrets;
  let initializationOnce;

  let configuration;
  let factories;

  if (!config || !config.environments || !config.stage) {
    console.log(!config, !config.environments, !config.stage);
    throw new Error(`You must provide an environments object and stage.`);
  }
  configuration = config.environments[config.stage];
  return {
    loadAsync: async function(factoryList) {
      if (!initializationOnce) {
        initializationOnce = new Once(async () => {
          factories = factoryList;

          for (let factory of factories) {
            await factory.loadAsync();
          }
        });
      }
      await initializationOnce.do();
    },
    load: function(factoryList, next) {
      // Using _.defer here pulls the execution out from under the promise
      // which causes thrown exceptions to bubble up all the way to the root
      //  of the stack instead of to the promise's try/catch infrastructure.
      this.loadAsync(factoryList).then(() => {
        _.defer(next);
      }).catch(error => {
        _.defer(next, error);
      });
    },
    get: function(key) {
      if (!factories) {
        throw Error('Call loadAsync or load before using get');
      }
      if (!configuration) {
        throw Error('No configuration for environment')
      }

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
