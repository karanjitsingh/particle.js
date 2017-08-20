
interface AtomDrawOptions {
    pop: boolean,
    popRadius: number,
    popProbability: number,
    radius: number,
    colorSet: Array<string>,
    particleRadius: number,
    radiusVariation: number,
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
    canvasWidth: number
    options: ParticleJSOptions
}

interface DrawObject {
    draw(context: ParticleJSContext): void,
}