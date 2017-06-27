var gulp          = require('gulp');  
var p             = require('gulp-load-plugins')();
var gutil         = require('gulp-util');

var browserSync   = require('browser-sync'),
    fs            = require('fs'),
    del           = require('del'),
    runSequence   = require('run-sequence'),
    babelify      = require('babelify'),
    browserify    = require('browserify'),
    watchify      = require('watchify'),
    source        = require('vinyl-source-stream'),
    buffer        = require('vinyl-buffer'),
    glob          = require('glob'),
    child         = require('child_process'),
    es            = require('event-stream');

// Important variables used throughout the gulp file //

// Configurations for different file paths
var config = {
    siteRoot: '_site',
    projectPath: '_site/',
    AssetsPath: 'assets/',
    componentPath: 'components/'
}

// Set to true if in production. Files will go to the 'app' folder.
// Set to false if launching. Files will go to the 'dist' folder, clean and ready
var prod = true;

// Find errors!
function errorLog(error) {
  console.error.bind(error);
  this.emit('end');
}

// Function for plumber to handle errors
function customPlumber(errTitle) {
    return p.plumber({
        errorHandler: p.notify.onError({
            // Custom error titles go here
            title: errTitle || 'Error running Gulp',
            message: "<%= error.message %>",
            sound: 'Submarine',
        })
    });
}

// Browser Sync settings and config
var bs_reload = {
    stream: true
};

gulp.task('browserSync', function() {
    var Settings = {
        files: [config.siteRoot + '/**'],
        port: 4000,
        server: { baseDir: config.siteRoot },
        reload: ({ stream: true}),
        notify: false
    };

    browserSync(Settings)
});


gulp.task('browserify', function(done) {
  glob('_javascript/main-**.js', function(err, files) {
    if(err) done(err);

    var tasks = files.map(function(entry) {
      return browserify({
        entries: [entry],
        outputStyle: 'compressed'
      })
      .transform("babelify", {presets: ["es2015"]})
      .bundle()
      .pipe(customPlumber('Error running Scripts'))
      .pipe(source(entry))
      .pipe(buffer())
      .pipe(p.uglify())
      .pipe(p.rename({
        dirname: "js"
      }))
      .pipe(gulp.dest(config.AssetsPath))
      .pipe(p.notify({ message: 'JS Browserified!', onLast: true }))
      .pipe(browserSync.reload(bs_reload))
    });
    es.merge(tasks).on('end', done);
  })
});

// Converts the Sass partials into a single CSS file
gulp.task('sass', function () {
    
    // Sass and styling variables
    var sassInput = '_sass/main.scss';
    
    var sassOptions = { 
        outputStyle: 'compressed',
        includePaths: [config.componentPath]
    };

    var autoprefixerOptions = {
      browsers: ['last 2 versions', '> 5%', 'Firefox ESR']
    };

    var unCSS_Settings = {
        html: ['_site/**/*.+(html|nunjucks)'],
        ignore: [
            /.is-/,
            /.has-/
        ]
    }

  return gulp
    .src(sassInput)
    .pipe(customPlumber('Error running Sass'))
    // If in prod, will add sourcemaps to Sass
    .pipe(p.if(prod, p.sourcemaps.init()))
    // Write Sass for either dev or prod
    .pipe(p.sass(sassOptions))
    .pipe(p.uncss(unCSS_Settings))
    .pipe(p.if(!prod, p.autoprefixer(autoprefixerOptions)))
    .pipe(p.if(prod, p.sourcemaps.write()))
    .pipe(p.rename("style.css"))
    // Sends the Sass file to either the app or dist folder
    .pipe(gulp.dest(config.AssetsPath + 'css'))
    .pipe(p.notify({ message: 'Sass Processed!', onLast: true }))
    .pipe(browserSync.reload(bs_reload))
});

// Task for updating Jekyll with Gulp workflow
// For newer Jekyll versions, may need to add "bundle exec" to front of this command. Only one word can be used before the others must be put in the array below.
gulp.task('jekyll', () => {
  const jekyll = child.spawn('jekyll', ['serve',
    '--watch',
    '--incremental',
    '--drafts'
  ]);

  const jekyllLogger = (buffer) => {
    buffer.toString()
      .split(/\n/)
      .forEach((message) => gutil.log('Jekyll: ' + message));
  };

  jekyll.stdout.on('data', jekyllLogger);
  jekyll.stderr.on('data', jekyllLogger);
});


// Task to watch the things!
gulp.task('watch', function(){
  gulp.watch('_sass/**/**/*.scss', ['sass']);
  gulp.watch('_javascript/**/**/*.js', ['browserify']);
  
  // gulp.watch(['img/**/**/*',], ['imagemin']);
});




/*
  Unused tasks
*/

// Combining JS with include
gulp.task('scripts', function(){

  gulp.src('_javascript/main.js')
  .pipe(customPlumber('Error running Scripts'))
  .pipe(p.include()).on('error', console.log)
  .pipe(p.uglify())
  .pipe(gulp.dest(config.AssetsPath + 'js'))
  
  .pipe(browserSync.reload(bs_reload))
});


// Imagemin task for images not added into a sprite map
gulp.task('imagemin', function() {
    return gulp.src('images/**/*')
    .pipe(p.imagemin({
        progressive: true
    }))

    .pipe(gulp.dest(config.AssetsPath + 'img'))
});




// Tasks that run multiple other tasks, including default //

gulp.task('default', function(callback) {
  runSequence(
    'jekyll',
    ['sass', 'browserify'], 
    ['browserSync', 'watch'],
    callback
  )
});
