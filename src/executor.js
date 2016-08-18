"use strict";

var util = require("util");
var _ = require("lodash");
var Q = require("q");

var Executor = function Executor(options) {
  // local use for now
  var self = this;
  this.environments = [];

  var browsers = (options.local_browsers || options.local_browser).split(",");

  _.forEach(browsers, function (browser) {
    var env = { browser: browser };
    if (options.local_resolution) {
      env.resolution = options.local_resolution;
    }

    if (options.local_orientation) {
      env.orientation = options.local_orientation;
    }
    env.toString = function () {
      return " @" + this.browser + " " + (this.resolution ? "res:" + this.resolution : "") + (this.orientation ? "orientation:" + this.orientation : "")
    };
    self.environments.push(env);
  });
};

Executor.prototype = {
  execute: function (testRun, test) {
    var deferred = Q.defer();
    
    var env;
    try {
      env = testRun.getEnvironment(settings.environment);
    } catch (e) {
      deferred.reject(e);
      return deferred.promise;
    }

    var options = {
      env: env,
      silent: true,
      detached: false,
      stdio: ["pipe", "pipe", "pipe"]
    };

    var childProcess;
    try {
      childProcess = fork(testRun.getCommand(), testRun.getArguments(), options);
      this.notIdle();
    } catch (e) {
      deferred.reject(e);
      return deferred.promise;
    }

    return deferred.promise;
  }
};

var ExecutorExtension = function ExecutorExtension(options) {
  // local use for now
  this.options = options;
};

ExecutorExtension.prototype = {
  initialize: function (callback) {
    callback();
  },
  teardown: function (callback) {
    callback();
  },
  release: function (worker) {

  }
};

var help = {
  "local_browser": {
    example: "chrome",
    description: "Run tests in chrome, firefox, etc (default: phantomjs)."
  },
  "local_browsers": {
    example: "b1,b2...",
    description: "Run multiple browsers in parallel."
  },
  "local_resolution": {
    example: "1024x760",
    description: "Stretch browser according to given dimension"
  }
};

module.exports = {
  name: "testarmada-magellan-local-executor",
  prefix: "local",
  Executor: Executor,
  ExecutorExtension: ExecutorExtension,
  help: help,
  allocator: null
};
