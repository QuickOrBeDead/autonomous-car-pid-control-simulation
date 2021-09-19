class LaserScan {
    constructor(options = {}) {
        this.maxRange = options.maxRange || 60;
        this.track = options.track;
        this.startAngle = options.startAngle || 80;
        this.endAngle = options.endAngle || -80;
        this.angleInterval = options.angleInterval || 10;
        this.rangeCount = Math.floor(Math.abs(this.startAngle - this.endAngle) / this.angleInterval) + 1; 

        this.startAngleRad = MathHelper.degreeToRadians(this.startAngle);
        this.angleIntervalRad = MathHelper.degreeToRadians(this.angleInterval);

        this.running = true;
        this.ranges = [];
        this.points = [];

        let that = this;
        eventManager.subscribe(Topics.KEYBOARD_KEY_PRESSED, function(e) {
            if (e.key === "l") {
                that.running = !that.running;
            }
        });
    }

    setPosition(x, y, carAngle) {
        this.x = x;
        this.y = y;
        this.carAngle = carAngle;
    }

    update() {
        if (!this.running) {
            return;
        }

        const len = this.rangeCount;
        const track = this.track;
        const maxRange = this.maxRange;

        let a = this.startAngleRad + this.carAngle;
        for (let i = 0; i < len; i++) {
            let x = this.x + maxRange * Math.cos(a),
                y = this.y + maxRange * Math.sin(a),
                hasIntersection = false;

            const intersection = track.lineSegmentIntersect(this.x, this.y, x, y, true);
            if (intersection) {
                x = intersection.x;
                y = intersection.y;
                hasIntersection = true;
            }
            
            this.points[i] = { x: x, y: y, hasIntersection: hasIntersection };
            this.ranges[i] = hasIntersection ? Math.floor(MathHelper.distance(this.x, this.y, x, y)) : maxRange;

            a -= this.angleIntervalRad;     
        }

        eventManager.publish(Topics.LASER_SCAN, { 
            "LaserScan Start Angle": this.startAngle,
            "LaserScan End Angle": this.endAngle,
            "LaserScan Angle Interval": this.angleInterval,
            "LaserScan Max Range": this.maxRange,
            "LaserScan Ranges": { val: this.ranges, toString: function() { return this.val.toString(); } } 
        });
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

            if (point.hasIntersection) {
                ctx.beginPath();
                ctx.arc(point.x, point.y, 1, 0, MathHelper.PI2);
                ctx.fill();
            }
            
        }

        ctx.restore();
    }
}