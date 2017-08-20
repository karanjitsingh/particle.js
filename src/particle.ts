
// interface AtomDrawOptions {
//     pop: true,
//     popRadius: 4,
//     popProbability: 0.001,
//     radius: 2,
//     colorSet: ["#E04836", "#F39D41", "#DDDDDD", "#5696BC"],
//     particleRadius: 2,
//     radiusVariation: 0,
// }

// interface ParticleJSOptions {
//     drawCanvasBackground: true,
//     canvasBGColor: "#ffffff",
//     animationInterval: 30
//     beforeDraw?: (ctx: CanvasRenderingContext2D) => void,
//     afterDraw?: (ctx: CanvasRenderingContext2D) => void
// }

class Atom implements DrawObject {
 
    private static default: AtomDrawOptions = {
        pop: true,
        popRadius: 4,
        popProbability: 0.001,
        radius: 2,
        colorSet: ["#E04836", "#F39D41", "#DDDDDD", "#5696BC"],
        particleRadius: 2,
        radiusVariation: 0,
    }

    private id: number;
    private random: number;
    private _opacity: number;
    private _radius: number;
    
    public radius: number;
    public origin: Point;
    public speed: Point;
    public opacity: number;
    public pos: Point;
    public options: AtomDrawOptions;
    public animationDone = true;
    public blurRadius = 0;
    
    // No idea what to do with these
    private radiusLag = 1;
    private e = 0.8;
    private animateOpacity = true;
    
    constructor(id: number, speed?: Point, position?: Point, opacity?: number, options: AtomDrawOptions = Atom.default) {
        this.id = id;
        this.options = options;
        this.radius = this._radius = this.options.radius;
        this.opacity = this._opacity = opacity || 1;
        this.speed = speed || { x:0, y:0 };
        this.pos = position ? {x: position.x, y:position.y} : { x:0, y:0 };
        this.origin = position ? {x: position.x, y:position.y} : { x:0, y:0 };
        
    }
    
    public draw(context: ParticleJSContext) {

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

class ParticleJS {

    private static default: ParticleJSOptions = {
        drawCanvasBackground: true,
        canvasBGColor: "#ffffff",
        animationInterval: 30
    }

    private ctx: CanvasRenderingContext2D;
    private paths;
    private W: number;
    private H: number;
    private timer: number;
    private particles: Array<Atom>;
    private options: ParticleJSOptions;
    private DrawObjectCollection: Array<DrawObject>;

    public mouse: Point = {
        x: NaN,
        y: NaN
    };
    
    constructor(canvas: HTMLCanvasElement, drawObjectCollection?: Array<DrawObject>, options: ParticleJSOptions = ParticleJS.default) {
        this.W = canvas.width;
        this.H = canvas.height;
        this.paths = [];
        this.ctx = canvas.getContext('2d');
        this.options = options;

        this.DrawObjectCollection = drawObjectCollection || [];
        
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
    
    public addDrawObject(drawObject:DrawObject) {
        this.DrawObjectCollection.push(drawObject);
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
            this.DrawObjectCollection[i].draw(<ParticleJSContext> {
                canvasContext: this.ctx,
                mousePosition: this.mouse,
                canvasHeight: this.H,
                canvasWidth: this.W,
                options: this.options
            });
        
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