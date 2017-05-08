function rect(x1, y1, w, h, i) {
    var margin = 10;
    i = i == 2 ? 3 : i;
    this.i = i;
    this.opacity = 0;
    this.bounds = { x: x1 - margin, y: y1 - margin, width: w + 2 * margin, height: h + 2 * margin, x2: x1 + w + margin, y2: y1 + h + margin };

    var originOpacity = 0;

    this.drawing = false;
    this.draw = function (ctx) {

        ctx.save();

        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.shadowBlur = 5;
        //ctx.shadowColor = HEXAtoRGBA(POP_COLORS[i], this.opacity);
        ctx.strokeStyle = HEXAtoRGBA(POP_COLORS[i], this.opacity);
        ctx.lineWidth = 2;
        ctx.strokeRect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height);
        //ctx.fillStyle = "rgba(0,0,0," + (this.opacity * 0.2) + ")";

        ctx.fillStyle = HEXAtoRGBA(POP_COLORS[this.i], this.opacity * 0.5);

        if (this.drawing) {
            ctx.fillRect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height);
            originOpacity = 1;
            if (Math.abs(this.opacity - originOpacity) > 0.01)
                this.opacity += (originOpacity - this.opacity) / 6;
        }
        else {
            ctx.fillRect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height);
            originOpacity = 0;
            if (Math.abs(this.opacity - originOpacity) > 0.01)
                this.opacity += (originOpacity - this.opacity) / 6;
        }


        ctx.restore();


        ctx.beginPath();
        ctx.fillStyle = HEXAtoRGBA(POP_COLORS[2], this.opacity);
        ctx.arc(this.bounds.x, this.bounds.y, 2, Math.PI * 2, false);
        ctx.fill();
        ctx.closePath();
        ctx.beginPath();
        ctx.arc(this.bounds.x2, this.bounds.y, 2, Math.PI * 2, false);
        ctx.fill();
        ctx.closePath();
        ctx.beginPath();
        ctx.arc(this.bounds.x2, this.bounds.y2, 2, Math.PI * 2, false);
        ctx.fill();
        ctx.closePath();
        ctx.beginPath();
        ctx.arc(this.bounds.x, this.bounds.y2, 2, Math.PI * 2, false);
        ctx.fill();
        ctx.closePath();



    };
}

function line(x1, y1, x2, y2) {
    this.x1 = x1;
    this.x2 = x2;
    this.y1 = y1;
    this.y2 = y2;
    if (this.x1 - this.x2 != 0)
        this.theta = Math.atan((this.y1 - this.y2) / (this.x1 - this.x2));
    else
        this.theta = Math.PI / 2

    this.length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));

    var ck = this.length * Math.cos(this.theta);
    var sk = this.length * Math.sin(this.theta);

    this.getPoint = function (n) {
        return { x: this.x1 + n * ck, y: this.y1 + n * sk };
    };
}

function circle(x, y, r) {
    this.x = x;
    this.y = y;
    this.r = r;

    this.length = 2 * Math.PI * r;

    var k = this.length * Math.PI * 2;

    this.getPoint = function (n) {
        return { x: this.x + Math.sin(n * k) * this.r, y: this.y + Math.cos(n * k) * this.r };
    };
}


function arc(x, y, r, sa, ea) {
    this.x = x;
    this.y = y;
    this.sa = sa;
    this.ea = ea;
    this.theta = this.ea - this.sa;
    this.length = this.theta * r;

    this.getPoint = function (n) {
        return { x: this.x + r * Math.cos(this.sa + n * this.theta), y: this.y + r * Math.sin(this.sa + n * this.theta) };
    };
}