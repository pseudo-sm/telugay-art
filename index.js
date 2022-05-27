var  DF = DF || {};

(function() {
    'use strict';


    // DOM
    var $Window = $(window);

    var ANIM_TIME = 1250;

    // CONSTANTS
    var IS_HIDDEN = 'is-hidden';

    var KEYS = {
        'up': 38,
        'down': 40,
        'left': 37,
        'right': 39
    };

    // VARIABLES
    var vh = $Window.height(),
        vw = $Window.width(),
        scrollDirectionNext,
        slideTimer;




    /****************************
     *
     *  Slider Constructor
     *
     ******************************/
    DF.SlidePage = function(context, options) {

       var context = context || document;
       var options = options || {};

        this.opts = {
            ON_STAGE: 'on-stage',
            sliderTime: 0,
            selector: '.slide',
            paginationSelector: ''
        };


        $.extend(this.opts, options);

        this.context = context;
        this.slides = $(this.opts.selector, context);
        this.slideLength = this.slides.length;
        this.scrollDirectionNext = true;
        this.sidenavLinks = [];

        this.init();
    };

    DF.SlidePage.prototype = {

        constructor: DF.SlidePage,

        sliderTimeoutChange: function(sliderTime) {

            var self = this;

            if (sliderTime) {
                slideTimer = setInterval(function() {
                    self.changeSlides(true);
                }, sliderTime);
            } else {
                clearInterval(slideTimer);
            }
        },

        bindListeners: function() {

            var self = this;
            var $Window = $(window);


            $Window.bind('keyup', function(e) {
                var key = e.keyCode;

                if (DF.canScroll) {

                    switch (key) {
                        case KEYS.up:
                        case KEYS.left:
                            self.changeSlides(false);
                            break;
                        case KEYS.down:
                        case KEYS.right:
                            self.changeSlides(true);
                            break;
                    }
                    self.sliderTimeoutChange();
                }
            });


            $Window.bind('DOMMouseScroll mousewheel wheel', function(e) {
                e.preventDefault();
                var delta = parseInt(e.originalEvent.deltaY || e.originalEvent.detail);
                self.handleScroll(delta);

            });

            $('.btn-next').bind('click',function () {
                 if (DF.canScroll) self.changeSlides(true);
            });

             $('.btn-prev').bind('click',function () {
                 if (DF.canScroll) self.changeSlides(false);
            });
        },

        handleScroll: function(delta) {
            var self = this;

            if (DF.canScroll) {

                //Animate slides - play next (directionNext = true) if scrolling is downwards
                self.changeSlides(delta > 0);
                self.sliderTimeoutChange();
            }
        },


        changeSlides: function(directionNext) {

            var self = this;
            self.isAnimating = false;
            self.endCurrPage = false;
            self.endNextPage = false;

            DF.canScroll = false;

            if (self.slideLength && self.slideLength > 1) {

                if (directionNext) {
                    if (self.currSlideIndex < self.slideLength - 1) {
                       self.prevSlideIndex = self.currSlideIndex;
                       self.currSlideIndex++;

                    } else {

                        DF.canScroll = true;
                        return;

                    }

                } else {

                    if (self.currSlideIndex > 0) {
                       
                       self.prevSlideIndex = self.currSlideIndex;
                       self.currSlideIndex--;

                    } else {
                        DF.canScroll = true;
                        return;

                    }
                }

                self.changeSlideByIndex(self.currSlideIndex, directionNext);

            }
        },

        changeSlideByIndex: function(index, directionNext) {

            var self = this;

            DF.canScroll = false;

            // CALL SLIDES CHANGE 
            self.prevSlide = self.currSlide;
            self.currSlide = self.slides.eq(index);


           self.animateSlides(directionNext);

            if(self.sidenavLinks.length){
               self.sidenavLinks.eq(self.prevSlideIndex).removeClass('is-active');
               self.sidenavLinks.eq(self.currSlideIndex).addClass('is-active');
            }

        },

        noAnimateSlides: function() {

            var self = this;

            var elBefore = true;

            this.slides.each(function(i, el) {
                if (el == self.currSlide[0]) {
                    elBefore = false;
                } else {
                    $(el).attr('data-position', elBefore ? 'before' : 'after');
                }
            });

            if (self.prevSlide) self.prevSlide.removeClass('on-stage');

            setTimeout(function() {
                self.currSlide.addClass('on-stage');
                DF.canScroll = true;
            }, ANIM_TIME);
        },

        animateSlides: function(directionNext) {

            var self = this;

           self.prevSlide.removeClass('is-active on-stage');
           self.currSlide.removeClass('is-active').addClass('on-stage');
           setTimeout(function () {
               DF.canScroll = true;
           }, ANIM_TIME);

           var elBefore = true;

           this.slides.each(function(i, el) {
                if (el == self.currSlide[0]) {
                    elBefore = false;
                } else {
                    $(el).attr('data-position', elBefore ? 'before' : 'after');
                }
            });

        },

        handleSidebarClick: function(cLink) {
            var self = this;

            self.sidenavLinks.each(function(i, lnk) {
                if (lnk === cLink && !$(cLink).hasClass('is-active') && DF.canScroll) {

                   self.prevSlideIndex = self.currSlideIndex;
                   self.currSlideIndex = i;
                    self.changeSlideByIndex(i, self.prevSlideIndex < i);
                    return;
                    
                }
            });
        },

        addPagination: function() {
            var self = this;

            var $cont = $(self.opts.paginationSelector);

            if (!$cont.length) {
                return false;
            }

            var el;
            for (var i = 0; i < self.slideLength; i++) {
                if (i === 0) {
                    el = $('<li class="slide-link is-active"></li>');
                } else {
                    el = $('<li class="slide-link"></li>');
                }

                $cont.append(el);
            }

            self.sidenavLinks = $('.slide-link', $cont);

            $cont.on('click', '.slide-link', function(e) {
                e.preventDefault();
                var cLink = e.target;
                self.handleSidebarClick(cLink);
            });

        },

        init: function() {

            var self = this;

            if (self.slideLength) {

                DF.canScroll = true;

                self.currSlideIndex = self.currLink = 0;
                self.prevSlideIndex = undefined;

                self.currSlide = self.slides.eq(self.currSlideIndex).addClass(self.opts.ON_STAGE);

                self.noAnimateSlides();
                self.bindListeners();

                if (this.opts.paginationSelector) {
                    this.addPagination();
                }

            }
        }
    };

    new DF.SlidePage()

})();
