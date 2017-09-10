var gulp         = require("gulp"),
    sass         = require("gulp-sass"),
    autoprefixer = require("gulp-autoprefixer"),
    hash         = require("gulp-hash"),
    del          = require("del"),
    responsive   = require('gulp-responsive')

// Compile SCSS files to CSS. copy over static css
gulp.task("scss", function () {
    //clear output files
    del(["static/css/**/*"])
    //process scss files
    gulp.src("src/scss/**/*.scss")
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

//create images in different resolutions
gulp.task("resize_images", function() {
    del(["static/resized_images/**/*"])
    var stream = gulp.src('src/images/**/*.jpg')
      .pipe(responsive({
        // Resize all JPG images to three different sizes: 200, 500, and 630 pixels
        '**/*.jpg': [{
          width: 200,
          rename: { suffix: '-200px' },
        }, {
          width: 500,
          rename: { suffix: '-500px' },
        }, {
          width: 630,
          rename: { suffix: '-630px' },
        }, {
          // Compress, strip metadata, and rename original image
          rename: { suffix: '-original' },
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
      .pipe(gulp.dest('static/resized_images'))
    //causes this task to signal for the next task (images) to start (ie. run sequentially)
    return stream 
})

// Hash images
gulp.task("images", ["resize_images"], function () {
    del(["static/images/**/*"])
    gulp.src("static/resized_images/**/*")
        .pipe(hash())
        .pipe(gulp.dest("static/images"))
        .pipe(hash.manifest("hash.json"))
        .pipe(gulp.dest("data/images"))
})

// Hash javascript
gulp.task("js", function () {
    del(["static/js/**/*"])
    gulp.src("src/js/**/*")
        .pipe(hash())
        .pipe(gulp.dest("static/js"))
        .pipe(hash.manifest("hash.json"))
        .pipe(gulp.dest("data/js"))
})

// Watch asset folder for changes
gulp.task("watch", ["scss", "resize_images", "images", "js"], function () {
    gulp.watch("src/scss/**/*", ["scss"])
    gulp.watch("src/images/**/*", ["resize_images", "images"])
    gulp.watch("src/js/**/*", ["js"])
})

gulp.task("default", ["watch"])
