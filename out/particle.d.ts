declare class Atom implements DrawObject {
    static default: AtomDrawOptions;
    private random;
    private radius;
    index: number;
    origin: Point;
    speed: Point;
    pos: Point;
    options: AtomDrawOptions;
    animationDone: boolean;
    blurRadius: number;
    opacity: any;
    scale: number;
    private radiusLag;
    private animateOpacity;
    dispose(): Array<Atom>;
    constructor(id: number, speed?: Point, position?: Point, opacity?: number, options?: Partial<AtomDrawOptions>);
    draw(context: ParticleJSContext): void;
}
interface AtomDrawOptions {
    pop: boolean;
    blur: boolean;
    popRadius: number;
    popProbability: number;
    radius: number;
    colorSet: Array<string>;
    defaultScale: number;
}
interface ParticleJSOptions {
    drawCanvasBackground: boolean;
    canvasBGColor: string;
    animationInterval?: number;
    beforeDraw?: (ctx: CanvasRenderingContext2D) => void;
    afterDraw?: (ctx: CanvasRenderingContext2D) => void;
}
interface ParticleJSContext {
    canvasContext: CanvasRenderingContext2D;
    mousePosition: Point;
    canvasHeight: number;
    canvasWidth: number;
    options: ParticleJSOptions;
}
interface DrawObject {
    draw(context: ParticleJSContext): void;
    dispose(): Array<Atom>;
}
declare class ParticleJS {
    static default: ParticleJSOptions;
    private ctx;
    private paths;
    private W;
    private H;
    private timer;
    private particles;
    private options;
    private DrawObjectCollection;
    private running;
    mouse: Point;
    constructor(canvas: HTMLCanvasElement, drawObjectCollection?: Array<DrawObject>, options?: ParticleJSOptions);
    didResize(canvas: HTMLCanvasElement): void;
    addDrawObject(drawObject: DrawObject): void;
    removeDrawObject(drawObject: DrawObject): Array<Atom>;
    draw(): void;
    start(): void;
    stop(): void;
}
declare function HEXAtoRGBA(hex: any, a: any): string;
declare function generateOptions(options: any, defaultOptions: any): {};
declare module ParticleJSAnimations {
    interface FadeExplodeOptions {
        minSpeed: number;
        maxSpeed: number;
        boxed: boolean;
        animationFactor: number;
    }
    class FadeExplode implements DrawObject {
        private static default;
        options: FadeExplodeOptions;
        private atomSet;
        dispose(): Array<Atom>;
        constructor(options?: Partial<WaveDrawOptions>, atomSet?: Array<Atom>);
        private randomizeAtoms;
        draw(context: ParticleJSContext): void;
    }
}
declare module ParticleJSAnimations {
    interface SVGAnimationOptions {
        atomOptions: Partial<AtomDrawOptions>;
        pathVariation: number;
        lineDensity: number;
        scale: number;
        blur: boolean;
        mouseRepel: boolean;
        forceFactor: number;
        maxRepelDistance: number;
        minBlurDistance: number;
        maxBlurDistance: number;
        marginBlurDistance: number;
        blurFactor: number;
        enlargeFactor: number;
        minEnlargeDistance: number;
        maxEnlargeDistance: number;
        marginEnlargeDistance: number;
        gravity: number;
        frictionFactor: number;
        connectingLines: boolean;
        connectingLineWidth: number;
        connectingLineOpacity: number;
        connectingLineColor: string;
        connectingLineRelaxLength: number;
        connectingLineMaxLength: number;
        animationFactor: number;
    }
    class SVGAnimation implements DrawObject {
        static default: ParticleJSAnimations.SVGAnimationOptions;
        options: SVGAnimationOptions;
        alpha: number;
        private offset;
        private atomSet;
        private pathObjects;
        private firstDraw;
        constructor(path2d: string, options?: Partial<SVGAnimationOptions>, atomSet?: Array<Atom>);
        dispose(): Array<Atom>;
        private GeneratePathObjects;
        private GenerateAtomSet;
        private static Shapes;
        move(offset: Point): void;
        draw(context: ParticleJSContext): void;
    }
}
declare module ParticleJSAnimations {
    interface Wave {
        time: number;
        amplitude: number;
        wavelength: number;
        phase: number;
        timePeriod: number;
        increment: number;
    }
    interface WaveDrawOptions {
        readonly atomOptions: Partial<AtomDrawOptions>;
        scale: number;
        waveCollection: Array<Wave>;
        top: number;
        width: number;
    }
    class WaveAnimation implements DrawObject {
        private static default;
        options: WaveDrawOptions;
        waves: Array<Wave>;
        alpha: number;
        private atomSet;
        private totalAtoms;
        private callback;
        dispose(): Array<Atom>;
        constructor(totalAtoms: number, waves: Array<Wave>, options?: Partial<WaveDrawOptions>);
        addWave(wave: Wave): void;
        removeWave(wave: Wave): Wave;
        draw(context: ParticleJSContext): void;
    }
}
declare enum CanvasCommand {
    Move = "moveTo",
    Line = "lineTo",
    BezierCurve = "bezierCurveTo",
    QuadraticCurve = "quadraticCurveTo",
    EllipticalArc = "arc",
    Save = "save",
    Translate = "translate",
    Rotate = "rotate",
    Scale = "scale",
    Restore = "restore",
    ClosePath = "closePath"
}
interface CanvasPathElement {
    f: CanvasCommand;
    args: Array<number>;
    from: Point;
}
interface Point {
    x: number;
    y: number;
}
interface PathCommand {
    command: string;
    args: Array<number>;
}
interface CommandSignature {
    toCanvas: (pos: Point, relative: boolean, args: Array<number>, _args?: Array<number>) => Array<CanvasPathElement>;
    canvasCommand: CanvasCommand;
    regexPattern: Array<RegexPatterns>;
}
declare enum RegexPatterns {
    Num = 0,
    Flag = 1,
    WS = 2,
    Commands = 3
}
declare class SVGPath {
    private static Patterns;
    private static relToAbs;
    private static Signatures;
    paths: Array<CanvasPathElement>;
    parseError: boolean;
    constructor(d: string);
    private ParsePath2D;
    private static parseEllipticalArc;
    draw(ctx: CanvasRenderingContext2D): void;
}
