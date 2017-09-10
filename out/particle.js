var Atom = (function () {
    function Atom(id, speed, position, opacity, options) {
        this.animationDone = true;
        this.blurRadius = 0;
        // No idea what to do with these
        this.radiusLag = 1;
        this.animateOpacity = true;
        this.index = id;
        this.options = generateOptions(options, Atom.default);
        this.radius = this.options.radius;
        this.opacity = opacity || 1;
        this.speed = speed || { x: 0, y: 0 };
        this.pos = position ? { x: position.x, y: position.y } : { x: 0, y: 0 };
        this.origin = position ? { x: position.x, y: position.y } : { x: 0, y: 0 };
    }
    Atom.prototype.dispose = function () {
        return [];
    };
    Atom.prototype.draw = function (context) {
        var ctx = context.canvasContext;
        if (this.options.pop) {
            if (this.radius < 0.001 + this.options.radius) {
                if (Math.random() < this.options.popProbability) {
                    this.radius += Math.random() * (this.options.popRadius - this.options.radius);
                    this.radiusLag = Math.random() * 12 + 12;
                }
            }
            else
                this.radius += (this.options.radius - this.radius) / this.radiusLag;
        }
        ctx.beginPath();
        var colorSet = this.options.colorSet;
        if (this.blurRadius == 0 || !this.options.blur) {
            ctx.fillStyle = HEXAtoRGBA(colorSet[this.index % colorSet.length], this.opacity);
            ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);
        }
        else {
            var radgrad = ctx.createRadialGradient(this.pos.x, this.pos.y, this.radius, this.pos.x, this.pos.y, this.radius + this.blurRadius * 30);
            radgrad.addColorStop(0, HEXAtoRGBA(colorSet[this.index % colorSet.length], this.opacity));
            radgrad.addColorStop(1, HEXAtoRGBA(colorSet[this.index % colorSet.length], 0));
            ctx.fillStyle = radgrad;
            ctx.arc(this.pos.x, this.pos.y, this.radius + this.blurRadius * 30, Math.PI * 2, 0, false);
        }
        ctx.fill();
        ctx.closePath();
    };
    Atom.default = {
        pop: true,
        popRadius: 4,
        popProbability: 0.001,
        radius: 2,
        colorSet: ["#E04836", "#F39D41", "#DDDDDD"],
        blur: true
    };
    return Atom;
}());
var ParticleJS = (function () {
    function ParticleJS(canvas, drawObjectCollection, options) {
        var _this = this;
        this.mouse = {
            x: NaN,
            y: NaN
        };
        this.W = canvas.width;
        this.H = canvas.height;
        this.paths = [];
        this.ctx = canvas.getContext('2d');
        this.options = generateOptions(options, ParticleJS.default);
        this.DrawObjectCollection = drawObjectCollection || [];
        window.addEventListener("mousemove", function (e) {
            _this.mouse.x = e.clientX;
            _this.mouse.y = e.clientY;
        });
        this.particles = [];
    }
    ParticleJS.prototype.addDrawObject = function (drawObject) {
        this.DrawObjectCollection.push(drawObject);
    };
    ParticleJS.prototype.removeDrawObject = function (drawObject) {
        for (var i = 0; i < this.DrawObjectCollection.length; i++) {
            if (this.DrawObjectCollection[i] == drawObject) {
                var drawObject = this.DrawObjectCollection.splice(i, 1)[0];
                return drawObject.dispose();
            }
        }
        return null;
    };
    ParticleJS.prototype.draw = function () {
        if (this.options.beforeDraw)
            this.options.beforeDraw(this.ctx);
        if (this.options.drawCanvasBackground) {
            this.ctx.fillStyle = this.options.canvasBGColor;
            this.ctx.fillRect(0, 0, this.W, this.H);
        }
        else
            this.ctx.clearRect(0, 0, this.W, this.H);
        for (var i = 0; i < this.DrawObjectCollection.length; i++)
            this.DrawObjectCollection[i].draw({
                canvasContext: this.ctx,
                mousePosition: this.mouse,
                canvasHeight: this.H,
                canvasWidth: this.W,
                options: this.options
            });
        if (this.options.afterDraw)
            this.options.afterDraw(this.ctx);
    };
    ParticleJS.prototype.start = function () {
        this.timer = setInterval(this.draw.bind(this), this.options.animationInterval);
    };
    ParticleJS.prototype.stop = function () {
        clearTimeout(this.timer);
    };
    ParticleJS.default = {
        drawCanvasBackground: true,
        canvasBGColor: "#ffffff",
        animationInterval: 30
    };
    return ParticleJS;
}());
function HEXAtoRGBA(hex, a) {
    hex = hex.substring(1, 7);
    return "rgba(" + parseInt(hex.substr(0, 2), 16) +
        "," + parseInt(hex.substr(2, 2), 16) +
        "," + parseInt(hex.substr(4, 2), 16) +
        "," + a + ")";
}
/* TODO
 * recursive option generation
 */
