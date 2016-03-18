/**
 * Created by aallen on 3/18/2016.
 */
module.exports = function(config) {
  config.set({

    basePath: '', //XXX: Ignored by gulp-karma, Run tests using: gulp unit-tests

    files: [
      //XXX: Run tests using: gulp unit-tests
    ],

    autoWatch: true,

    browsers: ['PhantomJS'],

    frameworks: ['jasmine'],

    reporters: ['progress', 'coverage'],

    plugins: [
      //Karma will require() these plugins
      'karma-jasmine',
      'karma-phantomjs-launcher',
      'ng-html2js'
    ],

    preprocessors: {
      '../**/*.html': ['ng-html2js'],
      //Loads all folders in main/webapp except bower_components, configuration, and local.
      //Loads all files from those folders that are not mocks or specs.
      '../main/webapp/!(bower_components|configuration|local)/**/!(*specs|*mock).js': ['coverage']
    },

    ngHtml2JsPreprocessor: {
      /**
       * Creates an id for the $templateCache
       * Cuts the path of the file and returns the filename + the extension of the file
       * For example:
       * C:/Users/fruiz/../project/my-template.html will be my-template.htm
       *
       * TODO: doc possible collision
       */
      cacheIdFromPath: function(filepath) {
        return filepath.substring(filepath.lastIndexOf('/') + 1);
      },
      // setting this option will create only a single module that contains templates
      // from all the files, so you can load them all with module('foo')
      moduleName: 'templates'
    }
  });
};