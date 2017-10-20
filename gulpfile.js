var gulp         = require("gulp"),
    sass         = require("gulp-sass"),
    autoprefixer = require("gulp-autoprefixer"),
    hash         = require("gulp-hash"),
    del          = require("del"),
    responsive   = require('gulp-responsive'),
    runSequence = require('run-sequence')

// Compile SCSS files to CSS
gulp.task("scss", function () {
    del(["static/css/**/*", "!static/css"])
    gulp.src(["src/scss/**/*.scss","src/css/*.css"])
        .pipe(sass({outputStyle : "compressed"}))
        .pipe(autoprefixer({browsers : ["last 20 versions"]}))
        .pipe(hash())
        .pipe(gulp.dest("static/css"))
        //Create a hash map
        .pipe(hash.manifest("hash.json"))
        //Put the map in the data directory
        .pipe(gulp.dest("data/css"))
    //copy across static css files
    gulp.src("src/css/**/*")
        .pipe(gulp.dest("static/css"))
})

gulp.task("del_resize_images", function() {
  return del(["src/resize_images/**/*", "!src/resize_images"])
})

//create images in different resolutions
gulp.task("resize_images", function() {
  return gulp.src('src/images/**/*.jpg')
    .pipe(responsive({
      '**/*.jpg': [{
        width: 450,
        rename: { suffix: '-450px' }
      }, {
        width: 768,
        rename: { suffix: '-768px' }
      }, {
        width: 1024,
        rename: { suffix: '-1024px' }
      }, {
        width: 1940
      }],
    }, {
      // Global configuration for all images
      // The output quality for JPEG, WebP and TIFF output formats
      quality: 70,
      // Use progressive (interlace) scan for JPEG and PNG output
      progressive: true,
      // Strip all metadata
      withMetadata: false,
    }))
    .pipe(gulp.dest('src/resize_images'))
})

gulp.task("del_images", function() {
  return del(["static/images/**/*", "!static/images"])
})

gulp.task("images", function() {
  return gulp.src("src/resize_images/**/*")
      .pipe(hash())
      .pipe(gulp.dest("static/images"))
      .pipe(hash.manifest("hash.json"))
      .pipe(gulp.dest("data/images"))
})

// Hash javascript
gulp.task("js", function () {
    del(["static/js/**/*", "!static/js"])
    gulp.src("src/js/**/*")
        .pipe(hash())
        .pipe(gulp.dest("static/js"))
        .pipe(hash.manifest("hash.json"))
        .pipe(gulp.dest("data/js"))
})

gulp.task("init", function() {
  runSequence(["scss", "js"], "resize_images", "images")
})

// Watch asset folder for changes
gulp.task("watch", ["init"], function () {
    gulp.watch("src/scss/**/*", ["scss"])
    gulp.watch("src/images/**/*", function(){ runSequence("del_resize_images", "resize_images", "del_images", "images")} )
    gulp.watch("src/js/**/*", ["js"])
})

gulp.task("default", ["watch"])
