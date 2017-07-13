$(function() {
    // init barba.js
    Barba.Pjax.start();

	var FadeTransition = Barba.BaseTransition.extend({
	start: function() {
		/**
		 * This function is automatically called as soon the Transition starts
		 * this.newContainerLoading is a Promise for the loading of the new container
		 * (Barba.js also comes with an handy Promise polyfill!)
		 */

		// As soon the loading is finished and the old page is faded out, let's fade the new page
		Promise
			.all([this.newContainerLoading, this.fadeOut()])
			.then(this.fadeIn.bind(this));
		},

		fadeOut: function() {
		/**
		 * this.oldContainer is the HTMLElement of the old Container
		 */
             $('#loader').css('visibility', 'visible').animate({ opacity: 1 });

			return $(this.oldContainer).animate({ opacity: 0 }).promise();
		},

		fadeIn: function() {
		/**
		 * this.newContainer is the HTMLElement of the new Container
		 * At this stage newContainer is on the DOM (inside our #barba-container and with visibility: hidden)
		 * Please note, newContainer is available just after newContainerLoading is resolved!
		 */

			var _this = this;
			var $el = $(this.newContainer);

			$(this.oldContainer).hide();

			$el.css({
				visibility : 'visible',
				opacity : 0
			});

			$el.animate({ opacity: 1 }, 400, function() {
				/**
				* Do not forget to call .done() as soon your transition is finished!
				* .done() will automatically remove from the DOM the old Container
				*/
                $('#loader').animate({ opacity: 0 }, 400, function() {
                    $('#loader').css('visibility', 'hidden');
                });

				_this.done();
			});
		}
	});

	/**
	* Next step, you have to tell Barba to use the new Transition
	*/

	Barba.Pjax.getTransition = function() {
	/**
	* Here you can use your own logic!
	* For example you can use different Transition based on the current page or link...
	*/

	return FadeTransition;
	};

    $('#menu li').has('ul').prepend('<span class="dropdown-toggle"></span>');

    // Navigation js
    $('.dropdown-toggle').on('click', function(e){
        e.preventDefault();

        $(this).parent().siblings().removeClass('show').find('ul').slideUp().find('li').removeClass('show');

        if($(this).parent().find('ul').first().is(':visible')) {
            $(this).parent().find('ul').first().slideUp();
            $(this).parent('li').removeClass('show');
        } else {
            $(this).parent().find('ul').first().slideDown();
            $(this).parent('li').addClass('show');
        }
    })

    // Overlay js
    $('#wrapper').before('<div id="overlay" class="overlay"></div>');

    sizeOverlay();

    $(window).resize(function(){
        $('#overlay').css({
            'width' : $('html').width(),
            'height' : $('html').height()
        });
    });


    $('#learn-nav').hover(
        function(){
            $('#overlay').stop().fadeIn('fast');
            $('#content-wrapper').addClass('active-overlay');
            $('html, body').addClass('no-scroll');
        },
        function() {
            $('#overlay').stop().fadeOut('fast');
            $('#content-wrapper').removeClass('active-overlay');
            $('html, body').removeClass('no-scroll');
        }
    );

    // Feature load in
    if($('body').width() > 992) {
        var delayTime = 0;

        $('.feature').css('opacity', 0);

        $('.feature').each(function(e){

            var currentFeature = $(this);

            addAnimation(currentFeature, delayTime);

            delayTime = delayTime + 80;
        });
    }

});

function addAnimation(currentFeature, delayTime) {
    currentFeature.delay(delayTime).queue(function() {
        currentFeature.addClass('animated fadeInUp');
    });
}

function sizeOverlay() {
    $('#overlay').css({
        'width' : $('html').width(),
        'height' : $('html').height()
    });
}
