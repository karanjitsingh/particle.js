
var mouseX= -100;
var mouseY = -100;

window.onmousemove = function(e) {
		mouseX = e.clientX;
		mouseY = e.clientY;
	}



function HEXAtoRGBA(hex, a) {
		hex = hex.substring(1, 7);
		return "rgba(" + parseInt(hex.substr(0, 2), 16) +
			"," + parseInt(hex.substr(2, 2), 16) +
			"," + parseInt(hex.substr(4, 2), 16) +
			"," + a + ")";
	}


var particles =  function(canvas){
	var paths = [];
	var W = canvas.width;
	var H = canvas.height;
	var timer;

	ctx = canvas.getContext('2d');

	this.params = {
		cx: H/2,
		cy: W/2,
		interval: 30,
		particles: {
			pop: true,
			popColors: ["#E04836", "#F39D41", "#DDDDDD", "#5696BC"],
			radius: 4,
			radiusVariation: 0
		},
		canvas: {
			drawBG: false,
			BGColor: "#111111",
			scale:1
		}
	}

	var particles = [];

	this.setPath = function(path,lineDensity) {
		

		var length = 0;
		for(var i=0;i< path.length;i++)
			length+=path[i].length;

		path.pathLenght = length;

		

		for(var i = 0;i<path.length; i++) {
			
			var bpl = parseInt(path[i].length * lineDensity);
		
			for (var j = 0; j < bpl; j++) {
				var p = new create_particle(parseInt(Math.random()*3));

				p.vx = 0;
				p.vy = 0;

				p.repel = true;
				//p.blur = true;
				
				p.animate = particleAnimations.mouseRepel;

				p.animateOpacity = true;
				p.originOpacity = 1;
				p.animationDone = false;
				p.originX = 0 * (0.5 - Math.random()) + path[i].getPoint(j / bpl).x;
				p.originY = 0 * (0.5 - Math.random()) + path[i].getPoint(j / bpl).y;

				particles.push(p);

			}
			
		}


		document.title=(particles.length);


		paths.push(path);

	}

	this.draw = function() {

		if(this.params.canvas.drawBG == true) {
			ctx.fillStyle = this.params.canvas.drawBG;
			ctx.fillRect(0, 0, W, H);
			ctx.fill();
		}
		else
			ctx.clearRect(0,0,W,H);
		
		for (var i = 0; i < particles.length; i++) {
			var p = particles[i];
			p.draw();
		}
	}

	this.start = function() {
		timer = setInterval(this.draw.bind(this), this.params.interval);
	}


	this.stop = function() {
		clearTimeout(timer);
	}


};



create_particle = function(i) {
		this.i = i;
		this.x = i / total * W;
		this.y = H * 2 / 3;

		this.radius = 4;
		this.opacity = 1;

		this.pop = true;
		this.radiusLag = 1;

		this.e = 0.8;

		this.vx = 0;
		this.vy = 0;

		this.originX = 0;
		this.originY = 0;

		this.animateOpacity = false;
		this.originOpacity = 0;

		this.assignedText = false;
		this.animationDone = true;


		this.blurRadius = 0;
		this.blur = false;

		this.repel = false;


		this.blurRect = false;

		this.draw = function () {

			this.animate();

			if (this.pop) {
				if (this.radius < 2.001) {
					this.radius += Math.random() * 4;
					this.radiusLag = Math.random() * 12 + 12;
				}
				else
					this.radius += (2 - this.radius) / this.radiusLag;
			}

			if (this.animateOpacity)
				this.opacity += (this.originOpacity - this.opacity) / 6;


			ctx.beginPath();

			if (this.blurRadius == 0 || !this.blur) {
				ctx.fillStyle = HEXAtoRGBA(POP_COLORS[this.i % 3], this.opacity);
				ctx.arc(this.x, this.y, this.radius, Math.PI * 2, false);
			}
			else {
				var radgrad = ctx.createRadialGradient(this.x, this.y, this.radius, this.x, this.y, this.radius + this.blurRadius * 30);

				radgrad.addColorStop(0, HEXAtoRGBA(POP_COLORS[this.i % 3], this.opacity));
				radgrad.addColorStop(1, HEXAtoRGBA(POP_COLORS[this.i % 3], 0));

				ctx.fillStyle = radgrad;
				ctx.arc(this.x, this.y, this.radius + this.blurRadius * 30, Math.PI * 2, false);

			}

			ctx.fill();

			ctx.closePath();
		};
	};

