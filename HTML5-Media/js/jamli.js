
window.Jamli = window.Jamli || function (selector) {
	var self = {};

	self.media = $(selector).nodes[0];
	self.isFullScreen = false;
	self.isCursorOverVolumeSet = false;
	self.isAudioVolumeSetAnimated = false;
	self.isUpdatingSeekBar = false;
	self.dom = window.selfDOM();
	self.defaultVolume = 3;
	self.isAppleMobile = function() {
		var ua = navigator.userAgent;
		return ua.match(/iPhone/i) || ua.match(/iPad/i);
	}();
	
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
		seconds = Math.round(seconds) || 0;
		
		var time = [
			parseInt((seconds / 60) / 60, 10),
			parseInt(seconds / 60, 10),
			parseInt(seconds % 60, 10)
		];
		
		time.map(self.addLeadingZeroes);

		return time.join(':');
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
		
		if (!self.isAppleMobile) {
			$(selector).wrapAll(self.dom.createNode('div', {id: 'videoWrapper'}));				
		}

		
		
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
			var buffered = 0;
			
			if (e.lengthComputable === true) {
				buffered = (e.loaded / e.total) * 100 + '%';
			} 
			else {
				buffered = (self.media.buffered.end() / self.media.duration) * 100 + '%';
			}
			
			$('.mediaCurrentLoadedData').css({width : buffered});
			
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

