module ParticleJSAnimations {

    export interface RandomMotionOptions {
        minSpeed: number,
        maxSpeed: number,
    }
    
    export class RandomMotion implements DrawObject {

        private static default: RandomMotionOptions = {
            minSpeed: 1,
            maxSpeed: 5,
        }

        public options: RandomMotionOptions;
        public alpha = 1;

        private atomSet: Array<Atom>

        public dispose(): Array<Atom> {
            return this.atomSet.splice(0,this.atomSet.length);
        }

        constructor(options?: WaveDrawOptions, atomSet?: Array<Atom>) {
            this.options = <RandomMotionOptions>generateOptions(options, RandomMotion.default);
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

                atom.opacity = this.alpha;

                atom.draw(context);
            }
        }
    }
}