function generateOptions(options, defaultOptions) {
    var newOptions = {};
    if (options == undefined)
        for (var i in defaultOptions)
            newOptions[i] = defaultOptions[i];
    else
        for (var i in defaultOptions)
            if (options[i] == undefined)
                newOptions[i] = defaultOptions[i];
            else
                newOptions[i] = options[i];
    return newOptions;
}
var ParticleJSAnimations;
(function (ParticleJSAnimations) {
    var FadeExplode = (function () {
        function FadeExplode(options, atomSet) {
            this.options = generateOptions(options, FadeExplode.default);
            this.randomizeAtoms(atomSet);
        }
        FadeExplode.prototype.dispose = function () {
            return this.atomSet.splice(0, this.atomSet.length);
        };
        FadeExplode.prototype.randomizeAtoms = function (atomSet) {
            this.atomSet = atomSet.splice(0, atomSet.length);
            for (var i = 0; i < this.atomSet.length; i++) {
                this.atomSet[i].speed = {
                    x: (this.options.minSpeed + Math.random() * (this.options.maxSpeed - this.options.minSpeed)) * (Math.random() > 0.5 ? -1 : 1),
                    y: (this.options.minSpeed + Math.random() * (this.options.maxSpeed - this.options.minSpeed)) * (Math.random() > 0.5 ? 1 : -1)
                };
            }
        };
        FadeExplode.prototype.draw = function (context) {
            for (var j = 0; j < this.atomSet.length; j++) {
                var atom = this.atomSet[j];
                atom.pos.x += atom.speed.x;
                atom.pos.y += atom.speed.y;
                atom.opacity -= atom.opacity / this.options.animationFactor;
                if (atom.opacity < 0.01) {
                    this.atomSet.splice(j, 1);
                    j--;
                    continue;
                }
                if (this.options.boxed == true) {
                    if ((atom.pos.x - atom.options.radius < 0 && atom.speed.x < 0) || (atom.pos.x + atom.options.radius > context.canvasWidth && atom.speed.x > 0))
                        atom.speed.x = -1 * atom.speed.x;
                    if ((atom.pos.y - atom.options.radius < 0 && atom.speed.y < 0) || (atom.pos.y + atom.options.radius > context.canvasHeight && atom.speed.y > 0))
                        atom.speed.y = -1 * atom.speed.y;
                }
                atom.draw(context);
            }
        };
        FadeExplode.default = {
            minSpeed: 2,
            maxSpeed: 10,
            boxed: true,
            animationFactor: 8
        };
        return FadeExplode;
    }());
    ParticleJSAnimations.FadeExplode = FadeExplode;
})(ParticleJSAnimations || (ParticleJSAnimations = {}));
/* TODO
* readjustable atoms
*/
var ParticleJSAnimations;
(function (ParticleJSAnimations) {
    var SVGAnimation = (function () {
        function SVGAnimation(path2d, options, atomSet) {
            this.offset = { x: 0, y: 0 };
            this.alpha = 1;
            this.atomSet = [];
            this.firstDraw = true;
            this.options = generateOptions(options, SVGAnimation.default);
            var path = (new SVGPath(path2d)).paths;
            this.GeneratePathObjects(path);
            this.GenerateAtomSet(atomSet);
        }
        SVGAnimation.prototype.dispose = function () {
            return this.atomSet;
        };
        SVGAnimation.prototype.GeneratePathObjects = function (path) {
            this.pathObjects = [];
            var ctx;
            for (var i = 0; i < path.length; i++) {
                switch (path[i].f) {
                    case CanvasCommand.Line:
                        this.pathObjects.push(new SVGAnimation.Shapes.Line(path[i].from.x, path[i].from.y, path[i].args[0], path[i].args[1], this.options.scale));
                        break;
                    case CanvasCommand.EllipticalArc:
                        var args = path[i].args;
                        var pos = path[i - 3].args;
                        var rotate = path[i - 2].args[0];
                        var size = path[i - 1].args;
                        var angle = path[i].args;
                        this.pathObjects.push(new SVGAnimation.Shapes.Arc(pos[0], pos[1], size[0] * 2, size[1] * 2, angle[3], angle[4], rotate, this.options.scale));
                        break;
                    case CanvasCommand.BezierCurve:
                        var args = path[i].args;
                        this.pathObjects.push(new SVGAnimation.Shapes.BezierCurve({ x: path[i].from.x, y: path[i].from.y }, { x: args[0], y: args[1] }, { x: args[2], y: args[3] }, { x: args[4], y: args[5] }, this.options.scale));
                        break;
                    case CanvasCommand.QuadraticCurve:
                        var args = path[i].args;
                        this.pathObjects.push(new SVGAnimation.Shapes.QuadraticCurve({ x: path[i].from.x, y: path[i].from.y }, { x: args[0], y: args[1] }, { x: args[2], y: args[3] }, this.options.scale));
                        break;
                    default:
                }
            }
        };
        SVGAnimation.prototype.GenerateAtomSet = function (atomSet) {
            var density = this.options.lineDensity;
            var length = 0;
            for (var i = 0; i < this.pathObjects.length; i++)
                length += this.pathObjects[i].length;
            var itemCount = 0;
            if (atomSet && atomSet.length > 0) {
                this.firstDraw = false;
            }
            for (var i = 0; i < this.pathObjects.length; i++) {
                var bpl = Math.floor(this.pathObjects[i].length * density);
                for (var j = 0; j < bpl; j++) {
                    var options;
                    var pos = this.pathObjects[i].nthPoint(j / bpl);
                    /* TODO
                    * error handling - although i shouldn't have to worry about this because TS
                    */
                    if (atomSet && atomSet.length > 0) {
                        var index = Math.floor(Math.random() * atomSet.length);
                        var atom = atomSet.splice(index, 1)[0];
                        this.atomSet.push(atom);
                        atom.index = itemCount;
                        atom.speed = { x: 0, y: 0 },
                            atom.origin = {
                                x: this.options.pathVariation * (0.5 - Math.random()) + pos.x,
                                y: this.options.pathVariation * (0.5 - Math.random()) + pos.y
                            };
                        atom.animationDone = false;
                        // Some options are applied only on instanciation
                        atom.options = generateOptions(this.options.atomOptions, Atom.default);
                    }
                    else {
                        var atom = new Atom(itemCount, { x: 0, y: 0 }, {
                            x: this.options.pathVariation * (0.5 - Math.random()) + pos.x,
                            y: this.options.pathVariation * (0.5 - Math.random()) + pos.y
                        }, 1, this.options.atomOptions);
                        this.atomSet.push(atom);
                    }
                    itemCount++;
                }
            }
        };
        SVGAnimation.prototype.draw = function (context) {
            if (this.firstDraw || !this.options.mouseRepel) {
                this.firstDraw = false;
                for (var i = 0, atom = this.atomSet[i]; i < this.atomSet.length; i++, atom = this.atomSet[i]) {
                    var origin = { x: atom.origin.x + this.offset.x, y: atom.origin.y + this.offset.y };
                    if (atom.animationDone) {
                        atom.pos.x = origin.x;
                        atom.pos.y = origin.y;
                        atom.opacity = this.alpha;
                    }
                    atom.draw(context);
                }
                return;
            }
            var mouse = context.mousePosition;
            for (var i = 0, atom = this.atomSet[i]; i < this.atomSet.length; i++, atom = this.atomSet[i]) {
                var origin = { x: atom.origin.x + this.offset.x, y: atom.origin.y + this.offset.y };
                if (!atom.animationDone) {
                    atom.pos.x += (origin.x - atom.pos.x) / this.options.animationFactor;
                    atom.pos.y += (origin.y - atom.pos.y) / this.options.animationFactor;
                    atom.opacity += (this.alpha - atom.opacity) / this.options.animationFactor;
                    if (Math.abs(atom.pos.x - origin.x) < 0.1 && Math.abs(atom.pos.y - origin.y) < 0.1 && Math.abs(atom.opacity - this.alpha) < 0.1) {
                        atom.animationDone = true;
                    }
                    atom.draw(context);
                    continue;
                }
                atom.pos.x += atom.speed.x;
                atom.pos.y += atom.speed.y;
                atom.opacity = this.alpha;
                var posWRTMouse = {
                    x: atom.pos.x - mouse.x,
                    y: atom.pos.y - mouse.y
                };
                var posWRTOrigin = {
                    x: atom.pos.x - origin.x,
                    y: atom.pos.y - origin.y
                };
                var distance = Math.sqrt(posWRTMouse.x * posWRTMouse.x +
                    posWRTMouse.y * posWRTMouse.y);
                if (isNaN(posWRTMouse.x) || isNaN(posWRTMouse.y)) {
                    distance = 0;
                }
                var distance2 = Math.sqrt(posWRTOrigin.x * posWRTOrigin.x +
                    posWRTOrigin.y * posWRTOrigin.y);
                var forceDirection = {
                    x: distance != 0 ? posWRTMouse.x / distance : 0,
                    y: distance != 0 ? posWRTMouse.y / distance : 0
                };
                var gravityDirection = {
                    x: distance2 != 0 ? posWRTOrigin.x / distance2 : 0,
                    y: distance2 != 0 ? posWRTOrigin.y / distance2 : 0
                };
                var force = (this.options.maxRepelDistance - distance) / this.options.maxRepelDistance;
                var gravity = -distance2 / this.options.gravity;
                gravity = Math.abs(gravity) > 0.1 ? -0.1 : gravity;
                if (force < 0)
                    force = 0;
                if (isNaN(atom.speed.x))
                    atom.speed.x = 0;
                if (isNaN(atom.speed.y))
                    atom.speed.y = 0;
                atom.speed.x += forceDirection.x * force * context.options.animationInterval / this.options.forceFactor + gravityDirection.x * gravity * context.options.animationInterval;
                atom.speed.y += forceDirection.y * force * context.options.animationInterval / this.options.forceFactor + gravityDirection.y * gravity * context.options.animationInterval;
                atom.speed.y *= this.options.frictionFactor;
                atom.speed.x *= this.options.frictionFactor;
                if (this.options.blur) {
                    if (distance2 <= this.options.minBlurDistance)
                        atom.blurRadius = 0;
                    else if (distance2 <= this.options.maxRepelDistance)
                        atom.blurRadius = (distance2 - this.options.minBlurDistance) / this.options.marginBlurDistance * 0.4;
                    else
                        atom.blurRadius = 0.4;
                }
                atom.draw(context);
                if (this.options.connectingLines) {
                    var ctx = context.canvasContext;
                    ctx.beginPath();
                    ctx.lineWidth = this.options.connectingLineWidth;
                    var opacity = this.options.connectingLineOpacity;
                    ctx.moveTo(atom.pos.x, atom.pos.y);
                    if (i + 1 < this.atomSet.length) {
                        ctx.lineTo(this.atomSet[i + 1].pos.x, this.atomSet[i + 1].pos.y);
                        var d = Math.sqrt(Math.pow(this.atomSet[i + 1].pos.x - atom.pos.x, 2) + Math.pow(this.atomSet[i + 1].pos.y - atom.pos.y, 2));
                        var d2 = Math.sqrt(Math.pow(this.atomSet[i + 1].origin.x - atom.origin.x, 2) + Math.pow(this.atomSet[i + 1].origin.y - atom.origin.y, 2));
                        if (d <= d2 && d2 <= this.options.connectingLineMaxLength)
                            opacity = 0.5;
                        else if (d <= d2 + this.options.connectingLineRelaxLength && d2 <= this.options.connectingLineMaxLength) {
                            opacity = (d2 + this.options.connectingLineRelaxLength - d) / this.options.connectingLineRelaxLength * 0.5;
                        }
                        else
                            opacity = 0;
                    }
                    ctx.strokeStyle = HEXAtoRGBA(this.options.connectingLineColor, opacity * this.alpha);
                    ctx.stroke();
                    ctx.closePath();
                }
            }
        };
        SVGAnimation.default = {
            atomOptions: Atom.default,
            pathVariation: 0,
            lineDensity: 0.2,
            scale: 1,
            blur: false,
            mouseRepel: true,
            forceFactor: 10,
            maxRepelDistance: 100,
            minBlurDistance: 50,
            maxBlurDistance: 200,
            marginBlurDistance: 75,
            gravity: 1000,
            frictionFactor: 0.9,
            connectingLines: false,
            connectingLineWidth: 1,
            connectingLineOpacity: 0.5,
            connectingLineColor: "#FFFFFF",
            connectingLineMaxLength: 20,
            connectingLineRelaxLength: 20,
            animationFactor: 3,
        };
        SVGAnimation.Shapes = (_a = (function () {
                function class_1() {
                }
                return class_1;
            }()),
            _a.Line = (function () {
                function class_2(x1, y1, x2, y2, scale) {
                    var theta;
                    var xdiff = Math.abs(x1 - x2) * scale;
                    var ydiff = Math.abs(y1 - y2) * scale;
                    x1 *= scale;
                    y1 *= scale;
                    x2 *= scale;
                    y2 *= scale;
                    if (x1 - x2 != 0)
                        theta = Math.atan((y1 - y2) / (x1 - x2));
                    else
                        theta = Math.PI / 2;
                    this.length = Math.sqrt(Math.pow(xdiff, 2) + Math.pow(ydiff, 2));
                    this.ck = this.length * Math.cos(theta) * (x1 > x2 ? -1 : 1);
                    this.sk = this.length * Math.sin(theta) * (x1 > x2 || (x1 == x2 && y1 > y2) ? -1 : 1);
                    this.start = {
                        x: x1,
                        y: y1
                    };
                }
                class_2.prototype.nthPoint = function (n) {
                    return { x: this.start.x + n * this.ck, y: this.start.y + n * this.sk };
                };
                return class_2;
            }()),
            _a.Arc = (function () {
                function class_3(x, y, w, h, sa, ea, phi, scale) {
                    this.x = x * scale,
                        this.y = y * scale,
                        this.w = w * scale,
                        this.h = h * scale;
                    this.sa = sa;
                    this.ea = ea;
                    this.theta = this.ea - this.sa;
                    this.phi = phi;
                    if (this.theta < 0)
                        this.theta = (2 * Math.PI + this.theta);
                    this.length = (1.111 * (Math.sqrt(Math.pow(this.w / 2 * (Math.cos(this.sa) - Math.cos(this.ea)), 2) +
                        Math.pow(this.h / 2 * (Math.sin(this.sa) - Math.sin(this.ea)), 2))));
                }
                class_3.prototype.nthPoint = function (n) {
                    var _this = this;
                    function rotate(cx, cy, p, theta) {
                        var pPrime = { x: 0, y: 0 };
                        pPrime.x = (p.x - cx) * Math.cos(theta) - (p.y - cy) * Math.sin(theta) + cx;
                        pPrime.y = (p.x - cx) * Math.sin(theta) + (p.y - cy) * Math.cos(theta) + cy;
                        return pPrime;
                    }
                    var getPoint = function (n) {
                        return {
                            x: _this.x + _this.w / 2 * Math.cos(_this.sa + n * _this.theta),
                            y: _this.y + _this.h / 2 * Math.sin(_this.sa + n * _this.theta)
                        };
                    };
                    return this.phi ? rotate(this.x, this.y, getPoint(n), this.phi) : getPoint(n);
                };
                return class_3;
            }()),
            _a.BezierCurve = (function () {
                function class_4(p1, p2, p3, p4, scale) {
                    this.p1 = { x: p1.x * scale, y: p1.y * scale };
                    this.p2 = { x: p2.x * scale, y: p2.y * scale };
                    this.p3 = { x: p3.x * scale, y: p3.y * scale };
                    this.p4 = { x: p4.x * scale, y: p4.y * scale };
                    this.length = 0;
                    var distance = function (a, b) { return Math.sqrt(Math.pow(Math.abs(a.x - b.x), 2) + Math.pow(Math.abs(a.y - b.y), 2)); };
                    var p1 = {
                        x: this.p1.x,
                        y: this.p1.y
                    };
                    for (var i = 0.01; i <= 1; i += 0.01) {
                        p2 = this.nthPoint(i);
                        this.length += distance(p1, p2);
                        p1 = p2;
                    }
                }
                class_4.prototype.nthPoint = function (n) {
                    var a = (1 - n), a2 = a * a, a3 = a2 * a;
                    var b = n, b2 = b * b, b3 = b2 * b;
                    return {
                        x: a3 * this.p1.x + 3 * b * a2 * this.p2.x + 3 * b2 * a * this.p3.x + b3 * this.p4.x,
                        y: a3 * this.p1.y + 3 * b * a2 * this.p2.y + 3 * b2 * a * this.p3.y + b3 * this.p4.y
                    };
                };
                return class_4;
            }()),
            _a.QuadraticCurve = (function () {
                function class_5(p1, p2, p3, scale) {
                    this.p1 = { x: p1.x * scale, y: p1.y * scale };
                    this.p2 = { x: p2.x * scale, y: p2.y * scale };
                    this.p3 = { x: p3.x * scale, y: p3.y * scale };
                    this.length = 0;
                    var distance = function (a, b) { return Math.sqrt(Math.pow(Math.abs(a.x - b.x), 2) + Math.pow(Math.abs(a.y - b.y), 2)); };
                    var p1 = {
                        x: this.p1.x,
                        y: this.p1.y
                    };
                    for (var i = 0.01; i <= 1; i += 0.01) {
                        p2 = this.nthPoint(i);
                        this.length += distance(p1, p2);
                        p1 = p2;
                    }
                }
                class_5.prototype.nthPoint = function (n) {
                    var a = (1 - n), a2 = a * a;
                    var b = n, b2 = b * b;
                    return {
                        x: a2 * this.p1.x + 2 * b * a * this.p2.x + b2 * this.p3.x,
                        y: a2 * this.p1.y + 2 * b * a * this.p2.y + b2 * this.p3.y
                    };
                };
                return class_5;
            }()),
            _a);
        return SVGAnimation;
        var _a;
    }());
    ParticleJSAnimations.SVGAnimation = SVGAnimation;
})(ParticleJSAnimations || (ParticleJSAnimations = {}));
/* TODO
 * test wave animation for changing properties
 */
