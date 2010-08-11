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
		self.cursorIsOverVolumeSet = false;
		self.audioVolumeSetIsAnimated = false;
		
		self.createControl = function (k) {
			$('#jamli-controls').append($('<span></span>').addClass('control ' + k).bind('click', function () {
				try {
					self['on' + k]($(this));
				} 
				catch(e) {
					throw 'on' + k + ' is not a valid callback function';
				}
			}));
		};
		
		self.getVolumeClass = function () {
			return (self.media.volume < 0.5) ? 'audioVolumeLow' : 'audioVolumeHigh';
		};
		

		/* Control callbacks wrappers */
		self.onaudioVolumeLow = self.onaudioVolumeHigh = function (control) {
			self.onaudioVolume(control);
		};
		
		self.onaudioVolumeSet = function (control) {
			self.media.volume = parseInt(control.attr('rel'), 10) / 10;
			
			self.media.muted = (self.media.volume === 0) ? true : false;

			$('.audioVolumeSet').removeClass('audioVolumeSetLower').each(function () {
				if (parseInt($(this).attr('rel'), 10) <= Math.round(self.media.volume * 10)) {
					$(this).addClass('audioVolumeSetLower');
				}
			});
			
			var volumeClasses = 'control volumeController ' + ((self.media.muted === true) ? 'audioVolumeMuted' : self.getVolumeClass());
			
			$('.volumeController').attr('class', volumeClasses);
		};
		
		
		self.onaudioVolume = function (control) {
			self.media.muted = !self.media.muted;

			var volumeClasses = 'control volumeController ' + ((self.media.muted === true) ? 'audioVolumeMuted' : self.getVolumeClass());
			
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
		
		self.onviewFullscreen = function (control) {
			
			self.fullscreen = !self.fullscreen;

			if(self.fullscreen === true) {
				self.oldDimension = {
					h: self.media.videoHeight, 
					w: self.media.videoWidth
				};
				
				self.media.height = window.innerHeight;
				self.media.width = window.innerWidth;
				
				$(selector).css({
					'position':'absolute', 
					'top': 0, 
					'left': 0
				});
			} 
			else {
				$(selector).css({
					'position':'relative', 
					'top': 0, 
					'left': 0
				});	
				self.media.height = self.oldDimension.h;
				self.media.width =self.oldDimension.w;
			}
			

		};
		
		self.showVolumeSet = function() {
			self.audioVolumeSetIsAnimated = true;
			
			if(self.cursorIsOverVolumeSet === false) {
				$('#audioVolumeSet').hide("slow", function () {
					self.audioVolumeSetIsAnimated = false;
				});
			}
		};
				
		
		self.registerControls = (function () {

			$(selector).after('<div id="jamli-controls"></div>');

			self.createControl('mediaPlaybackStart');
			self.createControl('mediaPlaybackStop');
			self.createControl(self.getVolumeClass());
			self.createControl('viewFullscreen');
			
			for (var i=0; i <= 10; i++) {
				self.createControl('audioVolumeSet');
				$('.audioVolumeSet:last').attr('rel', i);
			}
			
			$('.audioVolumeSet').wrapAll('<div id="audioVolumeSet" />');
			
			$('#audioVolumeSet').hover(function () { 
				self.cursorIsOverVolumeSet = true;
			}, function () {
				self.cursorIsOverVolumeSet = false;
				
				setTimeout(self.showVolumeSet, 300);
			});

			$('.audioVolumeHigh, .audioVolumeLow').addClass('volumeController').hover(function () {
				$('#audioVolumeSet').show("fast", function () {
					self.audioVolumeSetIsAnimated = false;
				});
			}, function () {
				
				if (self.audioVolumeSetIsAnimated === true) {
					return true;
				}
				
				setTimeout(self.showVolumeSet, 300);

			});
			
			
			$('.control').hover(function () {
				$(this).css({'opacity' : 1});
			}, function () {
				$(this).css({'opacity' : 0.7});
			});
			
			$('.audioVolumeSet:nth-child(8n)').trigger('click');
			
			return true;
		}());
		
		
		return self;
	};

}(window, document, jQuery));



jQuery(document).ready(function () {
	window.videoElement = window.JaMLi('#myVideo');
});