/* 
 * Jamli - the lightweight Javascript Media Library v0.1
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
 * window.Video1 = Jamli('video tag selector');
 * Note to self : http://www.docuter.com/viewer.asp?document=2095543264be46c64807571273261156&html5_tutorial
 * */

/*jslint plusplus: false, white: true, browser: true, devel: true, forin: true, onevar: true, undef: true, nomen: true, eqeqeq: true, bitwise: true, newcap: true, immed: true, strict: true */
/*global window, document, $ */

       
"use strict";

(function (window, document) {
	// miniQuery
	(function () {
		window.$ = function $(node) {
			var 
				dom = window.selfDOM(), 
				settings = {},
				nodes = [], 
				selector, selectors = [],
				nodeAccumulator = [];	

			dom.scope = $.caller;
							
			if (typeof node === 'string') {
				selectors = node.split(',').map(dom.trim).filter(dom.nonEmpty);
				if (selectors.length > 1) {
					for (selector in selectors) {
						nodeAccumulator.push($(selectors[selector]).nodes);
					}
					nodeAccumulator = nodeAccumulator[0].filter(dom.nonEmpty);
					return dom.setNode(nodeAccumulator);
				}
				
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
		
	window.selfDOM = window.selfDOM || function () {
		var 
			dom = {},
			speeds = {
				slow : 600,
				fast : 200,
				_default : 400
			};
		
		dom.trigger = function (event) {
			dom.each(function () {
				if (typeof this.node.eventList[event] === 'function') {
					this.node.eventList[event]();	
				}
			});
			
			return dom;
		};
		
		dom.trim = function (text) {
			return (text || "").replace(/^(\s|\u00A0)+|(\s|\u00A0)+$/g, "");
		};
		
		dom.nonEmpty =  function (e, i, a) {
			return (e.length === 0) ? false : true;
		};
		
		dom.hover = function (fnIn, fnOut) {
			dom.bind('mouseover', fnIn).bind('mouseout', fnOut);
			return dom;	
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
			dom.node = node;
			
			if (node.length > 1) {
				dom.node = dom.nodes[0];
			}

			return dom;
		};
		
		dom.text = dom.html = function (data) {
			dom.each(function () {
				this.node.innerHTML = data;
			});
			
			return dom;
		};
		
		dom.after = function (data) {
			dom.each(function () {
				this.node.parentNode.insertBefore(data, this.node.nextSibling);
			});
			
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
				
				this.node.eventList = this.node.eventList || [];
				this.node.eventList[e] = f;
			});
			
			return dom;
		};
		
		dom.unbind = function (e) {
			dom.each(function () {
				if (typeof this.node.eventList !== "object" || typeof this.node.eventList[e] !== "object") {
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
		
		dom.createNode = function (tagName, attributes) {
			attributes = attributes || {};
			
			var 
				e = document.createElement(tagName),
				attribute;

			for (attribute in attributes) {
				e.setAttribute(attribute, attributes[attribute]);
			}
			
			return e; 
		};
		
		dom.append = function (parent, node) {
			return ((parent instanceof Array) ? parent[0] : parent).appendChild(node);
		};
		
		dom.removeClass = function (classesToRemove) {
			classesToRemove = classesToRemove.split(/\s+/).map(dom.trim);
			
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
			classesToAdd = classesToAdd.split(/\s+/).map(dom.trim);
			
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
				l = els.length,
				pattern = new RegExp("(^|\\s)" + className + "(\\s|$)"), 
				i = 0, j = 0;
				
			for (;i < l; i++) {
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
				return dom.nodes[0].getAttribute(name);
			}
			
			if (value === '') {
				dom.nodes[0].removeAttribute(name);
			}
			
			dom.each(function () {
				this.node.setAttribute(name, value);
			});
			
			return dom;
		};
		
		dom.wrapAll = function (target) {

			dom.each(function () {
				this.node.parentNode.appendChild(target);
				target.appendChild(this.node.parentNode.removeChild(this.node));
			});
			
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
				duration = dom.getDurationFromString(speed),
				stepping = 20;
			
			dom.each(function () {
				var 
					growth = 1 / (duration / stepping),
					step = 0,
					opacity = parseFloat(this.style('opacity'));
					
				if (isNaN(opacity)) {
					this.style('opacity', 1);
				}
				else if (opacity === 0) {
					return false;
				}


				(function animate() {
					var 
						currentOpacity = 1 - (growth * step),
						rules = {};

					step++;
					
					currentOpacity = (currentOpacity < 0) ? 0 :
						 ((currentOpacity > 1) ? 1 : currentOpacity);

					rules = {
						'filter' : 'alpha(opacity=' + currentOpacity * 100 + ')',
						'opacity' : currentOpacity,
						'-moz-opacity' : currentOpacity
					};
					
					
					if (step * stepping >= duration || currentOpacity === 0) {
						rules.display = 'none';
						dom.css(rules);
						
						if (callback !== undefined) {
							callback.apply(dom.scope);
						}
						return false;
					}
					
					dom.css(rules);

					setTimeout(animate, stepping);
				}());
			});
			return dom;
		};
		
		dom.getDurationFromString = function (speed) {
			return (typeof speed === "number") ? speed : speeds[speed] || speeds._default;
		};
		
		dom.show = function (speed, callback) {
			var 
				duration = dom.getDurationFromString(speed),
				stepping = 20;

			dom.each(function () {
				var 
					growth = 1 / (duration / stepping),
					step = 0,
					opacity = parseFloat(this.style('opacity'));
					
					
				if (isNaN(opacity)) {
					this.style('opacity', 0);
				}
				else if (opacity === 1) {
					this.style('display', 'block');
					return false;
				}
				
				this.style('display', 'block');
				
				(function animate() {
					var 
						currentOpacity = 0 + (growth * step),
						rules = {};
					
					step++;
					
					currentOpacity = (currentOpacity < 0) ? 0 : 
						((currentOpacity > 1) ? 1 : currentOpacity);
					
					rules = {
						'filter' : 'alpha(opacity=' + currentOpacity * 100 + ')',
						'opacity' : currentOpacity,
						'-moz-opacity' : currentOpacity
					};
					
					if (step * stepping >= duration || currentOpacity === 1) {
						rules.display = 'block';
						dom.css(rules);
						
						if (callback !== undefined) {
							callback.apply(dom.scope);
						}
						return false;
					}
					
					dom.css(rules);

					setTimeout(animate, stepping);
				}());
			});
			return dom;
		};	
		return dom;
	};
	


	window.Jamli = window.Jamli || function (selector) {
		var self = {};

		self.media = $(selector).nodes[0];
		self.isFullScreen = false;
		self.isCursorOverVolumeSet = false;
		self.isAudioVolumeSetAnimated = false;
		self.isUpdatingSeekBar = false;
		self.dom = window.selfDOM();
		self.defaultVolume = 3;
	
		self.createControl = function (k) {
			var control = self.dom.append(self.dom.getById('jamli-controls'), self.dom.createNode('span'));
			
			$(control).addClass('control ' + k).bind('click', function () {
				try {
					if (typeof self['on' + k] === 'function') {
						self['on' + k](control);
					}
				} 
				catch (e) {
					throw "on" + k + "(" + control.toString() + ")  (" + e + ")";
				}
			});
			
			return control;
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
			$('.playOverlay').css({display:'none'});
			self.media.play();
		
			$(control).removeClass('mediaPlaybackStart').addClass('mediaPlaybackPause').unbind('click').bind('click', function () {
				self.onmediaPlaybackPause(control);
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
			$('.mediaCurrentPosition').css({'width' : self.media.currentTime / self.media.duration * 100 + '%'});
			$('.mediaLengthTimer').text(self.getNiceTimeAndDuration());
			self.isUpdatingSeekBar = false; 
		};
		
		self.moveToPosition = function (e) {
			var 
				b = e.currentTarget.getBoundingClientRect(),
				percent;
				
			// prevents event queueing
			if (self.isUpdatingSeekBar) {	 
				return true;
			}
	

			percent = self.media.duration * ((self.getEventPosition(e) - b.left) / b.width);
			
			self.media.currentTime = percent.toFixed(1);

			// currentTime is updated only every 250ms.
			self.updateSeekBarInterval = setInterval(function () {
				self.isUpdatingSeekBar = true;
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
			return self.formatTime(self.media.currentTime) + '/' + self.formatTime(self.media.duration);
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

		self.getTimeFromEvent = function (e) {
			var b = e.currentTarget.getBoundingClientRect();
			return self.formatTime(self.media.duration * ((self.getEventPosition(e) - b.left) / b.width));
		};

		
		self.registerControls = (function () {
			
			/*
				<videoWrapper>
					<jamliControlsElement>
						<mediaSeekBarCenterElement>
							<currentPositionElement></currentPositionElement>
							<currentLoadedElement></currentLoadedElement>
						</mediaSeekBarCenterElement>
					</jamliControlsElement>
					<mediaLengthPopupTimer></mediaLengthPopupTimer>
				</videoWrapper>
			 * */
			var 
				jamliElement					= self.dom.createNode('div', {id: 'jamli'}),
				currentPositionElement			= self.dom.createNode('div', {'class' : 'mediaCurrentPosition'}),
				currentLoadedElement			= self.dom.createNode('div', {'class' : 'mediaCurrentLoadedData'}),
				jamliControlsElement			= self.dom.createNode('div', {id : 'jamli-controls'}),
				mediaSeekBarCenterElement		= self.dom.createNode('div', {'class' : 'mediaSeekBarCenter'}),
				i = 0, audioVolumeSetElement;
			
			$(selector).wrapAll(self.dom.createNode('div', {id: 'videoWrapper'}));
			
			
			self.dom.append(mediaSeekBarCenterElement, currentPositionElement);
			self.dom.append(mediaSeekBarCenterElement, currentLoadedElement);
			
			self.dom.append(jamliControlsElement, mediaSeekBarCenterElement);
			
			$(selector).after(jamliControlsElement);
			
			self.createControl('mediaPlaybackStart');
			self.createControl(self.getVolumeClass());
			self.createControl('viewFullscreen');
			self.createControl('mediaLengthTimer');
			self.createControl('mediaWaiter');
			
			$('.mediaWaiter').css({display: 'none'});

			for (; i <= 10; i++) {
				audioVolumeSetElement = self.createControl('audioVolumeSet');
				$(audioVolumeSetElement).attr('rel', i);
				
				if (i === self.defaultVolume) {
					$(audioVolumeSetElement).trigger('click');
				}
			}

			$('.audioVolumeSet').wrapAll(self.dom.createNode('div', {id: 'audioVolumeSet'}));

			$('#jamli-controls').wrapAll(jamliElement);
			
			$('#jamli').after(self.dom.createNode('div', {'class' : 'playOverlay'}));
			
			$('.playOverlay').bind('click', function() {
				$('.mediaPlaybackStart').trigger('click');
			});
			
			$(self.media).css({'cursor': 'pointer'}).bind('click', function() {
				if (self.media.paused === true) {
					$('.mediaPlaybackStart').trigger('click');
					return true;
				}
				
				$('.mediaPlaybackPause').trigger('click');
			});
			
			self.dom.append(jamliElement, self.dom.createNode('div', {'class' : 'shaded mediaLengthPopupTimer'}));
			
			$(self.media).bind('timeupdate', function () {
				if (self.media.ended === true) {
					$('.mediaPlaybackStop').trigger('click');
					return true;
				}
				
				if (self.isUpdatingSeekBar) {
					return false;
				}
				
				self.updateSeekBar();
			}); 

			$('.mediaSeekBarCenter').unbind().bind('click', function (e) {
				
				self.moveToPosition(e);
				
			}).hover(function (e) {
				
				$('.mediaLengthPopupTimer').css({display: 'block'});
				
			}, function (e) {
				
				$('.mediaLengthPopupTimer').css({display: 'none'});
				
			}).bind('mousemove', function (e) {
				
				var b = this.getBoundingClientRect();
				
				$('.mediaLengthPopupTimer').text(self.getTimeFromEvent(e)).css({
					left: (self.getEventPosition(e) - b.left) + 'px'
				});
			});
			
			$(self.media).bind('loadedmetadata', function () {
				
				$('.mediaLengthTimer').text(self.getNiceTimeAndDuration());
				
			}).bind('progress', function (e) {
				if (e.lengthComputable === true) {
					$('.mediaCurrentLoadedData').css({
						width : (e.loaded / e.total) * 100 + '%'
					});
				}
			}).bind('ended', function (e) {
				$('.mediaPlaybackPause').removeClass('mediaPlaybackPause').addClass('mediaPlaybackStart');
			}).bind('seeking', function (e) {
				
				$('.mediaWaiter').css({display: 'block'});
				
			}).bind('waiting', function (e) {
				
				console.log('waiting', e);
				
			}).bind('seeked', function (e) {
				$('.mediaWaiter').css({display: 'none'});
				$('.mediaPlaybackStart').trigger('click');
			}).bind('canplay', function(e) {
				
			 // $('.mediaPlaybackStart').trigger('click');
			});
		
			return true;
		}());

		
		return self;
	};

}(window, document));

var onReady = function () {
	var ua = navigator.userAgent;
	window.videoElement = window.Jamli('#myVideo');
	
	if(ua.match(/iPhone/i) || ua.match(/iPad/i)) {
		$('.playOverlay').css({display:'none'});
		$('#jamli').css({display:'none'});
	}

};

if (document.addEventListener) {
	document.addEventListener("DOMContentLoaded", onReady, false);
} 
else if (document.attachEvent) {
	document.attachEvent("onreadystatechange", onReady);
}
		
