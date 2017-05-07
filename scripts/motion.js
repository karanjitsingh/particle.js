var motion = {

    none: 0,

    multiple: function(motions) {
        for(var i=0;i<motions.length;i++)
            motions[i]();
    },

	wave: function()
	{
		var fixed = true;
        var y = 0;
        var x = 0;
        for (var i = 0; i < t.length; i++) {
            y += a[i] * Math.sin(w * t[i] - k / l[i] * this.x);
            x += a[i] * Math.cos(w * t[i] - k / l[i] * this.x);
            fixed = false;

        }

        this.y = this.meanY - y;



        if (fixed === true)
            this.y = this.meanY;

        if (x < 0)
            this.opacity += (0.3 - this.opacity) / 1.1;
        else
            this.opacity = 1;
	},

	translate: function()
	{

        this.vy += gravity;

        this.x += this.vx;
        this.y += this.vy;

        if (!this.animationDone && (this.assignedText)) {

            if ((this.x - this.radius < 0 && this.vx < 0) || (this.x + this.radius > W && this.vx > 0))
                this.vx = -1 * this.vx;
            if ((this.y - this.radius < 0 && this.vy < 0) || (this.y + this.radius > H && this.vy > 0))
                this.vy = -1 * this.vy;
        }
	},

    translateText: function() {

        this.vy += gravity;

        this.x += this.vx;
        this.y += this.vy;


        this.x += (this.originX - this.x) / 2;
        this.y += (this.originY - this.y) / 2;

        if (Math.abs(this.x - this.originX) < 0.1 && Math.abs(this.y - this.originY) < 0.1) {
            this.animationDone = true;
        }

    },

	mouseRepel: function() {

        if ((mouseX != undefined) && (mouseY != undefined) && this.animationDone) {
            this.motion();
        }


		if(!this.forceFactor) this.forceFactor = 1;
        if(!this.maxRepelDistance) this.maxRepelDistance = 100;
        if(!this.minBlurDistance) this.minBlurDistance = this.maxRepelDistance / 2;
        if(!this.maxBlurDistance) this.maxBlurDistance = this.maxRepelDistance * 2;
        if(!this.marginBlurDistance) this.marginBlurDistance = this.maxRepelDistance * 3 / 4;



        var posWRTMouse = {
            x: this.x - mouseX,
            y: this.y - mouseY
        };

        var posWRTOrigin = {
            x: this.x - this.originX,
            y: this.y - this.originY
        };

        var distance = Math.sqrt(
            posWRTMouse.x * posWRTMouse.x +
            posWRTMouse.y * posWRTMouse.y
        );

        var distance2 = Math.sqrt(
            posWRTOrigin.x * posWRTOrigin.x +
            posWRTOrigin.y * posWRTOrigin.y
        );

        var forceDirection = {
            x: distance != 0 ? posWRTMouse.x / distance : 0,
            y: distance != 0 ? posWRTMouse.y / distance : 0
        };

        var gravityDirection = {
            x: distance2 != 0 ? posWRTOrigin.x / distance2 : 0,
            y: distance2 != 0 ? posWRTOrigin.y / distance2 : 0
        };

        var force = (this.maxRepelDistance - distance) / this.maxRepelDistance;
        var gravity = -distance2 / 1000;
        gravity = Math.abs(gravity) > 0.1 ? -0.1 : gravity;

        if (force < 0) force = 0;

        this.vx += forceDirection.x * force * spf / this.forceFactor + gravityDirection.x * gravity * spf;
        this.vy += forceDirection.y * force * spf / this.forceFactor + gravityDirection.y * gravity * spf;

        if (isNaN(this.vx))
            this.vx = 0;
        if (isNaN(this.vy))
            this.vy = 0;

        this.vx *= 0.9;
        this.vy *= 0.9;

        if (distance2 <= this.minBlurDistance)
            this.blurRadius = 0;
        else if (distance2 <= this.maxRepelDistance)
            this.blurRadius = (distance2 - this.minBlurDistance) / this.marginBlurDistance * 0.4;
        else
            this.blurRadius = 0.4;
	},

};