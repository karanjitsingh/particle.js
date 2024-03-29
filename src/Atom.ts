
class Atom implements DrawObject {
    
    public static default: AtomDrawOptions = {
        pop: true,
        popRadius: 4,
        popProbability: 0.001,
        radius: 2,
        colorSet: ["#E04836", "#F39D41", "#DDDDDD"],
        blur: true,
        defaultScale: 1,
    }
    
    private random: number;
    private radius: number;
    
    public index: number;
    public origin: Point;
    public speed: Point;
    public pos: Point;
    public options: AtomDrawOptions;
    public animationDone = true;
    public blurRadius = 0;
    public opacity;
    public scale: number;
    
    // No idea what to do with these
    private radiusLag = 1;
    private animateOpacity = true;
    
    public dispose(): Array<Atom> {
        return [];
    }
    
    constructor(id: number, speed?: Point, position?: Point, opacity?: number, options?: Partial<AtomDrawOptions>) {
        this.index = id;
        this.options = <AtomDrawOptions>generateOptions(options, Atom.default);
        this.radius = this.options.radius;
        this.opacity = opacity || 1;
        this.speed = speed || { x:0, y:0 };
        this.pos = position ? {x: position.x, y:position.y} : { x:0, y:0 };
        this.origin = position ? {x: position.x, y:position.y} : { x:0, y:0 };
        this.scale = this.options.defaultScale;
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

        ctx.beginPath();
        
        var colorSet = this.options.colorSet;
        
        if (this.blurRadius == 0 || !this.options.blur) {
            ctx.fillStyle = HEXAtoRGBA(colorSet[this.index % colorSet.length], this.opacity);
            ctx.arc(this.pos.x, this.pos.y, this.radius * this.scale, 0, Math.PI * 2);
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
    }
}