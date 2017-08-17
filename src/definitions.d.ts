
interface AtomDrawOptions {
    pop: true,
    popRadius: 4,
    popFrequency: 0.001,
    radius: 2,
    colorSet: ["#ec1943"],//["#E04836", "#F39D41", "#DDDDDD", "#5696BC"],
    particleRadius: 2,
    radiusVariation: 0,
}

interface SVGDrawOptions extends AtomDrawOptions {
    pathVariation: 0,
    lineDensity: 0.6,
    scale: 1,
    offset: Point
}

interface ParticleJSOptions {
    drawCanvasBackground: true,
    canvasBGColor: "#ffffff",
    animationInterval: 30
    beforeDraw?: (ctx: CanvasRenderingContext2D) => void,
    afterDraw?: (ctx: CanvasRenderingContext2D) => void
}

interface DrawObject {
    draw(ctx: CanvasRenderingContext2D): void,
    options: AtomDrawOptions,
}

interface SVGPathShape {
    nthPoint: (n: number) => Point,
    length: number
}

function HEXAtoRGBA(hex, a) {
    hex = hex.substring(1, 7);
    return "rgba(" + parseInt(hex.substr(0, 2), 16) +
    "," + parseInt(hex.substr(2, 2), 16) +
    "," + parseInt(hex.substr(4, 2), 16) +
    "," + a + ")";
}