particles.shapes = {
		line: function(x1, y1, x2, y2) {
			this.x1 = x1 < x2?x1:x2;
			this.x2 = x1 < x2?x2:x1;
			this.y1 = x1 < x2?y1:y2;
			this.y2 = x1 < x2?y2:y1;
			if (this.x1 - this.x2 != 0)
				this.theta = Math.atan((this.y1 - this.y2) / (this.x1 - this.x2));
			else
				this.theta = Math.PI / 2

			this.length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));

			var ck = this.length * Math.cos(this.theta);
			var sk = this.length * Math.sin(this.theta);

			this.getPoint = function (n) {
				return { x: this.x1 + n * ck, y: this.y1 + n * sk };
			};
		},

		circle: function(x, y, r) {
			this.x = x;
			this.y = y;
			this.r = r;

			this.length = 2 * Math.PI * r;

			var k = this.length * Math.PI * 2;

			this.getPoint = function (n) {
				return { x: this.x + Math.sin(n * k) * this.r, y: this.y + Math.cos(n * k) * this.r };
			};
		},

		arc: function(x, y, r, sa, ea) {
			this.x = x;
			this.y = y;
			this.sa = sa;
			this.ea = ea;
			this.theta = this.ea - this.sa;
			if(this.theta<0)
				this.theta = (2 * Math.PI + this.theta);

			//else
				this.length = this.theta * r;

			this.getPoint = function (n) {
				return { x: this.x + r * Math.cos(this.sa + n * this.theta), y: this.y + r * Math.sin(this.sa + n * this.theta) };
			};
		},

		ellipseArc: function(x,y,w,h,sa,ea) {
			this.x = x;
			this.y = y;
			this.w = w;
			this.h = h;

			this.sa = sa;
			this.ea = ea;
			this.theta = this.ea - this.sa;

			if(this.theta<0)
				this.theta = (2 * Math.PI + this.theta);
			
			this.length = Math.atan(this.w/this.h * Math.tan(this.theta));

			this.length =( 1.111 * ( Math.sqrt(
				Math.pow( this.w/2 * (Math.cos(this.sa) - Math.cos(this.ea) ) , 2 ) + 
				Math.pow( this.h/2 *  (Math.sin(this.sa) - Math.sin(this.ea) ) , 2  )
			)));

			this.getPoint = function (n) {
				return { x: this.x + this.w/2 * Math.cos(this.sa + n * this.theta), y: this.y + this.h/2 * Math.sin(this.sa + n * this.theta) };
			};
		}
	};

particleAnimations = {

		random: function() {
			this.x += this.vx;
			this.y += this.vy;

			if ((this.x - this.radius < 0 && this.vx < 0) || (this.x + this.radius > W && this.vx > 0))
				this.vx = -1 * this.vx;
			if ((this.y - this.radius < 0 && this.vy < 0) || (this.y + this.radius > H && this.vy > 0))
				this.vy = -1 * this.vy;

		},


		mouseRepel: function() {

			this.params = {
				forceFactor: 1,
				maxRepelDistance: 100,
				minBlurDistance: this.maxRepelDistance / 2,
				maxBlurDistance: this.maxRepelDistance * 2,
				marginBlurDistance: this.maxRepelDistance * 3 / 4
			};

			var posWRTMouse = {
				x: this.x - mouseX,
				y: this.y - mouseY
			};

			var posWRTOrigin = {
				x: this.x - this.originX,
				y: this.y - this.originY
			};

			var distance = Math.sqrt(
				posWRTMouse.x * posWRTMouse.x +
				posWRTMouse.y * posWRTMouse.y
			);

			var distance2 = Math.sqrt(
				posWRTOrigin.x * posWRTOrigin.x +
				posWRTOrigin.y * posWRTOrigin.y
			);

			var forceDirection = {
				x: distance != 0 ? posWRTMouse.x / distance : 0,
				y: distance != 0 ? posWRTMouse.y / distance : 0
			};

			var gravityDirection = {
				x: distance2 != 0 ? posWRTOrigin.x / distance2 : 0,
				y: distance2 != 0 ? posWRTOrigin.y / distance2 : 0
			};

			var force = (this.maxRepelDistance - distance) / this.maxRepelDistance;
			var gravity = -distance2 / 1000;
			gravity = Math.abs(gravity) > 0.1 ? -0.1 : gravity;

			if (force < 0) force = 0;

			this.vx += forceDirection.x * force * 30 / this.forceFactor + gravityDirection.x * gravity * 30;
			this.vy += forceDirection.y * force * 30 / this.forceFactor + gravityDirection.y * gravity * 30;   //set spf as 30

			if (isNaN(this.vx))
				this.vx = 0;
			if (isNaN(this.vy))
				this.vy = 0;

			this.vx *= 0.9;
			this.vy *= 0.9;

			if (distance2 <= this.minBlurDistance)
				this.blurRadius = 0;
			else if (distance2 <= this.maxRepelDistance)
				this.blurRadius = (distance2 - this.minBlurDistance) / this.marginBlurDistance * 0.4;
			else
				this.blurRadius = 0.4;

			this.x += this.vx;
			this.y += this.vy;

			this.x += (this.originX - this.x) / 2;
			this.y += (this.originY - this.y) / 2;

			if (Math.abs(this.x - this.originX) < 0.1 && Math.abs(this.y - this.originY) < 0.1) {
				this.animationDone = true;
			}
		}
	};



