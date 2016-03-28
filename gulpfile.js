'use strict'

const gulp = require('gulp'),
    del = require('del'),
    concat = require('gulp-concat'),
    babel = require('gulp-babel'),
    eslint = require('gulp-eslint'),
    less = require('gulp-less'),
    autoprefixer = require('gulp-autoprefixer'),
    cleanCSS = require('gulp-clean-css'),
    uglify = require('gulp-uglify'),
    maps = require('gulp-sourcemaps'),
    browserSync = require('browser-sync').create()
const paths = {
    src: './src',
    build: './build',
    node: './node_modules'
}
const js = {
    app: `${paths.src}/js/app.js`,
    libraries: `${paths.node}/jquery/dist/jquery.js`
}
// ----------------- //


//CLEAN
gulp.task('clean', function () {
    return del.sync([paths.build], function(err, paths){
              console.log('Deleted files/folders:\n', paths.join('\n'))
            })
})
// ----------------- //


// LESS COMPILERS && AUTOPREFIXING
gulp.task('styles', function() {
    return gulp
            .src(`${paths.src}/LESS/master.less`)
            .pipe(maps.init())
            .pipe(less())
            .on('error', (err) => {
                console.log(`Plugin: ${err.plugin}`)
                console.log(`Error: ${err.message}`)
            })
            .pipe(autoprefixer('last 2 versions', '> 1%', 'ie 10'))
            .pipe(cleanCSS())
            .pipe(maps.write('./'))
            .pipe(gulp.dest(`${paths.build}/css/`))
            .pipe(browserSync.stream())
})
// ----------------- //


// STATIC ASSETS
gulp.task('html', function () {
    return gulp.src(`${paths.src}/**/*.html`).pipe(gulp.dest(paths.build))
})
gulp.task('img', function () {
    return gulp.src(`${paths.src}/img/*`).pipe(gulp.dest(`${paths.build}/img`))
})
gulp.task('fonts', function () {
    return gulp.src(`${paths.src}/fonts/*`).pipe(gulp.dest(`${paths.build}/fonts`))
})
gulp.task('static', function () {
    return gulp.start(['html', 'img', 'fonts'])
})
// ----------------- //


// JS COMPILE
gulp.task('lint', function () {
    return gulp.src(js.app)
            .pipe(eslint())
            .pipe(eslint.format())
            .pipe(eslint.results(function (results) {
                console.log('LINTER RESULTS:');
                console.log('Total Warnings: ' + results.warningCount);
                console.log('Total Errors: ' + results.errorCount);
            }))
})
gulp.task('js-libraries', function () {
    return gulp.src(js.libraries)
            .pipe(concat('libraries.js'))
            .pipe(uglify())
            .pipe(gulp.dest(`${paths.build}/js`))
})
gulp.task('js-app', ['lint'], function () {
    return gulp.src(js.app)
            .pipe(maps.init())
            .pipe(babel({presets: ['es2015']}))
            .on('error', (err) => {
                console.log(`Plugin: ${err.plugin}`)
                console.log(`Error: ${err.message}`)
            })
            .pipe(concat('app.js'))
            .pipe(maps.write('./'))
            .pipe(gulp.dest(`${paths.build}/js/`))
})
gulp.task('js', function () {
    return gulp.start(['js-libraries', 'js-app'])
})
// ----------------- //


// WATCHERS
gulp.task('watchFiles', function() {
    gulp.watch(`${paths.src}/LESS/**/*.less`, ['styles'])
    gulp.watch(`${paths.src}/app/**/*.js`, ['js-app'])
    gulp.watch(`${paths.src}/**/*.html`, ['html'])
})


gulp.task('watch', ['watchFiles'])
// ----------------- //


// STATIC SERVER && HOT RELOAD
gulp.task('serve', function() {
    browserSync.init({
        server: {
            baseDir: `./${paths.build}`
        }
    })
    gulp.watch(`${paths.build}/*.html`).on('change', browserSync.reload)
    gulp.watch(`${paths.build}/css/*.css`).on('change', browserSync.reload)
    gulp.watch(`${paths.build}/js/*.js`).on('change', browserSync.reload)
})
// ----------------- //


//DEFAULT task
gulp.task('default', function() {
    gulp.start(['clean', 'static', 'js', 'styles'])
})
