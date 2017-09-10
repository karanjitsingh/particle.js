class ParticleJS {

    public static default: ParticleJSOptions = {
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
    
    constructor(canvas: HTMLCanvasElement, drawObjectCollection?: Array<DrawObject>, options?: ParticleJSOptions) {
        this.W = canvas.width;
        this.H = canvas.height;
        this.paths = [];
        this.ctx = canvas.getContext('2d');
        this.options = <ParticleJSOptions>generateOptions(options, ParticleJS.default);

        this.DrawObjectCollection = drawObjectCollection || [];
        
        window.addEventListener("mousemove", (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
        
        this.particles = [];
    }
    
    public addDrawObject(drawObject:DrawObject) {
        this.DrawObjectCollection.push(drawObject);
    }

    public removeDrawObject(drawObject:DrawObject): Array<Atom> {
        for(var i=0;i<this.DrawObjectCollection.length;i++) {
            if(this.DrawObjectCollection[i] == drawObject) {
                var drawObject:DrawObject = this.DrawObjectCollection.splice(i,1)[0];
                return drawObject.dispose();
            }
        }
        return null;
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