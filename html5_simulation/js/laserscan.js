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

        this.startAngleRad = MathHelper.degreeToRadians(this.startAngle + 90);
        this.endAngleRad = MathHelper.degreeToRadians(this.endAngle + 90);
        this.angleIntervalRad = MathHelper.degreeToRadians(this.angleInterval);
    }

    update() {
        let i = 0;
        for (let a = this.startAngleRad; a >= this.endAngleRad; a-=this.angleIntervalRad, i++) {
            this.points[i] = { x: this.x + this.maxRange * Math.cos(a), y: this.y + this.maxRange * Math.sin(a) };         
        }
    }

    draw(ctx) {
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