/* TODO
 * readjustable atoms
 */

module ParticleJSAnimations {
    interface PathObject {
        nthPoint: (n: number) => Point,
        length: number,
    }
    
    export interface SVGAnimationOptions {
        atomOptions: AtomDrawOptions
        pathVariation: number,
        lineDensity: number,
        scale: number,
        blur: boolean,
        mouseRepel: boolean,
        forceFactor: number,
        maxRepelDistance: number,
        minBlurDistance: number,
        maxBlurDistance: number,
        marginBlurDistance: number,
        gravity: number,
        frictionFactor: number,
        connectingLines: boolean,
        connectingLineWidth: number,
        connectingLineOpacity: number,
        connectingLineColor: string,
    }
    
    
    export class SVGAnimation implements DrawObject {
        
        public static default:ParticleJSAnimations.SVGAnimationOptions = {
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
        }
        
        public options: SVGAnimationOptions;
        public offset: Point = {x:0, y:0};
        public alpha: number = 1;
        private atomSet: Array<Atom> = [];
        private pathObjects: Array<PathObject>;
        private firstDraw: boolean = true;
        
        constructor(path2d: string, options?: SVGAnimationOptions) {
            this.options = <SVGAnimationOptions>generateOptions(options, SVGAnimation.default);
            var path = (new SVGPath(path2d)).paths;
            this.GeneratePathObjects(path);
            this.GenerateAtomSet();
        }
        
        private GeneratePathObjects(path: Array<CanvasPathElement>) {
            
            this.pathObjects = [];
            var ctx: CanvasRenderingContext2D;
            
            for(var i=0; i<path.length; i++) {
                switch(path[i].f) {
                    case CanvasCommand.Line:
                        this.pathObjects.push(new SVGAnimation.Shapes.Line(path[i].from.x, path[i].from.y, path[i].args[0], path[i].args[1], this.options.scale));
                        break;
                    case CanvasCommand.EllipticalArc:
                        var args = path[i].args;
                        var pos = path[i-3].args;
                        var rotate = path[i-2].args[0];
                        var size = path[i-1].args;
                        var angle = path[i].args;
                        
                        this.pathObjects.push(new SVGAnimation.Shapes.Arc(pos[0], pos[1], size[0]*2, size[1]*2, angle[3], angle[4], rotate, this.options.scale));
                        break;
                    case CanvasCommand.BezierCurve:
                        var args = path[i].args;
                        this.pathObjects.push(new SVGAnimation.Shapes.BezierCurve({x: path[i].from.x, y: path[i].from.y}, {x: args[0], y: args[1]}, {x: args[2], y: args[3]}, {x: args[4], y: args[5]}, this.options.scale));
                        break;
                    case CanvasCommand.QuadraticCurve:
                        var args = path[i].args;
                        this.pathObjects.push(new SVGAnimation.Shapes.QuadraticCurve({x: path[i].from.x, y: path[i].from.y}, {x: args[0], y: args[1]}, {x: args[2], y: args[3]}, this.options.scale));
                        break;
                    default:
                }
            }
        }
        
        private GenerateAtomSet() {
            var density = this.options.lineDensity;
            
            var length = 0;
            for (var i = 0; i < this.pathObjects.length; i++)
                length += this.pathObjects[i].length;
            
            for (var i = 0; i < this.pathObjects.length; i++) {
                
                var bpl = Math.floor(this.pathObjects[i].length * density);
                
                for (var j = 0; j < bpl; j++) {
                    
                    var options: AtomDrawOptions;       
                    var pos = this.pathObjects[i].nthPoint(j / bpl);
                    var atom = new Atom(
                        j,
                        { x:0, y:0 },
                        {
                            x: this.options.pathVariation * (0.5 - Math.random()) + pos.x,
                            y: this.options.pathVariation * (0.5 - Math.random()) + pos.y
                        },
                        1,
                        this.options.atomOptions
                    );
                    
                    this.atomSet.push(atom);
                }
            }    
        }
        
