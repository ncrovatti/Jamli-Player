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
/*global window, document, jQuery, J */

       
"use strict";

(function (window, document, J) {
	window.JaMLi = window.JaMLi || function (selector) {
		var 
			self = {}, 
			$;
		
		self.media = J(selector)[0];
		self.isFullScreen = false;
		self.isCursorOverVolumeSet = false;
		self.isAudioVolumeSetAnimated = false;
		
		// miniQuery
		self.domApi = function () {
			var 
				dom = {},
				speeds = {
					slow : 600,
					fast : 200,
					_default : 400
				};
				
				
			dom.trim = function (text) {
				return (text || "").replace(/^(\s|\u00A0)+|(\s|\u00A0)+$/g, "");
			};
			
			dom.nonEmpty =  function (e, i, a) {
				return (e.length === 0) ? false : true;
			};
			
			dom.inArray = function (el, array) {
				if (array.indexOf) {
					return array.indexOf(el);
				}
		
				for (var i = 0, length = array.length; i < length; i++) {
					if (array[i] === el) {
						return i;
					}
				}
				
				return -1;
			};
		
			dom.setNode = function (node) {
				dom.nodes = node;
				dom.node = node[0] || node;
				dom.node.eventList = dom.node.eventList || [];
				return dom;
			};
			
			dom.bind = function (e, f) {
				if (typeof f !== 'function') {
					return false;
				}
				
				dom.each(function () {
					if (this.node.addEventListener) {
						this.node.addEventListener(e, f, false);
					}
					else if (this.node.attachEvent) {
						this.node.attachEvent("on" + e, f);
					}
					
					this.node.eventList[e] = f;
				});
				
				return dom;
			};
			
			dom.unbind = function (e) {
				dom.each(function () {
					if (typeof this.node.eventList !== "object" || typeof  this.node.eventList[e] !== "object") {
						return false;
					}
					
					var f = this.node.eventList[e];
					
					if (this.node.removeEventListener) {
						this.node.removeEventListener(e, f, false);
					}
					else if (this.node.detachEvent) {
						this.node.detachEvent("on" + e, f);
					}
					
					delete this.node.eventList[e];
				});
				
				return dom;
			};
		
			dom.getById = function (id) {
				return [document.getElementById(id)];	
			};
			
			dom.createNode = function (tagName) {
				return document.createElement(tagName);
			};
			
			dom.append = function (parent, node) {
				parent = parent[0] || parent;
				return parent.appendChild(node);
			};
			
			dom.removeClass = function (classesToRemove) {
				classesToRemove = classesToRemove.split(/\s+/).map(this.trim);
				
				dom.each(function () {
					var 
						i = 0, l = 0,
						classestoKeep = [],
						nodeClasses = this.node.className.split(/\s+/);
						

					
					nodeClasses.map(this.trim);
					
					for (l = nodeClasses.length; i < l; i++) {
						if (this.inArray(nodeClasses[i], classesToRemove) === -1) {
							classestoKeep.push(nodeClasses[i]);
						}
					}
					
					classestoKeep = classestoKeep.map(this.trim).filter(this.nonEmpty);
					this.node.className = classestoKeep.join(' ');
					return true;
				});

				return dom;
			};
			
			dom.addClass = function (classesToAdd) {
				classesToAdd = classesToAdd.split(/\s+/).map(this.trim);
				
				dom.each(function () {
					var
						i = 0, l = 0,
						nodeClasses = this.node.className.split(/\s+/);
											
					

					nodeClasses.map(this.trim);
					
					for (l = nodeClasses.length; i < l; i++) {
						if (this.inArray(nodeClasses[i], classesToAdd) > -1) {
							classesToAdd.shift();
						}
					}
					
					nodeClasses = nodeClasses.concat(classesToAdd).filter(this.nonEmpty);

					this.node.className = nodeClasses.join(' ');
					
				});

				return dom;
			};
			
			dom.getByClassName = function (className, context) {  
				context = context || document;

				var
					classElements = [],
					els = context.all || context.getElementsByTagName("*"),
					elsLen = els.length,
					pattern = new RegExp("(^|\\s)" + className + "(\\s|$)"), 
					i = 0, j = 0;
					
				for (;i < elsLen; i++) {
					if (pattern.test(els[i].className)) {
						classElements[j] = els[i];
						j++;
					}
				}
				
				return classElements;
			};
			
			/* attr() targets a single dom node except when setting a value */
			dom.attr = function (name, value) {
				if (value === undefined) {
					return dom.node.getAttribute(name);
				}
				
				if (value === '') {
					dom.node.removeAttribute(name);
				}
				
				dom.each(function () {
					dom.node.setAttribute(name, value);
				});
				
				return dom;
			};
			
			dom.each = function (callback) {
				var 
					i = 0, l = 0,
					nodes = dom.nodes;

				for (l = nodes.length; i < l; i++) {
					dom.setNode(nodes[i]);
					callback.apply(dom, [nodes[i]]);
				}
				
				// restoring previous node.
				dom.setNode(nodes);
				return dom;
			};
			
			/* Helper */
			/* style() targets a single dom node. */
			dom.style = function (property, value) {
				if (value === undefined) {
					return dom.node.style[property];
				}
				
				dom.node.style[property] = value;
				return dom;	
			};
			
			dom.css = function (rules) {
				dom.each(function () {
					for (var property in rules) {
						this.style(property, rules[property]);
					}
				});
				
				return dom;
			};

			dom.hide = function (speed, callback) {
				var 
					duration = (typeof speed === "number")  ? speed : speeds[speed] || speeds._default,
					stepping = 20;
				
				dom.each(function () {
					var 
						growth = 1 / (duration / stepping),
						step = 0;
						
					if (isNaN(parseFloat(this.style('opacity')))) {
						this.style('opacity', 1);
					}
					else if (parseFloat(this.style('opacity')) === 0) {
						return false;
					}


					(function animate() {
						var currentOpacity = 1 - (growth * step);

						step++;
						
						currentOpacity = (currentOpacity < 0) ? 0 : ((currentOpacity > 1) ? 1 : currentOpacity);

						dom.css({
							'filter' : 'alpha(opacity=' + currentOpacity * 100 + ')',
							'opacity' : currentOpacity,
							'-moz-opacity' : currentOpacity
						});
						
						if (step * stepping >= duration || currentOpacity === 0) {
							dom.css({
								'filter' : 'alpha(opacity=100)',
								'opacity' : 1,
								'-moz-opacity' : 1,
								'display': 'none'
							});
							callback.apply(dom.scope, []);
							return false;
						}

						setTimeout(animate, stepping, arguments[0]);
					}());
				});
				return dom;
			};
			
			dom.show = function (speed, callback) {
				var 
					duration = (typeof speed === "number")  ? speed : speeds[speed] || speeds._default,
					stepping = 20;

				dom.each(function () {
					var 
						growth = 1 / (duration / stepping),
						step = 0;
						
					if (isNaN(parseFloat(this.style('opacity')))) {
						this.style('opacity', 0);
					}
					else if (parseFloat(this.style('opacity')) === 1) {
						this.style('display', 'block');
						return false;
					}
					
					this.style('display', 'block');
					
					(function animate() {
						var currentOpacity = 0 + (growth * step);
						
						step++;
						
						currentOpacity = (currentOpacity < 0) ? 0 : ((currentOpacity > 1) ? 1 : currentOpacity);
						
						dom.css({
							'filter' : 'alpha(opacity=' + currentOpacity * 100 + ')',
							'opacity' : currentOpacity,
							'-moz-opacity' : currentOpacity
						});
						
						if (step * stepping >= duration || currentOpacity === 1) {
							dom.css({
								'filter' : 'alpha(opacity=100)',
								'opacity' : 1,
								'-moz-opacity' : 1,
								'display': 'block'
							});

							callback.apply(dom.scope, []);
							return false;
						}

						setTimeout(animate, stepping, arguments[0]);
					}());
				});
				return dom;
			};
			
			return dom;
		};
		
		self.dom = self.domApi();

		(function () {
			self.$ = $ = function $(node) {
				var 
					dom = self.domApi(), 
					settings = {}, 
					nodes = [];

				dom.scope = $.caller;
				
				if (node.nodeType !== 1) {
					if (node.indexOf('.', 0) > -1) {
						settings.method = 'getByClassName';
						settings.prefix = '.';
					} 
					else if (node.indexOf('#', 0) > -1) {
						settings.method = 'getById';
						settings.prefix = '#';
					}
					else {
						delete settings;	
					}

					if (settings !== undefined) {
						nodes = node.replace(settings.prefix, ' ').split(' ');
						nodes = nodes.map(dom.trim).filter(dom.nonEmpty);
						return dom.setNode(dom[settings.method](nodes.join(' ')));
					}
				} 
				else {
					return dom.setNode([node]);
				}
				
				throw node.toString() + ' is not a valid selector';
			};
		}());
	
		self.createControl = function (k) {
			var control = self.dom.append(self.dom.getById('jamli-controls'), self.dom.createNode('span'));
			
			$(control).addClass('control ' + k).bind('click', function () {
				try {
					self['on' + k](control);
				} 
				catch (e) {
					throw "on" + k + "(" + control + ")  is not a valid callback function (" + e + ")";
				}
			});
		};
		
		
		self.getVolumeClass = function () {
			return (self.media.volume <= 0.3) ? 'audioVolumeLow' : (self.media.volume <= 0.6) ? 'audioVolumeMid' : 'audioVolumeHigh';
		};
		
		self.getVolumeClasses = function () {
			return 'control volumeController ' + ((self.media.muted === true) ? 'audioVolumeMuted' : self.getVolumeClass());
		};

		/* 
		 * Callbacks are determined by the css class. We must group 
		 * functionalities for a multistate button : 
		 * */
		self.onaudioVolumeLow = self.onaudioVolumeMid = self.onaudioVolumeHigh = function (control) {
			self.onaudioVolume(control);
		};
		
		self.onaudioVolumeSet = function (control) {
			self.media.volume = parseInt($(control).attr('rel'), 10) / 10;
			
			$('.audioVolumeSet').removeClass('audioVolumeSetLower').each(function () {
				if (parseInt($(this.node).attr('rel'), 10) <= Math.round(self.media.volume * 10)) {
					$(this.node).addClass('audioVolumeSetLower');
				}
			});
			
			$('.volumeController').attr('class', self.getVolumeClasses());
		};
		
		
		self.onaudioVolume = function (control) {
			self.media.muted = !self.media.muted;
			$(control).attr('class', self.getVolumeClasses());
		};
		
		self.onmediaPlaybackPause = function (control) {
			self.media.pause();
			
			$(control).removeClass('mediaPlaybackPause').addClass('mediaPlaybackStart').unbind('click').bind('click', function () {
				self.onmediaPlaybackStart(control);
			});

			return true;
		};
		
		self.onmediaPlaybackStart = function (control) {
			self.media.play();
			
			$(control).removeClass('mediaPlaybackStart').addClass('mediaPlaybackPause').unbind('click').bind('click', function () {
				self.onmediaPlaybackPause(control);
			});
			
			return true;
		};
		
		self.onmediaPlaybackStop = function (control) {
			self.media.pause();
			self.media.currentTime = 0;
			
			setTimeout(function () { 
				self.updateSeekBar();
			}, 250);
			
			if ($('.mediaPlaybackPause').node.length > 0) {
				$('.mediaPlaybackPause').unbind('click').removeClass('mediaPlaybackPause').addClass('mediaPlaybackStart');
			}
			
			$('.mediaPlaybackStart').bind('click', function () {
				self.onmediaPlaybackStart(this);
			});
			
			return true;
		}; 
		
		self.onviewFullscreen = function (control) {
			var pos = 'fixed';
			self.isFullScreen = !self.isFullScreen;

			if (self.isFullScreen === true) {
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

			$(self.media).css({
				'position' : pos, 
				'top' : 0, 
				'left' : 0
			});

		};
		
		self.showVolumeSet = function () {
			self.isAudioVolumeSetAnimated = true;
			
			if (self.isCursorOverVolumeSet === false) {
				$('#audioVolumeSet').hide("slow", function () {
					self.isAudioVolumeSetAnimated = false;
				});
			}
		};
		

		self.updateSeekBar = function () {
			self.isUpdatingSeekBar = true;
			J('.mediaCurrentPosition').css({'width' : self.media.currentTime / self.media.duration * 100 + '%'});
			J('.mediaLengthTimer').text(self.getNiceTimeAndDuration());
			self.isUpdatingSeekBar = false; 
			/*
			J('.mediaCurrentPosition').animate({width: [self.media.currentTime/self.media.duration * 100 + '%', 'linear']}, 200, function () {
				self.isUpdatingSeekBar = false;
			});*/
		};
		
		self.getEventPosition = function (e) {
			// http://www.quirksmode.org/js/events_properties.html
			if (e.pageX) {
				return e.pageX;
			}
			else if (e.clientX) {
				return e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
			}
		};
		
		
		self.moveToPosition = function (e) {
			var 
				posx = self.getEventPosition(e) - J('.mediaSeekBarCenter')[0].offsetParent.offsetLeft,
				percent;
			
			percent = self.media.duration * (posx / J('.mediaSeekBarCenter').width());

			self.media.currentTime = percent.toFixed(1);

			// currentTime is updated only every 250ms.
			self.updateSeekBarInterval = setInterval(function () {
				if (self.media.currentTime.toFixed(1) === percent.toFixed(1)) {
					self.updateSeekBar();
					clearInterval(self.updateSeekBarInterval);
				}
			}, 20);
		}; 
		
		self.addLeadingZeroes = function (e, i, a) {
			if (e.toString().length < 2) {
				a[i] = '0' + e;
			}
		};
		
		self.formatTime = function (seconds) {
			seconds = Math.round(seconds);
			
			var a = [
				parseInt((seconds / 60) / 60, 10),
				parseInt(seconds / 60, 10),
				parseInt(seconds % 60, 10)
			];
			
			a.map(self.addLeadingZeroes);

			return a.join(':');
		};
		
		self.getNiceTimeAndDuration = function () {
			var niceElapsedTime, niceDurationTime;

			niceElapsedTime = self.formatTime(self.media.currentTime);
			niceDurationTime = self.formatTime(self.media.duration);
			
			return niceElapsedTime + '/' + niceDurationTime;
		};
		
		self.getTimeFromEvent = function (e, element) {
			var 
				posx = self.getEventPosition(e) - element[0].offsetParent.offsetLeft,
				time, niceElapsedTime;
				
			time = self.media.duration * (posx / element.width());
			
			niceElapsedTime = self.formatTime(time);
			return niceElapsedTime;
		};
		
		self.onmediaLengthTimer = function () {
			return false;
		};

		self.registerControls = (function () {
			J(selector).wrap('<div id="videoWrapper">');
			J(selector).after('<div id="jamli-controls"/>');

			self.createControl('mediaPlaybackStart');
			self.createControl('mediaPlaybackStop');
			self.createControl(self.getVolumeClass());
			
			self.createControl('viewFullscreen');
			self.createControl('mediaLengthTimer');
			
			for (var i = 0; i <= 10; i++) {
				self.createControl('audioVolumeSet');
				J('.audioVolumeSet:last').attr('rel', i);
			}
			
			J('.audioVolumeSet').wrapAll('<div id="audioVolumeSet"/>');
			
			J('#audioVolumeSet').hover(function () { 
				self.isCursorOverVolumeSet = true;
			}, 
			function () {
				self.isCursorOverVolumeSet = false;
				setTimeout(self.showVolumeSet, 500);
			});

			J('.audioVolumeHigh, .audioVolumeMid, .audioVolumeLow').addClass('volumeController').hover(function () {
				$('#audioVolumeSet').show("slow", function () {
					self.isAudioVolumeSetAnimated = false;
				});
			}, 
			function () {
				if (self.isAudioVolumeSetAnimated === true) {
					return true;
				}
				
				setTimeout(self.showVolumeSet, 500);
			});
			
			J('.audioVolumeSet:nth-child(8)').trigger('click');
			
			J('#jamli-controls').before('<div class="mediaSeekBarCenter"><div class="mediaCurrentPosition"/><div class="shaded mediaLengthPopupTimer"/></div>');
			J('#jamli-controls, .mediaSeekBarCenter').wrapAll('<div id="jamli" class="shaded"/>');
			
			$(self.media).bind('timeupdate', function () {
				if (self.media.ended === true) {
					J('.mediaPlaybackStop').trigger('click');
					return true;
				}
				
				if (self.isUpdatingSeekBar || self.media.paused === true) {
					return false;
				}
				self.updateSeekBar();
			}); 
						
			/*
			setInterval(function () {
				if (self.media.ended === true) {
					J('.mediaPlaybackStop').trigger('click');
				}
				
				if (self.isUpdatingSeekBar || self.media.paused === true) {
					return false;
				}
				self.updateSeekBar();
			}, 10);
			*/
			/*
			J('#videoWrapper').hover(function () {
				J('#jamli').show();
			}, function () {
				J('#jamli').hide('slow');

			});
			* */
			
			J('.mediaSeekBarCenter').unbind().bind('click', function (e) {
				self.moveToPosition(e);
			}).hover(function (e) {
				J('.mediaLengthPopupTimer').show();
			}, function (e) {
				J('.mediaLengthPopupTimer').hide();
			}).bind('mousemove', function (e) {
				var leftPos = self.getEventPosition(e) - J('.mediaSeekBarCenter')[0].scrollWidth;
				J('.mediaLengthPopupTimer').text(self.getTimeFromEvent(e, J(this))).css({'left' : leftPos + 'px'});
			});
			
			$(self.media).bind('loadedmetadata', function () {
				if (self.media.videoHeight === 0) {
					J(selector).attr('poster', 'medias/poster-audio.png');
				}
	
				J('.mediaLengthTimer').text(self.getNiceTimeAndDuration());
			});
		
			return true;
		}());

		
		return self;
	};

}(window, document, jQuery));



jQuery(document).ready(function () {
	window.videoElement = window.JaMLi('#myVideo');
});