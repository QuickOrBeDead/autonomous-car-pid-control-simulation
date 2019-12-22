class LaserScan {
    constructor(options = {}) {
        this.x = options.x || 0;
        this.y = options.y || 0;
        this.maxRange = options.maxRange || 36;
        this.ranges = [];
        this.points = [];

        this.startAngle = options.startAngle || 60;
        this.endAngle = options.endAngle || -60;
        this.angleInterval = options.angleInterval || 10;

        this.startAngleRad = MathHelper.degreeToRadians(this.startAngle);
        this.endAngleRad = MathHelper.degreeToRadians(this.endAngle);
        this.angleIntervalRad = MathHelper.degreeToRadians(this.angleInterval);

        this.running = true;

        let that = this;
        eventManager.subscribe(Topics.KEYBOARD_KEY_PRESSED, function(e) {
            if (e.key === "l") {
                that.running = !that.running;
            }
        });
    }

    update() {
        if (!this.running) {
            return;
        }

        let i = 0;
        for (let a = this.startAngleRad; a >= this.endAngleRad; a-=this.angleIntervalRad, i++) {
            this.points[i] = { x: this.x + this.maxRange * Math.cos(a), y: this.y + this.maxRange * Math.sin(a) };         
        }

        eventManager.publish(Topics.LASER_SCAN, this.ranges);
    }

    draw(ctx) {
        if (!this.running) {
            return;
        }

        ctx.save();

        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(this.x, this.y, 1, 0, MathHelper.PI2);
        ctx.fill();

        ctx.strokeStyle = "rgba(255,0,0,0.3)";
        
        const points = this.points;
        const len = points.length;
        for (let i = 0; i < len; i++) {
            const point = points[i];

            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(point.x, point.y);
            ctx.stroke();
            
        }

        ctx.restore();
    }
}