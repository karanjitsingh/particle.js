/* TODO
 * test wave animation for changing properties
 */
module ParticleJSAnimations {
    interface PathObject {
        nthPoint: (n: number) => Point,
        length: number,
    }

    export interface Wave {
        time: number,
        amplitude: number,
        wavelength: number,
        phase: number,
        timePeriod: number,
        increment: number
    }
    
    export interface WaveDrawOptions {
        readonly atomOptions: AtomDrawOptions
        scale: number,
        waveCollection: Array<Wave>,
        top: number,
        width: number
    }
    
    export class WaveAnimation implements DrawObject {

        public static default: WaveDrawOptions = {
            atomOptions: {
                pop: true,
                popRadius: 4,
                popProbability: 1000,
                radius: 2,
                colorSet: ["#E04836", "#F39D41", "#5696BC"],
                particleRadius: 2,
                radiusVariation: 0,
                blur: true
            },
            scale: 1,
            waveCollection: [],
            top: 100,
            width: 1000
        }

        public options: WaveDrawOptions;
        public waves: Array<Wave>; 
        private atomSet: Array<Atom>
        private totalAtoms: number;

        constructor(totalAtoms: number,waves: Array<Wave>, options?: WaveDrawOptions) {
            this.options = <WaveDrawOptions>generateOptions(options, WaveAnimation.default);
            this.atomSet = [];
            this.waves = [];
            this.totalAtoms = totalAtoms;

            for(var i in waves)
                this.waves.push(<Wave> generateOptions(waves[i], <Wave> {time: 0, amplitude: 0, wavelength: 0, phase: 0, timePeriod:0, increment: 0.1}));

            for(var j=0;j<totalAtoms;j++)
                this.atomSet.push(new Atom(j, {x:0, y:0}, {x: j/totalAtoms*this.options.width, y: this.options.top}, 1, this.options.atomOptions));
        }

        public addWave(wave: Wave) {
            this.waves.push(wave);
        }

        public removeWave(wave: Wave): Wave {
            var key = null;
            for(var i=0;i<this.waves.length;i++) {
                if(this.waves[i] == wave)
                    key = this.waves.splice(i, 1);
            }

            return key;
        }

        public draw(context: ParticleJSContext) {
            
            for(var j=0;j<this.totalAtoms;j++) {
                var atom = this.atomSet[j];

                var x=0,y=0;

                for (var i = 0; i < this.waves.length; i++) {
                    var wave = this.waves[i];
                    var theta =  2 * Math.PI / wave.timePeriod * wave.time - 2 * Math.PI / wave.wavelength * atom.pos.x;
                    y += wave.amplitude * Math.sin(theta);
                    x += wave.amplitude * Math.cos(theta);
                }

                atom.pos.y = this.options.top - y;

                atom.draw(context);

                if (x < 0)
                    atom.opacity += (0.3 - atom.opacity) / 1.1;
                else
                    atom.opacity = 1;
            }

            for(var i=0;i<this.waves.length;i++) {
                this.waves[i].time = (this.waves[i].time + this.waves[i].increment)%(Math.floor(this.options.width/250 + 1) * 10)
            }
        }
    }
}