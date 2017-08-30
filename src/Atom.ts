
class Atom implements DrawObject {
    
       public static default: AtomDrawOptions = {
           pop: true,
           popRadius: 4,
           popProbability: 0.001,
           radius: 2,
           colorSet: ["#E04836", "#F39D41", "#DDDDDD"],
           particleRadius: 2,
           radiusVariation: 0,
           blur: true
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
       private animateOpacity = true;
       
       constructor(id: number, speed?: Point, position?: Point, opacity?: number, options?: AtomDrawOptions) {
           this.id = id;
           this.options = <AtomDrawOptions>generateOptions(options, Atom.default);
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
           
           if (this.blurRadius == 0 || !this.options.blur) {
            ctx.fillStyle = HEXAtoRGBA(colorSet[this.id % colorSet.length], this.opacity);
            ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);
           }
           else {
               var radgrad = ctx.createRadialGradient(this.pos.x, this.pos.y, this.radius, this.pos.x, this.pos.y, this.radius + this.blurRadius * 30);
               
               radgrad.addColorStop(0, HEXAtoRGBA(colorSet[this.id % colorSet.length], this.opacity));
               radgrad.addColorStop(1, HEXAtoRGBA(colorSet[this.id % colorSet.length], 0));
               
               ctx.fillStyle = radgrad;
               ctx.arc(this.pos.x, this.pos.y, this.radius + this.blurRadius * 30, Math.PI * 2, 0, false);
               
           }
           
           ctx.fill();
           
           ctx.closePath();
       }
   }