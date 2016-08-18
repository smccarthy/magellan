"use strict";

var TEST_STATUS_NEW = 1;
var TEST_STATUS_FAILED = 2;
var TEST_STATUS_SUCCESSFUL = 3;

// MAGELLAN@9.0.0
function Test(locator, env, maxAttempts) {
  //
  // note: this locator object is an instance of an object which is defined by whichever test
  // framework plugin is currently loaded. The implementation of locator could be almost any
  // shape, and the only duck type strictly required by magellan is that toString() is defined
  //
  this.locator = locator;

  this.maxAttempts = maxAttempts;

  this.attempts = 0;
  this.status = TEST_STATUS_NEW;

  this.workerIndex = -1;
  this.error = undefined;
  this.stdout = "";
  this.stderr = "";

  // MAGELLAN@9.0.0
  // this.browser = browser;
  // this.sauceBrowserSettings = sauceBrowserSettings;
  this.env = env;
}

// Return true if we've either:
//   1. passed this test, OR
//   2. failed this test too many times
Test.prototype.canRun = function () {
  var canRetry = this.status === TEST_STATUS_FAILED && this.attempts < this.maxAttempts;
  var isNew = this.status === TEST_STATUS_NEW;
  return !isNew && !canRetry;
};

Test.prototype.pass = function () {
  this.attempts++;
  this.status = TEST_STATUS_SUCCESSFUL;
};

Test.prototype.fail = function () {
  this.attempts++;
  this.status = TEST_STATUS_FAILED;
};

Test.prototype.startClock = function () {
  this.runningTime = undefined;
  this.startTime = (new Date()).getTime();
};

Test.prototype.stopClock = function () {
  this.runningTime = (new Date()).getTime() - this.startTime;
};

// return an unambiguous representation of this test: path, browserId, resolution, orientation
Test.prototype.toString = function () {
  return this.locator.toString() + this.env.toString();
};

Test.prototype.getRuntime = function () {
  if (this.runningTime) {
    return this.runningTime;
  } else {
    return (new Date()).getTime() - this.startTime;
  }
};

Test.prototype.getRetries = function () {
  return this.attempts - 1;
};

Test.TEST_STATUS_NEW = TEST_STATUS_NEW;
Test.TEST_STATUS_FAILED = TEST_STATUS_FAILED;
Test.TEST_STATUS_SUCCESSFUL = TEST_STATUS_SUCCESSFUL;

module.exports = Test;
