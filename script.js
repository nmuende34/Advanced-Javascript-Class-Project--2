// Start of jQuery carousel plugin.
(function($) {


  // Function to execute a callback when an image has been loaded,
  // either from the network, or from the browser cache.

  var loadImage = function ($image, src, callback) {

    // Bind the load event BEFORE setting the src.
    $image.bind("load", function (evt) {
      // If no valid width, image hasn't actually loaded.
      if ($image.width() === 0) {
        alert('zero');
        return;
      }
      // Image has loaded, so unbind event and call callback.
      $image.unbind("load");
      callback($image);

    }).each(function () {
      // For Gecko based browsers, check the complete property,
      // and trigger the event manually if image loaded.
      if ($image[0].complete) {
        $image.trigger("load");
      }
    });
    $image.attr('src', src );
  };

  // Create a single carousel item.
  var createItem = function ($image, angle, options) {
    var loaded = false, // Flag to indicate image has loaded.
    orgWidth,       // Original, unscaled width of image.
    orgHeight,      // Original, unscaled height of image.
    $originDiv,     // Image is attached to this div.

    // A range used in the scale calculation to ensure
    // the front-most item has a scale of 1,
    // and the furthest most item has a scale as defined
    // in options.minScale.
    sizeRange = (1 - options.minScale) * 0.5,

    // An object to store the public update function.
    that;

    // Make image invisible and
    // set its positioning to absolute.
    $image.css({
      opacity: 0,
      position: 'absolute'
    });
    // Create a div element ($originDiv). The image
    // will be attached to it.
    $originDiv = $image.wrap('<div style="position:absolute;">').parent();

    that = {
      update: function (ang) {
        var sinVal, scale, x, y;

        // Rotate the item.
        ang += angle;

        // Calculate scale.
        sinVal = Math.sin(ang);
        scale = ((sinVal + 1) * sizeRange) + options.minScale;

        // Calculate position and zIndex of origin div.
        x = ((Math.cos(ang) * options.radiusX) * scale) + options.width / 2;
        y = ((sinVal * options.radiusY) * scale) + options.height / 2;
        $originDiv.css({
          left: (x >> 0) + 'px',
          top: (y >> 0) + 'px',
          zIndex: (scale * 100) >> 0
        });
        // If image has loaded, update its dimensions according to
        // the calculated scale.
        // Position it relative to the origin div, so the
        // origin div is in the center.
        if (loaded) {
          $image.css({
            width: (orgWidth * scale) + 'px',
            height: (orgHeight * scale) + 'px',
            top: ((-orgHeight * scale) / 2) + 'px',
            left: ((-orgWidth * scale) / 2) + 'px'
          });
        }
      }
    };

    // Load the image and set the callback function.
    loadImage($image, $image.attr('src'), function ($image) {
      loaded = true;
      // Save the image width and height for the scaling calculations.
      orgWidth = $image.width();
      orgHeight = $image.height();
      // Make the item fade-in.
      $image.animate({
        opacity: 1
      }, 1000);

    });
    return that;
  };
  // Create a carousel.
  var createCarousel = function ($wrap, options) {
    var items = [],
    rot = 0,
    pause = false,
    unpauseTimeout = 0,
    // Now calculate the amount to rotate per frameRate tick.
    rotAmount = ( Math.PI * 2) * (options.frameRate/options.rotRate),
    $images = $('img', $wrap),
    // Calculate the angular spacing between items.
    spacing = (Math.PI / $images.length) * 2,
    // This is the angle of the 1st item at
    // the front of the carousel.
    angle = Math.PI / 2,
    i;

    // Create a function which is called when the mouse moves over
    // or out of an item.
    $wrap.bind('mouseover mouseout', function (evt) {
      // Has the event been triggered on an image? Return if not.
      if (!$(evt.target).is('img')) {
        return;
      }

      // If mouseover, then pause the carousel.
      if (evt.type === 'mouseover') {
        // Stop the unpause timeout if it's running.
        clearTimeout(unpauseTimeout);
        // Indicate carousel is paused.
        pause = true;
      } else {
        // If mouseout, restart carousel, but after a small
        // delay to avoid jerking movements as the mouse moves
        // between items.
        unpauseTimeout = setTimeout(function () {
          pause = false;
        }, 200);
      }

    });

    // This loop runs through the list of images and creates
    // a carousel item for each one.
    for (i = 0; i < $images.length; i++) {
      var image = $images[i];
      var item = createItem($(image), angle, options);
      items.push(item);
      angle += spacing;
    }

    // The setInterval will rotated move all items in the carousel
    // every 30Ms, unless the carousel is paused.
    setInterval(function () {
      if (!pause) {
        rot += rotAmount;
      }
      for (i = 0; i < items.length; i++) {
        items[i].update(rot);
      }
    }, options.frameRate);
  };



  // This is the jQuery plugin part. It iterates through
  // the list of DOM elements that wrap groups of images.
  // These groups of images are turned into carousels.
  $.fn.Carousel = function(options) {
    this.each( function() {
      // User options are merged with default options.
      options = $.extend({}, $.fn.Carousel.defaults, options);
      // Each wrapping element is given relative positioning
      // (so the absolute positioning of the carousel items works),
      // and the width and height are set as specified in the options.
      $(this).css({
        position:'relative',
        width: options.width+'px',
        height: options.height +'px'
      });
      createCarousel($(this),options);
    });
  };

  // These are the default options.
  $.fn.Carousel.defaults = {
    radiusX:230,   // Horizontal radius.
    radiusY:80,    // Vertical radius.
    width:512,     // Width of wrapping element.
    height:300,    // Height of wrapping element.
    frameRate: 30,  // Frame rate in milliseconds.
    rotRate: 5000, // Time it takes for carousel to make one complete rotation.
    minScale:0.60 // This is the smallest scale applied to the furthest item.
  };

})(jQuery);
// End of jQuery carousel plugin.
