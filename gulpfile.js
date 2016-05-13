'use strict'

const gulp = require('gulp'),
    del = require('del'),
    colors = require('colors/safe'),
    plumber = require('gulp-plumber'),
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
const logError = (err) => {
    console.log(' ')
    console.log(colors.yellow.underline(`PLUGIN: ${err.plugin}`))
    console.log(colors.red(`ERROR: ${err.message}`))
    console.log(' ')
}
// ----------------- //


//CLEAN
gulp.task('clean', () =>  {
    return del.sync([paths.build], function(err, paths){
              console.log('Deleted files/folders:\n', paths.join('\n'))
            })
})
// ----------------- //


// LESS COMPILERS && AUTOPREFIXING
gulp.task('styles', () => {
    return gulp
            .src(`${paths.src}/LESS/master.less`)
            .pipe(plumber(
                function (err) {
                    logError(err)
                    this.emit('end')
                }
            ))
            .pipe(maps.init())
            .pipe(less())
            .pipe(autoprefixer('last 2 versions', '> 1%', 'ie 10'))
            .pipe(cleanCSS())
            .pipe(maps.write('./'))
            .pipe(gulp.dest(`${paths.build}/css/`))
            .pipe(browserSync.stream())
})
// ----------------- //


// STATIC ASSETS
gulp.task('html', () =>  {
    return gulp.src(`${paths.src}/**/*.html`).pipe(gulp.dest(paths.build))
})
gulp.task('img', () =>  {
    return gulp.src(`${paths.src}/img/**/*`).pipe(gulp.dest(`${paths.build}/img`))
})
gulp.task('fonts', () =>  {
    return gulp.src(`${paths.src}/fonts/*`).pipe(gulp.dest(`${paths.build}/fonts`))
})
gulp.task('static', () =>  {
    return gulp.start(['html', 'img', 'fonts'])
})
// ----------------- //


// JS COMPILE
gulp.task('lint', () =>  {
    return gulp.src(js.app)
            .pipe(eslint())
            .pipe(eslint.formatEach('compact', process.stderr))
            .pipe(eslint.results(results => {
                if (results.warningCount == 0 && results.errorCount == 0) {
                    console.log(colors.green('Eslint test passed! No errors in JS :)'))
                }
            }))
})
gulp.task('js-libraries', () =>  {
    return gulp.src(js.libraries)
            .pipe(concat('libraries.js'))
            .pipe(uglify())
            .pipe(gulp.dest(`${paths.build}/js`))
})
gulp.task('js-app', ['lint'], () =>  {
    return gulp.src(js.app)
    .pipe(plumber(
        function (err) {
            logError(err)
            this.emit('end')
        }
    ))
            .pipe(maps.init())
            .pipe(babel({presets: ['es2015']}))
            .pipe(concat('app.js'))
            .pipe(uglify())
            .pipe(maps.write('./'))
            .pipe(gulp.dest(`${paths.build}/js/`))
})
gulp.task('js', () =>  {
    return gulp.start(['js-libraries', 'js-app'])
})
// ----------------- //


// WATCHERS
gulp.task('watchFiles', () => {
    gulp.watch(`${paths.src}/LESS/**/*.less`, ['styles'])
    gulp.watch(`${paths.src}/**/*.js`, ['js-app'])
    gulp.watch(`${paths.src}/**/*.html`, ['html'])
    gulp.watch(`${paths.src}/**/*.jpg`, ['img'])
    gulp.watch(`${paths.src}/**/*.png`, ['img'])
    gulp.watch(`${paths.src}/**/*.svg`, ['img'])
})


gulp.task('watch', ['watchFiles'])
// ----------------- //


// STATIC SERVER && HOT RELOAD
gulp.task('serve', () => {
    browserSync.init({
        server: {
            baseDir: `./${paths.build}`
        }
    })
    gulp.watch(`${paths.build}/*.html`).on('change', browserSync.reload)
    gulp.watch(`${paths.build}/img/**/*`).on('change', browserSync.reload)
    gulp.watch(`${paths.build}/css/*.css`).on('change', browserSync.reload)
    gulp.watch(`${paths.build}/js/*.js`).on('change', browserSync.reload)
})
// ----------------- //


//DEFAULT task
gulp.task('default', () => {
    gulp.start(['clean', 'static', 'js', 'styles'])
})