var ParticleJSAnimations;
(function (ParticleJSAnimations) {
    var WaveAnimation = (function () {
        function WaveAnimation(totalAtoms, waves, options) {
            this.alpha = 1;
            this.options = generateOptions(options, WaveAnimation.default);
            this.atomSet = [];
            this.waves = [];
            this.totalAtoms = totalAtoms;
            this.alpha = 1;
            for (var i in waves)
                this.waves.push(generateOptions(waves[i], { time: 0, amplitude: 0, wavelength: 0, phase: 0, timePeriod: 0, increment: 0.1 }));
            for (var j = 0; j < totalAtoms; j++)
                this.atomSet.push(new Atom(j, { x: 0, y: 0 }, { x: j / totalAtoms * this.options.width, y: this.options.top }, this.alpha, this.options.atomOptions));
        }
        WaveAnimation.prototype.dispose = function () {
            return this.atomSet.splice(0, this.atomSet.length);
        };
        WaveAnimation.prototype.addWave = function (wave) {
            this.waves.push(wave);
        };
        WaveAnimation.prototype.removeWave = function (wave) {
            var key = null;
            for (var i = 0; i < this.waves.length; i++) {
                if (this.waves[i] == wave)
                    key = this.waves.splice(i, 1);
            }
            return key;
        };
        WaveAnimation.prototype.draw = function (context) {
            for (var j = 0; j < this.totalAtoms; j++) {
                var atom = this.atomSet[j];
                var x = 0, y = 0;
                for (var i = 0; i < this.waves.length; i++) {
                    var wave = this.waves[i];
                    var theta = 2 * Math.PI / wave.timePeriod * wave.time - 2 * Math.PI / wave.wavelength * atom.pos.x;
                    y += wave.amplitude * Math.sin(theta);
                    x += wave.amplitude * Math.cos(theta);
                }
                atom.pos.y = this.options.top - y;
                atom.draw(context);
                if (x < 0) {
                    atom.opacity += (0.3 - atom.opacity * this.alpha) / 1.1;
                    atom.opacity *= this.alpha;
                }
                else
                    atom.opacity = 1 * this.alpha;
            }
            for (var i = 0; i < this.waves.length; i++) {
                this.waves[i].time = (this.waves[i].time + this.waves[i].increment) % (Math.floor(this.options.width / 250 + 1) * 10);
            }
        };
        WaveAnimation.default = {
            atomOptions: Atom.default,
            scale: 1,
            waveCollection: [],
            top: 100,
            width: 1000,
        };
        return WaveAnimation;
    }());
    ParticleJSAnimations.WaveAnimation = WaveAnimation;
})(ParticleJSAnimations || (ParticleJSAnimations = {}));
var CanvasCommand;
(function (CanvasCommand) {
    CanvasCommand["Move"] = "moveTo";
    CanvasCommand["Line"] = "lineTo";
    CanvasCommand["BezierCurve"] = "bezierCurveTo";
    CanvasCommand["QuadraticCurve"] = "quadraticCurveTo";
    CanvasCommand["EllipticalArc"] = "arc";
    CanvasCommand["Save"] = "save";
    CanvasCommand["Translate"] = "translate";
    CanvasCommand["Rotate"] = "rotate";
    CanvasCommand["Scale"] = "scale";
    CanvasCommand["Restore"] = "restore";
    CanvasCommand["ClosePath"] = "closePath";
})(CanvasCommand || (CanvasCommand = {}));
var RegexPatterns;
(function (RegexPatterns) {
    RegexPatterns[RegexPatterns["Num"] = 0] = "Num";
    RegexPatterns[RegexPatterns["Flag"] = 1] = "Flag";
    RegexPatterns[RegexPatterns["WS"] = 2] = "WS";
    RegexPatterns[RegexPatterns["Commands"] = 3] = "Commands";
})(RegexPatterns || (RegexPatterns = {}));
var SVGPath = (function () {
    function SVGPath(d) {
        this.paths = [];
        this.parseError = false;
        this.paths = this.ParsePath2D(d);
    }
    SVGPath.relToAbs = function (rel, args) {
        for (var i = 0; i < args.length; i++)
            args[i] += i % 2 == 0 ? rel.x : rel.y;
    };
    SVGPath.prototype.ParsePath2D = function (d) {
        var match;
        var commandList = [];
        var pathList = [];
        var matchPattern = function (p, flags) {
            var m;
            if ((m = d.match(new RegExp("^" + SVGPath.Patterns[p], flags))) !== null) {
                d = d.substr(m[0].length);
                parserPos += m[0].length;
                match = m;
            }
            else if ((m = d.match(new RegExp("^" + SVGPath.Patterns[RegexPatterns.Num], flags))) !== null) {
                match = [commandList[commandList.length - 1].command];
            }
            else
                match = null;
            return match !== null;
        };
        var p = "";
        var parserPos = 0;
        var ctxPos = {
            x: 0,
            y: 0
        };
        var drawOrigin = {
            x: 0,
            y: 0
        };
        while (d.length > 0) {
            matchPattern(RegexPatterns.WS);
            if (matchPattern(RegexPatterns.Commands)) {
                var cmd = match[0];
                var relative = cmd.toLowerCase() === cmd;
                var signature = SVGPath.Signatures[cmd.toUpperCase()];
                var pattern = signature.regexPattern;
                var _args = null;
                p += " " + cmd;
                var svgCmd = {
                    command: match[0],
                    args: [],
                };
                var canvasCmd = {
                    f: signature.canvasCommand,
                    args: [],
                    from: {
                        x: 0,
                        y: 0
                    }
                };
                for (var i = 0; i < pattern.length; i++) {
                    matchPattern(RegexPatterns.WS);
                    if (matchPattern(pattern[i])) {
                        svgCmd.args.push(pattern[i] === RegexPatterns.Num ? parseFloat(match[0]) : parseInt(match[0]));
                    }
                    else {
                        this.parseError = true;
                        console.error("Error parsing svg path at " + parserPos);
                        return pathList;
                    }
                }
                p += " " + svgCmd.args.join(" ");
                if (pathList.length > 1 && ((cmd.toUpperCase() == "S" && "cCsS".indexOf(commandList[commandList.length - 1].command) !== -1) || (cmd.toUpperCase() == "T" && "qQtT".indexOf(commandList[commandList.length - 1].command) !== -1))) {
                    _args = pathList[pathList.length - 1].args;
                }
                commandList.push(svgCmd);
                pathList.push.apply(pathList, signature.toCanvas(ctxPos, relative, cmd.toUpperCase() == "Z" ? [drawOrigin.x, drawOrigin.y] : svgCmd.args, _args));
                if (cmd.toUpperCase() == "M") {
                    drawOrigin.x = pathList[pathList.length - 1].args[0];
                    drawOrigin.y = pathList[pathList.length - 1].args[1];
                }
            }
            else if (d.length > 0) {
                this.parseError = true;
                console.error("Error parsing svg path at " + parserPos);
                break;
            }
        }
        return pathList;
    };
    SVGPath.parseEllipticalArc = function (x1, r, phi, fA, fS, x2) {
        function mag(v) {
            return Math.sqrt(Math.pow(v.x, 2) + Math.pow(v.y, 2));
        }
        function dot(u, v) {
            return (u.x * v.x + u.y * v.y);
        }
        function ratio(u, v) {
            return dot(u, v) / (mag(u) * mag(v));
        }
        function clamp(value, min, max) {
            return Math.min(Math.max(value, min), max);
        }
        function angle(u, v) {
            var sign = 1.0;
            if ((u.x * v.y - u.y * v.x) < 0) {
                sign = -1.0;
            }
            return sign * Math.acos(clamp(ratio(u, v), -1, 1));
        }
        function rotClockwise(v, angle) {
            var cost = Math.cos(angle);
            var sint = Math.sin(angle);
            return { x: cost * v.x + sint * v.y, y: -1 * sint * v.x + cost * v.y };
        }
        function rotCounterClockwise(v, angle) {
            var cost = Math.cos(angle);
            var sint = Math.sin(angle);
            return { x: cost * v.x - sint * v.y, y: sint * v.x + cost * v.y };
        }
        function midPoint(u, v) {
            return { x: (u.x - v.x) / 2.0, y: (u.y - v.y) / 2.0 };
        }
        function meanVec(u, v) {
            return { x: (u.x + v.x) / 2.0, y: (u.y + v.y) / 2.0 };
        }
        function pointMul(u, v) {
            return { x: u.x * v.x, y: u.y * v.y };
        }
        function scale(c, v) {
            return { x: c * v.x, y: c * v.y };
        }
        function sum(u, v) {
            return { x: u.x + v.x, y: u.y + v.y };
        }
        // Convert from endpoint to center parametrization, as detailed in:
        //   http://www.w3.org/TR/SVG/implnote.html#ArcImplementationNotes
        if (r.x == 0 || r.y == 0) {
            var from = { x: x1.x, y: x1.y };
            return [{ f: CanvasCommand.Line, args: [x2.x, x2.y], from: from }];
        }
        var phi = phi * (Math.PI / 180.0);
        r.x = Math.abs(r.x);
        r.y = Math.abs(r.y);
        var xPrime = rotClockwise(midPoint(x1, x2), phi); // F.6.5.1
        var xPrime2 = pointMul(xPrime, xPrime);
        var r2 = { x: Math.pow(r.x, 2), y: Math.pow(r.y, 2) };
        var lambda = Math.sqrt(xPrime2.x / r2.x + xPrime2.y / r2.y);
        if (lambda > 1) {
            r.x *= lambda;
            r.y *= lambda;
            r2.x = Math.pow(r.x, 2);
            r2.y = Math.pow(r.y, 2);
        }
        var factor = Math.sqrt(Math.abs(r2.x * r2.y - r2.x * xPrime2.y - r2.y * xPrime2.x) / (r2.x * xPrime2.y + r2.y * xPrime2.x));
        if (fA == fS) {
            factor *= -1.0;
        }
        var cPrime = scale(factor, { x: r.x * xPrime.y / r.y, y: -r.y * xPrime.x / r.x }); // F.6.5.2
        var c = sum(rotCounterClockwise(cPrime, phi), meanVec(x1, x2)); // F.6.5.3
        var x1UnitVector = { x: (xPrime.x - cPrime.x) / r.x, y: (xPrime.y - cPrime.y) / r.y };
        var x2UnitVector = { x: (-1.0 * xPrime.x - cPrime.x) / r.x, y: (-1.0 * xPrime.y - cPrime.y) / r.y };
        var theta = angle({ x: 1, y: 0 }, x1UnitVector); // F.6.5.5
        var deltaTheta = angle(x1UnitVector, x2UnitVector); // F.6.5.6
        var start = theta;
        var end = theta + deltaTheta;
        return [
            { f: CanvasCommand.Save, args: [], from: from },
            { f: CanvasCommand.Translate, args: [c.x, c.y], from: from },
            { f: CanvasCommand.Rotate, args: [phi], from: from },
            { f: CanvasCommand.Scale, args: [r.x, r.y], from: from },
            { f: CanvasCommand.EllipticalArc, args: [0, 0, 1, start, end, 1 - fS], from: from },
            { f: CanvasCommand.Restore, args: [], from: from }
        ];
    };
    SVGPath.prototype.draw = function (ctx) {
        for (var i = 0; i < this.paths.length; i++) {
            ctx[this.paths[i].f].apply(ctx, this.paths[i].args);
        }
    };
    SVGPath.Patterns = ["(-?(?:[0-9]*)?(?:[.])?[0-9]+)", "([01])", "(?:[,]|[\n \t]*)?", "([MmLlHhVvCcSsQqTtAaZz])"];
    SVGPath.Signatures = {
        // Mm (x y)+
        "M": {
            toCanvas: function (pos, relative, args) {
                var args = args.slice();
                if (relative)
                    SVGPath.relToAbs(pos, args);
                var from = {
                    x: pos.x,
                    y: pos.y
                };
                pos.x = args[0];
                pos.y = args[1];
                return [{
                        f: CanvasCommand.Move,
                        args: args,
                        from: from
                    }];
            },
            regexPattern: [RegexPatterns.Num, RegexPatterns.Num]
        },
        // Ll (x y)+
        "L": {
            toCanvas: function (pos, relative, args) {
                var args = args.slice();
                if (relative)
                    SVGPath.relToAbs(pos, args);
                var from = {
                    x: pos.x,
                    y: pos.y
                };
                pos.x = args[0];
                pos.y = args[1];
                return [{
                        f: CanvasCommand.Line,
                        args: args,
                        from: from
                    }];
            },
            regexPattern: [RegexPatterns.Num, RegexPatterns.Num]
        },
        // Hh x+
        "H": {
            toCanvas: function (pos, relative, args) {
                var args = args.slice();
                if (relative)
                    args[0] += pos.x;
                args.push(pos.y);
                var from = {
                    x: pos.x,
                    y: pos.y
                };
                pos.x = args[0];
                pos.y = pos.y;
                return [{
                        f: CanvasCommand.Line,
                        args: args,
                        from: from
                    }];
            },
            regexPattern: [RegexPatterns.Num],
        },
        // Vv y+
        "V": {
            toCanvas: function (pos, relative, args) {
                var args = args.slice();
                args.unshift(pos.x);
                if (relative)
                    args[1] += pos.y;
                var from = {
                    x: pos.x,
                    y: pos.y
                };
                pos.x = pos.x;
                pos.y = args[1];
                return [{
                        f: CanvasCommand.Line,
                        args: args,
                        from: from
                    }];
            },
            regexPattern: [RegexPatterns.Num],
        },
        // Cc (x1 y1 x2 y2 x y)+
        "C": {
            toCanvas: function (pos, relative, args) {
                var args = args.slice();
                if (relative)
                    SVGPath.relToAbs(pos, args);
                var from = {
                    x: pos.x,
                    y: pos.y
                };
                pos.x = args[4];
                pos.y = args[5];
                return [{
                        f: CanvasCommand.BezierCurve,
                        args: args,
                        from: from
                    }];
            },
            regexPattern: [RegexPatterns.Num, RegexPatterns.Num, RegexPatterns.Num, RegexPatterns.Num, RegexPatterns.Num, RegexPatterns.Num],
        },
        // Ss (x2 y2 x y)+
        "S": {
            toCanvas: function (pos, relative, args, _args) {
                var args = args.slice();
                if (relative)
                    SVGPath.relToAbs(pos, args);
                var cp1 = {
                    x: pos.x,
                    y: pos.y
                };
                if (_args) {
                    cp1.x = 2 * pos.x - _args[2];
                    cp1.y = 2 * pos.y - _args[3];
                }
                args.unshift(cp1.y);
                args.unshift(cp1.x);
                var from = {
                    x: pos.x,
                    y: pos.y
                };
                pos.x = args[4];
                pos.y = args[5];
                return [{
                        f: CanvasCommand.BezierCurve,
                        args: args,
                        from: from
                    }];
            },
            regexPattern: [RegexPatterns.Num, RegexPatterns.Num, RegexPatterns.Num, RegexPatterns.Num],
        },
        // Qq (x1 y1 x y)+
        "Q": {
            toCanvas: function (pos, relative, args) {
                var args = args.slice();
                if (relative)
                    SVGPath.relToAbs(pos, args);
                var from = {
                    x: pos.x,
                    y: pos.y
                };
                pos.x = args[2];
                pos.y = args[3];
                return [{
                        f: CanvasCommand.QuadraticCurve,
                        args: args,
                        from: from
                    }];
            },
            regexPattern: [RegexPatterns.Num, RegexPatterns.Num, RegexPatterns.Num, RegexPatterns.Num],
        },
        // Tt (x y)+
        "T": {
            toCanvas: function (pos, relative, args, _args) {
                var args = args.slice();
                if (relative)
                    SVGPath.relToAbs(pos, args);
                var cp1 = {
                    x: pos.x,
                    y: pos.y
                };
                if (_args) {
                    cp1.x = 2 * pos.x - _args[0];
                    cp1.y = 2 * pos.y - _args[1];
                }
                args.unshift(cp1.y);
                args.unshift(cp1.x);
                var from = {
                    x: pos.x,
                    y: pos.y
                };
                pos.x = args[2];
                pos.y = args[3];
                return [{
                        f: CanvasCommand.QuadraticCurve,
                        args: args,
                        from: from
                    }];
            },
            regexPattern: [RegexPatterns.Num, RegexPatterns.Num],
        },
        // Aa (r.x r.y x-axis-rotation large-arc-flag sweep-flag x y)+
        "A": {
            toCanvas: function (pos, relative, args) {
                var args = args.slice();
                if (relative) {
                    args[5] += pos.x;
                    args[6] += pos.y;
                }
                var pathElements = SVGPath.parseEllipticalArc(pos, { x: args[0], y: args[1] }, args[2], args[3], args[4], {
                    x: args[5],
                    y: args[6]
                });
                pos.x = args[5];
                pos.y = args[6];
                return pathElements;
            },
            regexPattern: [RegexPatterns.Num, RegexPatterns.Num, RegexPatterns.Num, RegexPatterns.Flag, RegexPatterns.Flag, RegexPatterns.Num, RegexPatterns.Num],
        },
        // Zz
        "Z": {
            toCanvas: function (pos, relative, args) {
                var from = {
                    x: pos.x,
                    y: pos.y
                };
                pos.x = args[0];
                pos.y = args[1];
                return [{
                        f: CanvasCommand.Line,
                        args: args,
                        from: from
                    }];
            },
            regexPattern: []
        },
    };
    return SVGPath;
}());
//# sourceMappingURL=particle.js.map