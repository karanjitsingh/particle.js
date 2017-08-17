class Atom implements DrawObject {
    
    private id: number;
    private random: number;
    private speed: Point = { x:0, y:0 };
    private origin: Point = { x:0, y:0 };
    private opacity: number;
    private _opacity: number;
    private radius: number;
    private _radius: number;
    private pos: Point = { x:0, y:0 };
    
    public options: AtomDrawOptions;
    
    // No idea what to do with these
    private radiusLag = 1;
    private e = 0.8;
    private animateOpacity = true;
    private animationDone = true;
    private blurRadius = 0;
    
    constructor(options?: AtomDrawOptions) {
        this.options = options;
        this.radius = this._radius = this.options.radius;
        this.opacity = this._opacity = 1
    }
    
    public draw(ctx: CanvasRenderingContext2D) {
        
        if (this.options.pop) {
            if (this.radius < 0.001 + this.options.radius) {
                if (Math.random() < this.options.popFrequency) {
                    this.radius += Math.random() * (this.options.popRadius - this.options.radius);
                    this.radiusLag = Math.random() * 12 + 12;
                }
            }
            else
                this.radius += (this.options.radius - this.radius) / this.radiusLag;
        }
        
        if (this.animateOpacity)
            this.opacity += (this._opacity - this.opacity) / 6;
        
        
        ctx.beginPath();
        
        var colorSet = this.options.colorSet;
        
        // if (this.blurRadius == 0 || !Particles.animations.params.blur) {
            ctx.fillStyle = HEXAtoRGBA(colorSet[this.id % colorSet.length], this.opacity);
            ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);
        // }
        // else {
        //     var radgrad = ctx.createRadialGradient(this.x, this.y, this.radius, this.x, this.y, this.radius + this.blurRadius * 30);
            
        //     radgrad.addColorStop(0, HEXAtoRGBA(popColors[this.i % popColors.length], this.opacity));
        //     radgrad.addColorStop(1, HEXAtoRGBA(popColors[this.i % popColors.length], 0));
            
        //     ctx.fillStyle = radgrad;
        //     ctx.arc(this.x, this.y, this.radius + this.blurRadius * 30, Math.PI * 2, false);
            
        // }
        
        ctx.fill();
        
        ctx.closePath();
    }
}

class SVGDrawObject implements DrawObject {
    
    public options: SVGDrawOptions;
    public offset: Point = {x:0, y:0};
    
    private static Shapes = class {
        public Line = class implements SVGPathShape {
            private start: Point;
            private ck: number;
            private sk: number;
            
            public length: number;
            
            constructor(x1, y1, x2, y2) {
                // x1 *= this.options.scale;
                // y1 *= this.options.scale;
                // x2 *= this.options.scale;
                // y2 *= this.options.scale;
                
                var theta;
                
                x1 = x1 < x2 ? x1 : x2;
                x2 = x1 < x2 ? x2 : x1;
                y1 = x1 < x2 ? y1 : y2;
                y2 = x1 < x2 ? y2 : y1;
                if (x1 - x2 != 0)
                    theta = Math.atan((y1 - y2) / (x1 - x2));
                else
                    theta = Math.PI / 2
                
                this.length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
                
                this.ck = this.length * Math.cos(theta);
                this.sk = this.length * Math.sin(theta);
                
                this.start = {
                    x: x1,
                    y: y1
                }
            }
            
            public nthPoint(n: number): Point {
                return {x: this.start.x + n * this.ck, y:this.start.y + n * this.sk}
            }
        }
        
        public Arc = class implements SVGPathShape {      
            public length: number;
            
            constructor(x, y, r, sa, ea) {
                
            }
            
            public nthPoint(n: number): Point {
                return;
            }
            
        }
        
        public BezierCurve = class implements SVGPathShape {
            public length: number;
            
            constructor(x, y, r, sa, ea) {
                
            }
            
            public nthPoint(n: number): Point {
                return;
            }
            
        }
        
        public QuadraticCurve = class implements SVGPathShape {
            public length: number;
            
            constructor(x, y, r, sa, ea) {
                
            }
            
            public nthPoint(n: number): Point {
                return;
            }
            
        }
    }
    
    public draw() {
        // Calculate new positions of all elements
    }
    
}

class ParticleJS {
    private ctx: CanvasRenderingContext2D;
    private paths;
    private W: number;
    private H: number;
    private timer: number;
    private particles: Array<Atom>;
    private options: ParticleJSOptions;
    private DrawObjectCollection: Array<DrawObject>;
    private mouse: Point;
    
    constructor(canvas: HTMLCanvasElement, options?: ParticleJSOptions) {
        this.W = canvas.width;
        this.H = canvas.height;
        this.paths = [];
        this.ctx = canvas.getContext('2d');
        this.options = options;
        
        canvas.onmousemove = (e) => {
            this.mouse.x = e.layerX;
            this.mouse.y = e.layerY;
        }
        
        canvas.onmouseout = (e) => {
            this.mouse.x = NaN;
            this.mouse.y = NaN;
        }
        
        this.particles = [];
    }
    
    public draw() {
        if(this.options.beforeDraw)
            this.options.beforeDraw(this.ctx);
        
        if(this.options.drawCanvasBackground) {
            this.ctx.fillStyle = this.options.canvasBGColor;
            this.ctx.fillRect(0, 0, this.W, this.H);
        }
        else
            this.ctx.clearRect(0, 0, this.W, this.H);
        
        for(var i=0;i<this.DrawObjectCollection.length;i++)
            this.DrawObjectCollection[i].draw(this.ctx);
        
        if(this.options.afterDraw)
            this.options.afterDraw(this.ctx);
    }
    
    public start() {
        this.timer = setInterval(this.draw.bind(this), this.options.animationInterval);
    }
    
    
    public stop() {
        clearTimeout(this.timer);
    }
}


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
        
        this.vx += forceDirection.x * force * this.options.interval / Particles.animations.params.forceFactor + gravityDirection.x * gravity * this.options.interval;
        this.vy += forceDirection.y * force * this.options.interval / Particles.animations.params.forceFactor + gravityDirection.y * gravity * this.options.interval;
        
        
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