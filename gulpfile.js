'use strict'

// SYSTEM PLUGINS
const
    gulp = require('gulp'),
    del = require('del'),
    browserSync = require('browser-sync').create(),
    colors = require('colors/safe'),

// WORKFLOW PUGINS
    plumber = require('gulp-plumber'),
    concat = require('gulp-concat'),
    babel = require('gulp-babel'),
    eslint = require('gulp-eslint'),
    less = require('gulp-less'),
    autoprefixer = require('gulp-autoprefixer'),
    cleanCSS = require('gulp-clean-css'),
    uglify = require('gulp-uglify'),
    maps = require('gulp-sourcemaps'),
    cssBase64 = require('gulp-css-base64')


// PATHS TO MODULES AND SRC
const paths = {
    src: 'src',
    build: 'build',
    node: 'node_modules'
}
// ----------------- //


// PATHS TO JS FILES AND LIBRARIES
const js = {
    app: `${paths.src}/js/app.js`,
    libraries: `${paths.node}/jquery/dist/jquery.js`
}
// ----------------- //


//ERRORS HANDLING AND LOGGING TO CONSOLE
const logError = (err) => {
    console.log(' ')
    console.log(colors.yellow.underline(`PLUGIN: ${err.plugin}`))
    console.log(colors.red(`ERROR: ${err.message}`))
    console.log(' ')
}
// ----------------- //


//CLEAN BUILD FOLDER
gulp.task('clean', () =>  {
    return del.sync([paths.build], function(err, paths){
              console.log('Deleted files/folders:\n', paths.join('\n'))
            })
})
// ----------------- //


// LESS COMPILING && AUTOPREFIXING && INLINING SMALL IMAGES
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
            .pipe(cssBase64({
                baseDir: `${paths.src}`
            }))
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


// JS BABEL TRANSPILING && LINTING && COMPILING
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
            .pipe(babel({ presets: ['es2015', 'stage-0'] }))
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
    gulp.watch(`${paths.src}/**/*.{jpg, jpeg, gif, png, svg}`, ['img'])
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
    gulp.watch(`${paths.build}/**/*`).on('change', browserSync.reload)
})
// ----------------- //


//DEFAULT task
gulp.task('default', () => {
    gulp.start(['clean', 'static', 'js', 'styles'])
})
