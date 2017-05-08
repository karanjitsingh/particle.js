var mouseX = -100;
var mouseY = -100;


function HEXAtoRGBA(hex, a) {
    hex = hex.substring(1, 7);
    return "rgba(" + parseInt(hex.substr(0, 2), 16) +
        "," + parseInt(hex.substr(2, 2), 16) +
        "," + parseInt(hex.substr(4, 2), 16) +
        "," + a + ")";
}

var Particles = function (canvas) {
    var paths = [];
    var W = canvas.width;
    var H = canvas.height;
    var timer;

    ctx = canvas.getContext('2d');


    canvas.onmousemove = function (e) {
        mouseX = e.layerX;
        mouseY = e.layerY;
    }

    canvas.onmouseout = function (e) {
        mouseY = NaN;
        mouseX = NaN;
    }

    var particles = [];

    this.setPath = function (path) {
        var scale = 1 - Particles.params.scale;
        scale /= 2;
        var offset = {x: 0, y: 0};
        offset.x = scale * W;
        offset.y = scale * H;


        var length = 0;
        for (var i = 0; i < path.length; i++)
            length += path[i].length;

        for (var i = 0; i < path.length; i++) {

            var bpl = parseInt(path[i].length * Particles.params.lineDensity);

            for (var j = 0; j < bpl; j++) {
                var p = new Particles.create_particle(parseInt(Math.random() * 3));

                p.vx = 0;
                p.vy = 0;

                p.animate = Particles.animations.mouseRepel;

                p.animateOpacity = true;
                p.originOpacity = 1;
                p.animationDone = false;
                p.x = p.originX = Particles.params.randomness * (0.5 - Math.random()) + path[i].getPoint(j / bpl).x + offset.x;
                p.y = p.originY = Particles.params.randomness * (0.5 - Math.random()) + path[i].getPoint(j / bpl).y + offset.y;


                particles.push(p);
            }
        }


        paths.push(path);

    }

    this.addBackgroundParticles = function (n) {
        for (var i = 0; i < n; i++) {
            var p = new Particles.create_particle(parseInt(Math.random() * 3));
            p.animateOpacity = true;
            p.originOpacity = 0.4;
            p.opacity = 0;
            p.originX = p.x = Math.random() * W;
            p.originY = p.y = Math.random() * H;
            p.vx = 1 + Math.random() * 5;
            p.vy = 1 + Math.random() * 5;
            p.animate = Particles.animations.random;
            particles.push(p);
        }
    }

    this.draw = function () {

        var scale = 1 - Particles.params.scale;
        scale /= 2;


        if (Particles.params.canvas.drawBG == true) {
            ctx.fillStyle = Particles.params.canvas.BGColor;
            ctx.fillRect(0, 0, W, H);
        }
        else
            ctx.clearRect(0, 0, W, H);


        for (var i = 0; i < particles.length; i++) {
            var p = particles[i];
            p.draw();
        }

    }

    this.start = function () {
        timer = setInterval(this.draw.bind(this), Particles.params.interval);
    }


    this.stop = function () {
        clearTimeout(timer);
    }


};

Particles.create_particle = function (i) {
    this.i = i;
    this.x = 0;
    this.y = 0;

    this.radius = Particles.params.radius;
    this.opacity = 1;

    this.radiusLag = 1;

    this.e = 0.8;

    this.vx = 0;
    this.vy = 0;

    this.originX = 0;
    this.originY = 0;

    this.animateOpacity = false;
    this.originOpacity = 0;

    this.animationDone = true;


    this.blurRadius = 0;


    this.draw = function () {

        this.animate();

        if (Particles.params.pop) {
            if (this.radius < 0.001 + Particles.params.radius) {
                if (Math.random() < Particles.params.popRandomnessFactor) {
                    this.radius += Math.random() * (Particles.params.popRadius - Particles.params.radius);
                    this.radiusLag = Math.random() * 12 + 12;
                }
            }
            else
                this.radius += (Particles.params.radius - this.radius) / this.radiusLag;
        }

        if (this.animateOpacity)
            this.opacity += (this.originOpacity - this.opacity) / 6;


        ctx.beginPath();

        var popColors = Particles.params.popColors;

        if (this.blurRadius == 0 || !Particles.animations.params.blur) {
            ctx.fillStyle = HEXAtoRGBA(popColors[this.i % popColors.length], this.opacity);
            ctx.arc(this.x, this.y, this.radius, Math.PI * 2, false);
        }
        else {
            var radgrad = ctx.createRadialGradient(this.x, this.y, this.radius, this.x, this.y, this.radius + this.blurRadius * 30);

            radgrad.addColorStop(0, HEXAtoRGBA(popColors[this.i % popColors.length], this.opacity));
            radgrad.addColorStop(1, HEXAtoRGBA(popColors[this.i % popColors.length], 0));

            ctx.fillStyle = radgrad;
            ctx.arc(this.x, this.y, this.radius + this.blurRadius * 30, Math.PI * 2, false);

        }

        ctx.fill();

        ctx.closePath();
    };
};

