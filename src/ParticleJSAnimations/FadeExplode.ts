module ParticleJSAnimations {

    export interface FadeExplodeOptions {
        minSpeed: number,
        maxSpeed: number,
        boxed: boolean,
        animationFactor: number,
    }
    
    export class FadeExplode implements DrawObject {

        private static default: FadeExplodeOptions = {
            minSpeed: 2,
            maxSpeed: 10,
            boxed: true,
            animationFactor: 8
        }

        public options: FadeExplodeOptions;

        private atomSet: Array<Atom>

        public dispose(): Array<Atom> {
            return this.atomSet.splice(0,this.atomSet.length);
        }

        constructor(options?: Partial<WaveDrawOptions>, atomSet?: Array<Atom>) {
            this.options = <FadeExplodeOptions>generateOptions(options, FadeExplode.default);
            this.randomizeAtoms(atomSet);
        }

        private randomizeAtoms(atomSet: Array<Atom>) {
            this.atomSet = atomSet.splice(0, atomSet.length);

            for(var i=0;i<this.atomSet.length;i++) {
                this.atomSet[i].speed = {
                    x: (this.options.minSpeed + Math.random() * (this.options.maxSpeed-this.options.minSpeed)) * (Math.random() > 0.5 ? -1 : 1),
                    y: (this.options.minSpeed + Math.random() * (this.options.maxSpeed-this.options.minSpeed)) * (Math.random() > 0.5 ? 1 : -1)
                }
            }
        }
        

        public draw(context: ParticleJSContext) {

            for(var j=0;j<this.atomSet.length;j++) {
                var atom = this.atomSet[j];

                atom.pos.x += atom.speed.x;
                atom.pos.y += atom.speed.y;

                atom.opacity -= atom.opacity/this.options.animationFactor;

                if(atom.opacity < 0.01) {
                    this.atomSet.splice(j,1);
                    j--; continue;
                }

                if(this.options.boxed == true) {
                    if ((atom.pos.x - atom.options.radius < 0 && atom.speed.x < 0) || (atom.pos.x + atom.options.radius > context.canvasWidth && atom.speed.x > 0))
                        atom.speed.x = -1 * atom.speed.x;
                    if ((atom.pos.y - atom.options.radius < 0 && atom.speed.y < 0) || (atom.pos.y + atom.options.radius > context.canvasHeight && atom.speed.y > 0))
                        atom.speed.y = -1 * atom.speed.y;
                }

                atom.draw(context);
            }
        }
    }
}