        private static Shapes = class {
            public static Line = class implements PathObject {
                private start: Point;
                private ck: number;
                private sk: number;
                public length: number;
                
                constructor(x1, y1, x2, y2, scale) {
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
                        theta = Math.PI / 2
                    
                    this.length = Math.sqrt(Math.pow(xdiff, 2) + Math.pow(ydiff, 2));
                    
                    this.ck = this.length * Math.cos(theta) * (x1 > x2 ? -1 : 1);
                    this.sk = this.length * Math.sin(theta) * (x1 > x2 || (x1 == x2 && y1 > y2) ? -1 : 1);
                    
                    this.start = {
                        x: x1,
                        y: y1
                    }
                }
                public nthPoint(n: number): Point {
                    return {x: this.start.x + n * this.ck, y:this.start.y + n * this.sk}
                }
            }
            
            
            public static Arc = class implements PathObject {
                
                private x: number;
                private y: number;
                private h: number;
                private w:number;
                private sa: number;
                private ea: number;
                private theta: number;
                private phi: number;
                public length: number;                
                
                constructor(x, y, w, h, sa, ea, phi, scale) {
                    this.x = x * scale,
                    this.y = y * scale,
                    this.w = w * scale,
                    this.h = h * scale
                    
                    this.sa = sa;
                    this.ea = ea;
                    this.theta = this.ea - this.sa;
                    
                    this.phi = phi;
                    
                    if (this.theta < 0)
                        this.theta = (2 * Math.PI + this.theta);
                    
                    this.length = ( 1.111 * ( Math.sqrt(
                        Math.pow(this.w / 2 * (Math.cos(this.sa) - Math.cos(this.ea) ), 2) +
                        Math.pow(this.h / 2 * (Math.sin(this.sa) - Math.sin(this.ea) ), 2)
                    )));
                }
                
                public nthPoint(n: number): Point {
                    function rotate(cx, cy, p, theta) {
                        var pPrime = {x:0, y:0};
                        pPrime.x = (p.x - cx) * Math.cos(theta) - (p.y - cy) * Math.sin(theta) + cx;
                        pPrime.y = (p.x - cx) * Math.sin(theta) + (p.y - cy) * Math.cos(theta) + cy;
                        return pPrime;
                    }
                    
                    var getPoint = (n) => {
                        return {
                            x: this.x + this.w / 2 * Math.cos(this.sa + n * this.theta),
                            y: this.y + this.h / 2 * Math.sin(this.sa + n * this.theta)
                        };
                    };
                    
                    return this.phi ? rotate(this.x, this.y, getPoint(n), this.phi) : getPoint(n);
                    
                }
                
            }
            
            public static BezierCurve = class implements PathObject {
                public length: number;
                private p1: Point;
                private p2: Point;
                private p3: Point;
                private p4: Point;
                
                constructor(p1: Point, p2: Point, p3: Point, p4: Point, scale: number) {
                    this.p1 = {x: p1.x * scale, y:p1.y * scale};
                    this.p2 = {x: p2.x * scale, y:p2.y * scale};
                    this.p3 = {x: p3.x * scale, y:p3.y * scale};
                    this.p4 = {x: p4.x * scale, y:p4.y * scale};
                    
                    this.length=0;

                    var distance = (a,b) => Math.sqrt(Math.pow(Math.abs(a.x - b.x),2) + Math.pow(Math.abs(a.y - b.y),2));

                    var p1 = {
                        x: this.p1.x,
                        y: this.p1.y
                    }

                    for(var i=0.01;i<=1;i+=0.01) {
                        p2 = this.nthPoint(i);
                        this.length += distance(p1, p2);
                        p1 = p2;
                    }
                }
                
                public nthPoint(n: number): Point {
                    
                    var a = (1-n), a2 = a*a, a3 = a2*a;
                    var b = n, b2 = b*b, b3 = b2*b;

                    return {
                        x: a3*this.p1.x + 3*b*a2*this.p2.x + 3*b2*a*this.p3.x +b3*this.p4.x,
                        y: a3*this.p1.y + 3*b*a2*this.p2.y + 3*b2*a*this.p3.y +b3*this.p4.y
                    };
                }
                
            }
            
            public static QuadraticCurve = class implements PathObject {
                public length: number;
                private p1: Point;
                private p2: Point;
                private p3: Point;
                
                constructor(p1: Point, p2: Point, p3: Point, scale: number) {
                    this.p1 = {x: p1.x * scale, y:p1.y * scale};
                    this.p2 = {x: p2.x * scale, y:p2.y * scale};
                    this.p3 = {x: p3.x * scale, y:p3.y * scale};
                    
                    this.length=0;

                    var distance = (a,b) => Math.sqrt(Math.pow(Math.abs(a.x - b.x),2) + Math.pow(Math.abs(a.y - b.y),2));

                    var p1 = {
                        x: this.p1.x,
                        y: this.p1.y
                    }

                    for(var i=0.01;i<=1;i+=0.01) {
                        p2 = this.nthPoint(i);
                        this.length += distance(p1, p2);
                        p1 = p2;
                    }
                }
                
                public nthPoint(n: number): Point {
                    
                    var a = (1-n), a2 = a*a;
                    var b = n, b2 = b*b;

                    return {
                        x: a2*this.p1.x + 2*b*a*this.p2.x + b2*this.p3.x,
                        y: a2*this.p1.y + 2*b*a*this.p2.y + b2*this.p3.y
                    };
                }
                
            }
        }
        
