'use strict';

var gulp = require('gulp'),
  argv = require('yargs').argv,
  _ = require('lodash'),
  jscs = require('gulp-jscs'),
  jscsReporter = require('gulp-jscs-stylish'),
  exec = require('child_process').exec,
  plugins = require('gulp-load-plugins')({
    pattern: ['gulp-*', 'main-bower-files', 'uglify-save-license', 'del']
  }),

  env = argv.env || 'local',

  configBase = function(path, prefix) {
    return (prefix ? prefix + '/' : '') + 'src/main/config' + (path ? '/' + path : '');
  },

  artifactBase = function(path, prefix) {
    return (prefix ? prefix + '/' : '') + 'gulp-target' + (path ? '/' + path : '');
  },

  clientBase = function(path, prefix) {
    return (prefix ? prefix + '/' : '') + 'src/main/webapp' + (path ? '/' + path : '');
  },

  clientDistributionBase = function(path, prefix) {
    return artifactBase('dist' + (path ? '/' + path : ''), prefix);
  };

console.log('ENV=' + env);

function handleError(err) {
  console.error(err.toString());
  this.emit('end');
}

gulp.task('clean-dist', function(cb) {
  return plugins.del([clientDistBase()], cb);
});

gulp.task('config-app', function() {
  var config = {
      prod: configBase('/environments/prod/*.js'),
      qa: configBase('/environments/qa/*.js'),
      dev: configBase('/environments/dev/*.js'),
      local: configBase('/environments/local/*.js')
    },
    envConfig = config[env] || config.local;
  return gulp.src(envConfig)
    .on('error', handleError)
    .pipe(gulp.dest(clientBase('application/configuration')));
});

gulp.task('config-env', function() {
  var config = {
      prod: configBase('/environments/prod/*.json'),
      qa: configBase('/environments/qa/*.json'),
      dev: configBase('/environments/dev/*.json'),
      local: configBase('/environments/local/*.json')
    },
    envConfig = config[env] || config.local;
  return gulp.src(envConfig)
    .on('error', handleError)
    .pipe(gulp.dest(clientBase('configuration')));
});

gulp.task('config-dist', function() {
  return gulp.src(configBase('/environments/**/*.js'))
    .on('error', handleError)
    .pipe(gulp.dest(clientDistBase('/application/configuration/environments')));
});

gulp.task('doc', function(cb) {
  exec('node_modules\\.bin\\jsdoc -c jsdoc-conf.json', function(err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    cb(err);
  });
});

gulp.task('fonts', function() {
  return gulp.src(plugins.mainBowerFiles())
    .pipe(plugins.filter('**/*.{eot,svg,ttf,woff}'))
    .pipe(plugins.flatten())
    .pipe(gulp.dest(clientDistBase('fonts')))
    .pipe(plugins.size());
});

gulp.task('format', ['styles'], function() {
  return gulp.src([
      clientBase('**/*.js'),
      '!' + clientBase('bower_components/**/*')
    ])
    .pipe(jscs({fix: true}))
    .pipe(gulp.dest(clientBase()))
    .pipe(jscsReporter());
});

gulp.task('html', ['styles', 'scripts', 'views'], function() {
  var jsFilter = plugins.filter('**/*.js'),
    cssFilter = plugins.filter('**/*.css'),
    assets;

  return gulp.src(clientBase('index.html'))
    .pipe(plugins.inject(gulp.src(artifactBase('.tmp/views/**/*.js')), {
      read: false,
      starttag: '<!-- inject:views -->',
      addRootSlash: false,
      addPrefix: '../'
    }))

    .pipe(assets = plugins.useref.assets())
    .pipe(plugins.rev())

    .pipe(jsFilter)
    .pipe(plugins.ngAnnotate())
    .pipe(plugins.uglify({preserveComments: plugins.uglifySaveLicense}))
    .pipe(jsFilter.restore())

    .pipe(cssFilter)
    .pipe(plugins.replace('bower_components/bootstrap/fonts', 'fonts'))
    .pipe(plugins.csso())
    .pipe(cssFilter.restore())

    .pipe(assets.restore())

    .pipe(plugins.useref())
    .pipe(plugins.revReplace())
    .pipe(gulp.dest(clientDistBase()))
    .pipe(plugins.size());
});

gulp.task('images-optimized', function() {
  return gulp.src(clientBase('components/images/**/*'))
    .pipe(plugins.imagemin({
      optimizationLevel: 4,
      progressive: true,
      interlaced: true
    }))
    .pipe(gulp.dest(clientDistBase('components/images')))
    .pipe(plugins.size());
});

gulp.task('install', function() {
  return gulp.src(['./bower.json', './package.json'])
    .pipe(plugins.install());
});

gulp.task('node-dependencies', function(cb) {
  var nodeDependencies = require('../package.json').dependencies;

  if (nodeDependencies) {
    _.each(nodeDependencies, function(location, name) {
      gulp.src('./node_modules/' + name + '/**/*').pipe(gulp.dest(clientBase('bower_components/' + name)));
    });
  }
  cb();
});

gulp.task('scripts', function() {
  return gulp.src([
      clientBase('**/*.js'),
      '!' + clientBase('bower_components/**/*')
    ])
    .pipe(plugins.jshint())
    .pipe(plugins.jshint.reporter('jshint-stylish'))
    .pipe(plugins.size());
});

gulp.task('styles', function() {
  return gulp.src(clientBase('app.less'))
    .pipe(plugins.less())
    .on('error', handleError)
    .pipe(plugins.autoprefixer('last 1 version'))
    .pipe(gulp.dest(clientBase()))
    .pipe(plugins.size());
});

gulp.task('views', function() {
  return gulp.src([
      clientBase('**/*.html'),
      clientBase('**/*.svg'),
      '!' + clientBase('index.html'),
      '!' + clientBase('bower_components/**/*')
    ])
    .pipe(plugins.ngHtml2js({
      moduleName: 'koinonia'
    }))
    .pipe(gulp.dest(artifactBase('.tmp/views')))
    .pipe(plugins.size());
});

gulp.task('watch', function() {
  gulp.watch([clientBase('**/*.less'), '!' + clientBase('bower_components/**/*')], ['styles'])
    .on('change', function() {
        console.log('Less files changed... Generating new style sheets...');
      }
    );
});

gulp.task('build', ['clean-dist'], function() {
  gulp.start('build-resources');
});

gulp.task('build-resources', ['node-dependencies', 'html', 'images-optimized', 'fonts', 'config-dist']);

gulp.task('config', ['config-app', 'config-env']);

gulp.task('develop', ['install', 'node-dependencies', 'config', 'watch'], plugins.shell.task([
  'npm start'
]));