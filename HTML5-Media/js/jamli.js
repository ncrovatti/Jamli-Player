/*jslint plusplus: false, white: true, browser: true, devel: true, forin: true, onevar: true, undef: true, nomen: true, eqeqeq: true, bitwise: true, newcap: true, immed: true, strict: true */
/*global window,jQuery */

/* Usage: 
 * 
 * window.Video1 = JaMLi('video tag selector');
 * */

"use strict";

(function (window, document, $) {

	window.JaMLi = window.JaMLi || function (selector) {
		var self = {};
		
		self.media = $(selector)[0];
		
		self.createControl = function (k) {
			$('#jamli-controls').append($('<span></span>').addClass(k + ' control').bind('click', function () {
				self['on' + k]($(this));
			}));
		};
		
		self.getVolumeClass = function () {
			return (self.media.volume < 0.5) ? 'audioVolumeLow' : 'audioVolumeHigh';
		};
		
		self.registerControls = (function () {
			$(selector).after('<div id="jamli-controls"></div>');
			
			$('#jamli-controls').css({
				'width' : self.media.videoWidth + 'px',
				'border': '1px solid black'
			});
			
			self.createControl('mediaPlaybackStart');
			self.createControl('mediaPlaybackStop');
			self.createControl(self.getVolumeClass());
			
			$('.control').hover(function () {
				$(this).css({'opacity' : 0.7});
			}, function () {
				$(this).css({'opacity' : 1});
			});
			
			return true;
		}());
		
		
		
		self.displayVolumeControl = function () {
				
		};
		
		
		/* Control callbacks wrappers */
		
		self.onaudioVolumeLow = self.onaudioVolumeHigh = function (control) {
			self.onaudioVolume(control);
		};
		
		self.onaudioVolume = function (control) {
			self.media.muted = !self.media.muted;

			var volumeClasses = 'control ' + ((self.media.muted === true) ? 'audioVolumeMuted' : self.getVolumeClass());
			
			control.attr('class', volumeClasses);
		};
		
		self.onmediaPlaybackPause = function (control) {
			
			self.media.pause();
			
			control.removeClass('mediaPlaybackPause').addClass('mediaPlaybackStart').
				bind('click', function () {
					self.onmediaPlaybackStart($(this));
				});
			
			
			return true;
		};
		
		self.onmediaPlaybackStart = function (control) {
			
			self.media.play();
			
			control.removeClass('mediaPlaybackStart').addClass('mediaPlaybackPause').
				bind('click', function () {
					self.onmediaPlaybackPause($(this));
				});
				
			
			return true;
		};
		
		self.onmediaPlaybackStop = function (control) {
			self.media.pause();
			self.media.currentTime = 0;
			
			$('.mediaPlaybackPause').
				removeClass('mediaPlaybackPause').addClass('mediaPlaybackStart').
				bind('click', function () {
					self.onmediaPlaybackStart($(this));
				});
			
			
			return true;
		}; 
		
		
		return self;
	};

}(window, document, jQuery));



$(document).ready(function () {
	window.videoElement = JaMLi('#myVideo');
});