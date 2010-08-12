/* 
 * JaMLi - the lightweight Javascript Media Library v0.1
 * https://code.google.com/p/html5-media/
 * 
 * 
 * Copyright (c) 2010 Nicolas Crovatti
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
 * Usage: 
 * 
 * window.Video1 = JaMLi('video tag selector');
 * */

/*jslint plusplus: false, white: true, browser: true, devel: true, forin: true, onevar: true, undef: true, nomen: true, eqeqeq: true, bitwise: true, newcap: true, immed: true, strict: true */
/*global window, document, jQuery */

       
"use strict";

(function (window, document, $) {

	window.JaMLi = window.JaMLi || function (selector) {
		var self = {};
		
		self.media = $(selector)[0];
		self.fullscreen = false;
		self.isCursorOverVolumeSet = false;
		self.audioVolumeSetIsAnimated = false;
		
		self.createControl = function (k) {
			$('#jamli-controls').append($('<span></span>').addClass('control ' + k).bind('click', function () {
				try {
					self['on' + k]($(this));
				} 
				catch (e) {
					throw 'on' + k + ' is not a valid callback function';
				}
			}));
		};
		
		self.getVolumeClass = function () {
			return (self.media.volume <= 0.3) ? 'audioVolumeLow' : (self.media.volume <= 0.6) ? 'audioVolumeMid' : 'audioVolumeHigh';
		};
		
		self.getVolumeClasses = function () {
			return 'control volumeController ' + ((self.media.muted === true) ? 'audioVolumeMuted' : self.getVolumeClass());
		};

		/* Control callbacks wrappers */
		self.onaudioVolumeLow = self.onaudioVolumeMid = self.onaudioVolumeHigh = function (control) {
			self.onaudioVolume(control);
		};
		
		self.onaudioVolumeSet = function (control) {
			self.media.volume = parseInt(control.attr('rel'), 10) / 10;

			$('.audioVolumeSet').removeClass('audioVolumeSetLower').each(function () {
				if (parseInt($(this).attr('rel'), 10) <= Math.round(self.media.volume * 10)) {
					$(this).addClass('audioVolumeSetLower');
				}
			});
			
			$('.volumeController').attr('class', self.getVolumeClasses());
		};
		
		
		self.onaudioVolume = function (control) {
			self.media.muted = !self.media.muted;
			control.attr('class', self.getVolumeClasses());
		};
		
		self.onmediaPlaybackPause = function (control) {
			
			self.media.pause();
			
			control.removeClass('mediaPlaybackPause').addClass('mediaPlaybackStart').unbind().
				bind('click', function () {
					self.onmediaPlaybackStart($(this));
				});
			
			
			return true;
		};
		
		self.onmediaPlaybackStart = function (control) {
			
			self.media.play();
			
			control.removeClass('mediaPlaybackStart').addClass('mediaPlaybackPause').unbind().
				bind('click', function () {
					self.onmediaPlaybackPause($(this));
				});
				
			
			return true;
		};
		
		self.onmediaPlaybackStop = function (control) {
			self.media.pause();
			self.media.currentTime = 0;
			
			$('.mediaPlaybackPause').unbind().
				removeClass('mediaPlaybackPause').addClass('mediaPlaybackStart').
				bind('click', function () {
					self.onmediaPlaybackStart($(this));
				});
			
			
			return true;
		}; 
		
		self.onviewFullscreen = function (control) {
			var pos = 'fixed';
			self.fullscreen = !self.fullscreen;

			if (self.fullscreen === true) {
				self.oldDimension = {
					h: self.media.videoHeight, 
					w: self.media.videoWidth
				};
				
				self.media.height = window.innerHeight;
				self.media.width = window.innerWidth;
			} 
			else {
				pos = 'relative';
				self.media.height = self.oldDimension.h;
				self.media.width = self.oldDimension.w;
			}

			$(selector).css({
				'position' : pos, 
				'top' : 0, 
				'left' : 0
			});

		};
		
		self.showVolumeSet = function () {
			self.audioVolumeSetIsAnimated = true;
			
			if (self.isCursorOverVolumeSet === false) {
				$('#audioVolumeSet').hide("slow", function () {
					self.audioVolumeSetIsAnimated = false;
				});
			}
		};
		

		self.updateSeekBar = function () {
			self.isUpdatingSeekBar = true;
			/*
			$('.mediaCurrentPosition').animate({width: [self.media.currentTime/self.media.duration * 100 + '%', 'linear']}, 200, function() {
				self.isUpdatingSeekBar = false;
			});*/

			$('.mediaCurrentPosition').css({'width' : self.media.currentTime/self.media.duration * 100 + '%'});
			self.isUpdatingSeekBar = false; 
		};
		
		self.registerControls = (function () {

			$(selector).after('<div id="jamli-controls"></div>');

			self.createControl('mediaPlaybackStart');
			self.createControl('mediaPlaybackStop');
			self.createControl(self.getVolumeClass());
			self.createControl('viewFullscreen');
			
			for (var i = 0; i <= 10; i++) {
				self.createControl('audioVolumeSet');
				$('.audioVolumeSet:last').attr('rel', i);
			}
			
			$('.audioVolumeSet').wrapAll('<div id="audioVolumeSet"/>');
			
			$('#audioVolumeSet').hover(function () { 
				self.isCursorOverVolumeSet = true;
			}, 
			function () {
				self.isCursorOverVolumeSet = false;
				setTimeout(self.showVolumeSet, 500);
			});

			$('.audioVolumeHigh, .audioVolumeMid, .audioVolumeLow').addClass('volumeController').hover(function () {
				$('#audioVolumeSet').show("fast", function () {
					self.audioVolumeSetIsAnimated = false;
				});
			}, 
			function () {
				if (self.audioVolumeSetIsAnimated === true) {
					return true;
				}
				
				setTimeout(self.showVolumeSet, 500);
			});
			
			
			$('.control').hover(function () {
				$(this).css({'opacity' : 1});
			}, function () {
				$(this).css({'opacity' : 0.7});
			});
			
			$('.audioVolumeSet:nth-child(8n)').trigger('click');
			
			$('#jamli-controls').before('<div class="mediaSeekBarCenter"><div class="mediaCurrentPosition"/></div>');
			
			setInterval(function () {
				if (self.isUpdatingSeekBar || self.media.paused === true) {
					return false;
				}
				self.updateSeekBar();
			}, 10);
			
			
			return true;
		}());
		
		
		return self;
	};

}(window, document, jQuery));



jQuery(document).ready(function () {
	window.videoElement = window.JaMLi('#myVideo');
});