        public draw(context: ParticleJSContext) {


            
            if(this.firstDraw || !this.options.mouseRepel) {
                this.firstDraw = false;
                for(var i=0, atom:Atom=this.atomSet[i]; i<this.atomSet.length; i++,atom=this.atomSet[i]) { 
                    var origin: Point = {x: atom.origin.x + this.offset.x, y: atom.origin.y + this.offset.y};            
                    atom.pos.x = origin.x;
                    atom.pos.y = origin.y;
                    atom.opacity = this.alpha;
                    atom.draw(context);

                }
                return;
            }

            var mouse = context.mousePosition;
            
            for(var i=0, atom:Atom=this.atomSet[i]; i<this.atomSet.length; i++,atom=this.atomSet[i]) {
                
                var origin: Point = {x: atom.origin.x + this.offset.x, y: atom.origin.y + this.offset.y};

                atom.pos.x += atom.speed.x;
                atom.pos.y += atom.speed.y;

                atom.opacity = this.alpha;
                
                if (!atom.animationDone) {
                    atom.pos.x += (origin.x - atom.pos.x) / 2;
                    atom.pos.y += (origin.y - atom.pos.y) / 2;
                    
                    if (Math.abs(atom.pos.x - origin.x) < 0.1 && Math.abs(atom.pos.y - origin.y) < 0.1) {
                        atom.animationDone = true;
                    }
                }
                
                var posWRTMouse = {
                    x: atom.pos.x - mouse.x,
                    y: atom.pos.y - mouse.y
                };
                
                var posWRTOrigin = {
                    x: atom.pos.x - origin.x,
                    y: atom.pos.y - origin.y
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
                
                var force = (this.options.maxRepelDistance - distance) / this.options.maxRepelDistance;
                var gravity = -distance2 / this.options.gravity;
                gravity = Math.abs(gravity) > 0.1 ? -0.1 : gravity;
                
                
                if (force < 0) force = 0;
                
                
                if (isNaN(atom.speed.x))
                    atom.speed.x = 0;
                if (isNaN(atom.speed.y))
                    atom.speed.y = 0;
                
                atom.speed.x += forceDirection.x * force * context.options.animationInterval / this.options.forceFactor + gravityDirection.x * gravity * context.options.animationInterval;
                atom.speed.y += forceDirection.y * force * context.options.animationInterval / this.options.forceFactor + gravityDirection.y * gravity * context.options.animationInterval;
                
                
                atom.speed.y *= this.options.frictionFactor;
                atom.speed.x *= this.options.frictionFactor;
                
                if (distance2 <= this.options.minBlurDistance)
                    atom.blurRadius = 0;
                else if (distance2 <= this.options.maxRepelDistance)
                    atom.blurRadius = (distance2 - this.options.minBlurDistance) / this.options.marginBlurDistance * 0.4;
                else
                    atom.blurRadius = 0.4;
                
                atom.draw(context);

                if(this.options.connectingLines) {
                    var ctx = context.canvasContext;
                
                    ctx.beginPath();
                    ctx.lineWidth = this.options.connectingLineWidth;

                    var opacity = this.options.connectingLineOpacity;

                    ctx.moveTo(atom.pos.x, atom.pos.y);
                    if (i + 1 < this.atomSet.length) {
                        ctx.lineTo(this.atomSet[i+1].pos.x, this.atomSet[i+1].pos.y);

                        var d = Math.sqrt(Math.pow(this.atomSet[i+1].pos.x - atom.pos.x, 2) + Math.pow(this.atomSet[i+1].pos.y - atom.pos.y, 2));
                        var d2 = Math.sqrt(Math.pow(this.atomSet[i+1].origin.x - atom.origin.x, 2) + Math.pow(this.atomSet[i+1].origin.y - atom.origin.y, 2))
                        if (d <= d2)
                            opacity = 0.5
                        else if (d <= d2 + 15) {
                            opacity = (d2 + 15 - d) / 15 * 0.5;
                        }
                        else
                            opacity = 0;
                    }
                    ctx.strokeStyle = HEXAtoRGBA(this.options.connectingLineColor, opacity)
                    ctx.stroke();
                    ctx.closePath();
                }
                
            }
        }
    }
}