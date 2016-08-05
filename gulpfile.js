var gulp          = require('gulp');  
var p             = require('gulp-load-plugins')();
var gutil         = require('gulp-util');

var browserSync   = require('browser-sync'),
    fs            = require('fs'),
    del           = require('del'),
    runSequence   = require('run-sequence'),
    browserify    = require('browserify'),
    watchify      = require('watchify'),
    source        = require('vinyl-source-stream'),
    buffer        = require('vinyl-buffer'),
    child         = require('child_process');

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

// Task to clean out files to be replaced on tasks
gulp.task('clean:dev', function(cb){
    del(prod ? ['app', 'img/sprites.png'] : ['dist', 'img/sprites.png'], cb)
});


// Browserify for creating javascript bundle
var bundler = browserify({
    // Required watchify args
    cache: {},
    packageCache: {},
    fullPaths: true,
    // Browserify options
    entries: ['_javascript/main.js']
  });

var bundle = function() {
  return bundler
    .bundle()
    .pipe(customPlumber('Error running Scripts'))
    .on('error', errorLog)
    .pipe(source('main.js'))
    .pipe(buffer())
    .pipe(p.uglify())
    .pipe(gulp.dest(config.AssetsPath + 'js'))
    .pipe(p.notify({ message: 'JS Uglified!', onLast: true }))
    .pipe(browserSync.reload(bs_reload))
}

gulp.task('browserify', function() {
  return bundle();
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
  
  // gulp.watch(['img/**/**/*',], ['imagemin']);
});

gulp.task('watch-js', function() {
  var watchifyBundler = watchify(bundler);
  watchifyBundler.on('update', bundle);

  return bundle();
});



/*
  Unused tasks
*/

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
    ['browserSync', 'watch', 'watch-js'],
    callback
  )
});