Particles.shapes = {
    line: function (x1, y1, x2, y2) {
        x1 *= Particles.params.scale;
        y1 *= Particles.params.scale;
        x2 *= Particles.params.scale;
        y2 *= Particles.params.scale;

        this.x1 = x1 < x2 ? x1 : x2;
        this.x2 = x1 < x2 ? x2 : x1;
        this.y1 = x1 < x2 ? y1 : y2;
        this.y2 = x1 < x2 ? y2 : y1;
        if (this.x1 - this.x2 != 0)
            this.theta = Math.atan((this.y1 - this.y2) / (this.x1 - this.x2));
        else
            this.theta = Math.PI / 2

        this.length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));

        var ck = this.length * Math.cos(this.theta);
        var sk = this.length * Math.sin(this.theta);

        this.getPoint = function (n) {
            return {x: this.x1 + n * ck, y: this.y1 + n * sk};
        };
    },

    circle: function (x, y, r) {
        this.x = x * Particles.params.scale;
        this.y = y * Particles.params.scale;
        this.r = r * Particles.params.scale;

        this.length = 2 * Math.PI * r;

        var k = this.length * Math.PI * 2;

        this.getPoint = function (n) {
            return {x: this.x + Math.sin(n * k) * this.r, y: this.y + Math.cos(n * k) * this.r};
        };
    },

    arc: function (x, y, r, sa, ea) {
        this.x = x * Particles.params.scale;
        this.y = y * Particles.params.scale;
        this.sa = sa;
        this.ea = ea;
        this.r = r * Particles.params.scale;
        this.theta = this.ea - this.sa;
        if (this.theta < 0)
            this.theta = (2 * Math.PI + this.theta);

        //else
        this.length = this.theta * r;

        this.getPoint = function (n) {
            return {
                x: this.x + this.r * Math.cos(this.sa + n * this.theta),
                y: this.y + this.r * Math.sin(this.sa + n * this.theta)
            };
        };
    },

    ellipseArc: function (x, y, w, h, sa, ea) {
        this.x = x * Particles.params.scale;
        this.y = y * Particles.params.scale;
        this.w = w * Particles.params.scale;
        this.h = h * Particles.params.scale;

        this.sa = sa;
        this.ea = ea;
        this.theta = this.ea - this.sa;

        if (this.theta < 0)
            this.theta = (2 * Math.PI + this.theta);

        this.length = Math.atan(this.w / this.h * Math.tan(this.theta));

        this.length = ( 1.111 * ( Math.sqrt(
            Math.pow(this.w / 2 * (Math.cos(this.sa) - Math.cos(this.ea) ), 2) +
            Math.pow(this.h / 2 * (Math.sin(this.sa) - Math.sin(this.ea) ), 2)
        )));

        this.getPoint = function (n) {
            return {
                x: this.x + this.w / 2 * Math.cos(this.sa + n * this.theta),
                y: this.y + this.h / 2 * Math.sin(this.sa + n * this.theta)
            };
        };
    }
};


Particles.animations = {

    wave: function()
    {
        var fixed = true;
        var y = 0;
        var x = 0;
        for (var i = 0; i < t.length; i++) {
            y += a[i] * Math.sin(w * t[i] - k / l[i] * this.x);
            x += a[i] * Math.cos(w * t[i] - k / l[i] * this.x);
            fixed = false;

        }

        this.y = this.meanY - y;



        if (fixed === true)
            this.y = this.meanY;

        if (x < 0)
            this.opacity += (0.3 - this.opacity) / 1.1;
        else
            this.opacity = 1;
    },

    random: function () {


        this.x += this.vx;
        this.y += this.vy;


        if ((this.x - this.radius < 0 && this.vx < 0) || (this.x + this.radius > W && this.vx > 0))
            this.vx = -1 * this.vx;
        if ((this.y - this.radius < 0 && this.vy < 0) || (this.y + this.radius > H && this.vy > 0))
            this.vy = -1 * this.vy;


    },


    mouseRepel: function () {


        this.x += this.vx;
        this.y += this.vy;

        if (!this.animationDone) {
            this.x += (this.originX - this.x) / 2;
            this.y += (this.originY - this.y) / 2;

            if (Math.abs(this.x - this.originX) < 0.1 && Math.abs(this.y - this.originY) < 0.1) {
                this.animationDone = true;
            }
        }


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

        if (isNaN(posWRTMouse.x) || isNaN(posWRTMouse.y)) {
            distance = 0;
        }

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

        var force = (Particles.animations.params.maxRepelDistance - distance) / Particles.animations.params.maxRepelDistance;
        var gravity = -distance2 / Particles.animations.params.gracityFactor;
        gravity = Math.abs(gravity) > 0.1 ? -0.1 : gravity;

        if (force < 0) force = 0;


        if (isNaN(this.vx))
            this.vx = 0;
        if (isNaN(this.vy))
            this.vy = 0;

        this.vx += forceDirection.x * force * Particles.params.interval / Particles.animations.params.forceFactor + gravityDirection.x * gravity * Particles.params.interval;
        this.vy += forceDirection.y * force * Particles.params.interval / Particles.animations.params.forceFactor + gravityDirection.y * gravity * Particles.params.interval;


        this.vx *= Particles.animations.params.frictionFactor;
        this.vy *= Particles.animations.params.frictionFactor;

        if (distance2 <= Particles.animations.params.minBlurDistance)
            this.blurRadius = 0;
        else if (distance2 <= Particles.animations.params.maxRepelDistance)
            this.blurRadius = (distance2 - Particles.animations.params.minBlurDistance) / Particles.animations.params.marginBlurDistance * 0.4;
        else
            this.blurRadius = 0.4;


    }
};


Particles.params = {
    interval: 30,
    pop: true,
    popColors: ["#ec1943"],//["#E04836", "#F39D41", "#DDDDDD", "#5696BC"],
    radius: 2,
    popRadius: 4,
    popRandomnessFactor: 0.001,
    radiusVariation: 0,
    randomness: 0,
    lineDensity: 0.6,

    scale: 0.7,
    canvas: {
        drawBG: true,
        BGColor: "#fff",
    }
};

Particles.animations.params = {
    blur: false,
    forceFactor: 10,
    maxRepelDistance: 100,
    minBlurDistance: 100 / 2,
    maxBlurDistance: 100 * 2,
    marginBlurDistance: 100 * 3 / 4,
    gracityFactor: 1000,
    frictionFactor: 0.9
};