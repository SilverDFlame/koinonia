'use strict';

var gulp = require('gulp'),
  karma = require('karma'),
  wiredep = require('wiredep'),
  fs = require('graceful-fs'),
  _ = require('lodash');

gulp.task('test', function(done) {
  var Server = karma.Server;
  new Server({
    configFile: __dirname + '/../src/test/karma.conf.js',
    files: loadTestFiles(),
    singleRun: true
  }, done).start();
});

function loadTestFiles() {
  var testFiles = wiredep({ // load the bower dependencies
      dependencies: true,
      devDependencies: true
    }).js.concat([
      __dirname + '/../node_modules/ng-html2js/bin/ng-html2js.js',
      __dirname + '/../src/main/webapp/bower_components/angular-mocks/angular-mocks.js'
    ]),

  // store src and test files in separate depth ordered objects
    localSrc = {
      src: {},
      test: {}
    };

  // get all the source-ish files at the public root
  loadFileNames(__dirname + '/../src/main/webapp', [/\/bower_components\//, /\/resources\//, /\/WEB-INF\//]).forEach(function(file) {
    // calculate the "depth" of this file in the dependency hierarchy
    var depth = file.split('.').length;

    if (endsWith(file, '.specs.js')) {
      localSrc.test[depth] = localSrc.test[depth] ? localSrc.test[depth].concat([file]) : [file];
    } else if (endsWith(file, '.js')) {
      localSrc.src[depth] = localSrc.src[depth] ? localSrc.src[depth].concat([file]) : [file];
    } else if (endsWith(file, '.html')) {
      localSrc.src[depth] = localSrc.src[depth] ? localSrc.src[depth].concat([file]) : [file];
    }
  });

  // add in the source in ascending order of dependency hierarchy depth
  _.each(localSrc.src, function(files) {
    testFiles = testFiles.concat(files);
  });

  // add the test files in ascending order of dependency hierarchy depth
  _.each(localSrc.test, function(files) {
    testFiles = testFiles.concat(files);
  });
  //console.log(testFiles);
  return testFiles;
}

/**
 * Walks a directory structure and collects file paths, excluding patterns
 *
 * @param dir
 * @param excludes
 * @returns {Array}
 */
function loadFileNames(dir, excludes) {
  var fileNames = [];

  (function readFileNames(dir) {
    if (!excludes.some(function(excludeRegEx) {
        return excludeRegEx.test(dir);
      })) { // not excluded
      if (fs.statSync(dir).isDirectory()) {
        fs.readdirSync(dir).forEach(function(file) {
          readFileNames(dir + '/' + file);
        });
      } else {
        fileNames.push(dir);
      }
    }
  }(dir));

  return fileNames;
}

function endsWith(str, ends) {
  if (ends === '') {
    return true;
  }
  if (str == null || ends == null) {
    return false;
  }
  str = String(str);
  ends = String(ends);
  return str.length >= ends.length && str.slice(str.length - ends.length) === ends;
}