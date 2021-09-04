
interface AtomDrawOptions {
    pop: boolean,
    blur: boolean,
    popRadius: number,
    popProbability: number,
    radius: number,
    colorSet: Array<string>,
    defaultScale: number,
}

interface ParticleJSOptions {
    drawCanvasBackground: boolean,
    canvasBGColor: string,
    animationInterval?: number,
    beforeDraw?: (ctx: CanvasRenderingContext2D) => void,
    afterDraw?: (ctx: CanvasRenderingContext2D) => void
}

interface ParticleJSContext {
    canvasContext: CanvasRenderingContext2D,
    mousePosition: Point,
    canvasHeight: number,
    canvasWidth: number,
    options: ParticleJSOptions
}

interface DrawObject {
    draw(context: ParticleJSContext): void,
    dispose(): Array<Atom>
}