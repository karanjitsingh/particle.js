/* TODO
 * options taking default values
 * test all options
 */

module ParticleJSAnimations {
    interface PathObject {
        nthPoint: (n: number) => Point,
        length: number,
    }
    
    export interface SVGDrawOptions {
        atomOptions: AtomDrawOptions
        pathVariation: number,
        lineDensity: number,
        scale: number,
        blur: boolean,
        forceFactor: number,
        maxRepelDistance: number,
        minBlurDistance: number,
        maxBlurDistance: number,
        marginBlurDistance: number,
        gravity: number,
        frictionFactor: number
    }
    
    
    export class ExplodingSVG implements DrawObject {
        
        private static default:ParticleJSAnimations.SVGDrawOptions = {
            atomOptions: {
                pop: true,
                popRadius: 4,
                popProbability: 1000,
                radius: 2,
                colorSet: ["#E04836", "#F39D41", "#DDDDDD", "#5696BC"],
                particleRadius: 2,
                radiusVariation: 0,
            },
            pathVariation: 0,
            lineDensity: 0.5,
            scale: 0.1,
            blur: false,
            forceFactor: 10,
            maxRepelDistance: 100,
            minBlurDistance: 50,
            maxBlurDistance: 200,
            marginBlurDistance: 75,
            gravity: 1000,
            frictionFactor: 0.9
        }
        
        
        public options: SVGDrawOptions;
        public offset: Point = {x:0, y:0};
        private atomSet: Array<Atom> = [];
        private pathObjects: Array<PathObject>;
        
        constructor(path2d: string, options: SVGDrawOptions = ExplodingSVG.default) {
            this.options = options;
            
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
                        this.pathObjects.push(new ExplodingSVG.Shapes.Line(path[i].from.x, path[i].from.y, path[i].args[0], path[i].args[1], this.options.scale));
                        break;
                    case CanvasCommand.EllipticalArc:
                        var args = path[i].args;
                        var pos = path[i-3].args;
                        var rotate = path[i-2].args[0];
                        var size = path[i-1].args;
                        var angle = path[i].args;
                        
                        this.pathObjects.push(new ExplodingSVG.Shapes.Arc(pos[0], pos[1], size[0]*2, size[1]*2, angle[3], angle[4], rotate, this.options.scale));
                        break;
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
                            x: this.options.pathVariation * (0.5 - Math.random()) +  pos.x,
                            y: this.options.pathVariation * (0.5 - Math.random()) + pos.y
                        },
                        1
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
                    x1 = x1 < x2 ? x1 : x2;
                    x2 = x1 < x2 ? x2 : x1;
                    y1 = x1 < x2 ? y1 : y2;
                    y2 = x1 < x2 ? y2 : y1;
                    
                    x1 *= scale;
                    y1 *= scale;
                    x2 *= scale;
                    y2 *= scale;
                    
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
            
            public BezierCurve = class implements PathObject {
                public length: number;
                
                constructor(x1, y1, x2, y2, x, y) {
                }
                
                public nthPoint(n: number): Point {
                    return;
                }
                
            }
            
            public QuadraticCurve = class implements PathObject {
                public length: number;
                
                constructor(x, y, r, sa, ea) {
                    
                }
                
                public nthPoint(n: number): Point {
                    return;
                }
                
            }
        }
        
        public draw(context: ParticleJSContext) {
            
            var mouse = context.mousePosition;
            
            for(var i=0, atom:Atom=this.atomSet[i]; i<this.atomSet.length; i++,atom=this.atomSet[i]) {
                
                atom.pos.x += atom.speed.x;
                atom.pos.y += atom.speed.y;
                
                if (!atom.animationDone) {
                    atom.pos.x += (atom.origin.x - atom.pos.x) / 2;
                    atom.pos.y += (atom.origin.y - atom.pos.y) / 2;
                    
                    if (Math.abs(atom.pos.x - atom.origin.x) < 0.1 && Math.abs(atom.pos.y - atom.origin.y) < 0.1) {
                        atom.animationDone = true;
                    }
                }
                
                
                var posWRTMouse = {
                    x: atom.pos.x - mouse.x,
                    y: atom.pos.y - mouse.y
                };
                
                var posWRTOrigin = {
                    x: atom.pos.x - atom.origin.x,
                    y: atom.pos.y - atom.origin.y
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
                
            }        
        }
        
    }
    
    
}