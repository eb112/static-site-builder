var argv = require('yargs').argv,
    gulp = require('gulp'),
    gulpUtil = require('gulp-util'),
    sourcemaps = require('gulp-sourcemaps'),
    babel = require('gulp-babel'),
    sass = require('gulp-sass'),
    uglify = require('gulp-uglify'),
    fileinclude = require('gulp-file-include'),
    concat = require('gulp-concat'),
    imagemin = require('gulp-imagemin'),
    clean = require('gulp-clean'),
    mocha = require('gulp-mocha'),
    pump = require('pump'),
    vendorlist = require('./vendorlist'),
    browserSync = require('browser-sync');

gulp.task('default', function() { return true; });

/**
 * Deletes everything in dist folder.
 */
gulp.task('clean', function () {
    return gulp.src('./dist', {read: false})
        .pipe(clean());
});

/**
 * Concatenates all vendor js
 */
gulp.task('concat-js', function() {
    return gulp.src(vendorlist.js)
        .pipe(concat('vendor.js'))
        .pipe(gulp.dest('./dist/js'))
});

/**
 * Concatenates all vendor css
 */
gulp.task('concat-css', function() {
    return gulp.src(vendorlist.css)
        .pipe(concat('vendor.css'))
        .pipe(gulp.dest('./dist/css'))
});

/**
 * Moves images to dist folder and minifys
 */
gulp.task('images', function() {
    gulp.src('src/img/*')
        .pipe(imagemin())
        .pipe(gulp.dest('./dist/img'))
});

/**
 * Compiles sass for dev (sourcemaps logs errors)
 */
gulp.task('sass-dev', function() {
    return gulp.src('src/scss/styles.scss')
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./dist/css'))
});

/**
 * Compiles sass for production 
 */
gulp.task('sass-production', function() {
    return gulp.src('src/scss/styles.scss')
        .pipe(sass({ style: 'compressed' }).on('error', sass.logError))
        .pipe(gulp.dest('./dist/css'))
});

/**
 * Copies js for dev
 */
gulp.task('js', function() {
    return gulp.src('src/js/*.js')
        .pipe(gulp.dest('./dist/js'));
});

/**
 * Runs productions js through babel and uglify
 */
gulp.task('js-production', function (cb) {
    pump([
        gulp.src('src/js/*.js')
            .pipe(babel({presets: ['es2015']})),
        uglify(),
        gulp.dest('./dist/js')
    ],
    cb);
});

/**
 * Compiles html pages
 */
gulp.task('html', function() {
    return gulp.src('src/*.html')
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(gulp.dest('./dist'))
});

/**
 * Copy included files into proper folders
 */
gulp.task('fileIncludes', function() {
    var files = vendorlist.fileCopy;

    for (var key in files) {        
        return gulp.src(key)
            .pipe(gulp.dest("./dist/" + files[key]));
    }  
});

/**
 * Run js tests
 */
gulp.task('test', function() {
    gulp.src('src/js/main.js', {read: false})
        .pipe(mocha({reporter: 'nyan'}))
});

/**
 * Builds for dev or production with appropriate flag
 */
gulp.task('build', ['clean'], function(){
    if(argv.dev) {
        gulp.start([ 'html', 'sass-dev', 'js', 'concat-js', 'concat-css', 'images', 'fileIncludes']);   
    } else if(argv.production) {
        gulp.start([ 'html', 'sass-production', 'js-production', 'concat-js', 'concat-css', 'images', 'fileIncludes']);   
    } else {
        throw new gulpUtil.PluginError({
            plugin: 'build',
            message: '--dev or --production flag is required!'
        });
    }
});

/**
 * Runs static server
 */
gulp.task('browserSync', function() {  
    browserSync.init(["dist/**/*"], {
        server: {
            baseDir: "./dist/"
        }
    });
});

/**
 * Watches for changes in src sass, js, and html files then compiles
 */
gulp.task('watch', ['browserSync'], function() {
    gulp.watch('src/scss/*.scss', ['sass-dev']);
    gulp.watch('src/js/*.js', ['js']);
    gulp.watch('src/**/*.html', ['html']);
});
