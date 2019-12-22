const SteerDirection = {
    LEFT: 1,
    RIGHT: 2,
    FORWARD: 3,
    BACKWARD: 4
};

class Car {
    constructor(options = {}) {
        this.width = 14;
        this.length = 25;
        this.position = Vector.create(options.x || 100, options.y || 100);
    
        this.steerAngle = 0;
        this.maxSteerAngle = options.maxSteerAngle || Math.PI / 4;
        this.speed = options.speed || 0;
        this.maxSpeed = 3;
        this.frictionRate = 0.025;
        this.acceleration = 0.2;
        this.deceleration = 0.05;
        this.heading = MathHelper.degreeToRadians(options.heading || 0);

        this.minusMaxSteerAngle = -this.maxSteerAngle;
        this.minusMaxSpeed = -this.maxSpeed;

        this.middleLength = this.length / 2;
        this.middleWidth = this.width / 2;
        this.screenWidth = options.screenWidth;
        this.screenHeight = options.screenHeight;

        this.bodyStartX = -this.middleLength;
        this.bodyStartY = -this.middleWidth;
        this.bodyColor = "#3F3F3F";

        this.windshieldStartX = 2;
        this.windshieldStartY = -this.middleWidth + 1;
        this.windshieldWidth = this.width - 2;
        this.windshieldLength = 4;
        this.windshieldColor = "#E0E0E0";

        this.tireWidth = 3;
        this.tireLength = 5;
        this.tireBackX = this.bodyStartX - 2;
        this.tireRightY = this.middleWidth - 2;
        this.tireLeftY = -this.middleWidth - 1;
        this.tireFrontRightYMiddle = this.tireRightY - 1 + this.tireLength / 2;
        this.tireFrontLeftYMiddle = this.tireLeftY - 1 + this.tireLength / 2;
        this.tireFrontXMiddle = this.middleLength - 4 + this.tireLength / 2;
        this.tireFrontStartX = -this.tireLength / 2;
        this.tireFrontStartY = -this.tireWidth / 2;
        this.tireColor = "#000";

        this.laserScan = new LaserScan({x: 2 + this.windshieldLength / 2, y: 0 });

        const that = this;
        eventManager.subscribe(Topics.CAR_STEER, function(d) {
            if (d.left) {
                that.steer(SteerDirection.LEFT);
            }

            if (d.right) {
                that.steer(SteerDirection.RIGHT);
            }

            if (d.forward) {
                that.steer(SteerDirection.FORWARD);
            }

            if (d.backward) {
                that.steer(SteerDirection.BACKWARD);
            }
        });
    }

    update() {
        this.constrain();
        this.friction();
        this.move();
        this.laserScan.update();

        eventManager.publish(Topics.CAR_INFO, { 
            "Speed": { val: this.speed, toString: function(){ return this.val.toFixed(2); } }, 
            "Steer Angle": Math.floor(MathHelper.radiansToDegree(this.steerAngle)),
            "Car Angle": (Math.floor(MathHelper.radiansToDegree(this.heading))),
            "Position": this.position.toString()  }
            );
    }

    constrain() {
        if (this.position.x < 0) {
            this.position.x = 0;
        }

        if (this.position.x > this.screenWidth) {
            this.position.x = this.screenWidth; 
        }

        if (this.position.y < 0) {
            this.position.y = 0;
        }

        if (this.position.y > this.screenHeight) {
            this.position.y = this.screenHeight;
        }
    }

    friction() {
        if (this.speed > 0) {
            this.speed -= this.frictionRate;

            if (this.speed < 0) {
                this.speed = 0;
            }
        }

        if (this.speed < 0) {
            this.speed += this.frictionRate;

            if (this.speed > 0) {
                this.speed = 0;
            }
        }
    }

    move() { 
        const { x, y } = this.position;
        const { heading, middleLength, steerAngle, speed } = this;

        const sinHeading = Math.sin(heading);
        const cosHeading = Math.cos(heading);
        const vectorXChange = middleLength * cosHeading;
        const vectorYChange = middleLength * sinHeading;
        const frontAngle = heading + steerAngle;
        const front = Vector.create(x + vectorXChange + speed * Math.cos(frontAngle), y + vectorYChange + speed * Math.sin(frontAngle));
        const back = Vector.create(x - vectorXChange + speed * cosHeading, y - vectorYChange + speed * sinHeading);   

        this.position.set((front.x + back.x) / 2, (front.y + back.y) / 2);
        this.heading = Math.atan2(front.y - back.y, front.x - back.x);
    }

    steer(dir) {
        if (dir === SteerDirection.FORWARD) {
            this.speed += this.acceleration;
        } else if (dir === SteerDirection.BACKWARD) {
            this.speed -= this.deceleration;
        } else if (dir === SteerDirection.LEFT) {
            this.steerAngle = this.steerAngle <= this.minusMaxSteerAngle ? this.minusMaxSteerAngle : this.steerAngle - 0.08;
        } else if (dir === SteerDirection.RIGHT) {
          this.steerAngle = this.steerAngle >= this.maxSteerAngle ? this.maxSteerAngle : this.steerAngle + 0.08;
        }
    
        if (this.speed < this.minusMaxSpeed) {
            this.speed = this.minusMaxSpeed;
        } else if (this.speed > this.maxSpeed) {
            this.speed = this.maxSpeed;
        }
    }

    draw(ctx) {
        ctx.save();

        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.heading);

        this.drawTires(ctx);
        this.drawBody(ctx);
        this.drawLights(ctx);
        this.drawWindshield(ctx);
        this.laserScan.draw(ctx);

        ctx.restore();
    }

    drawWindshield(ctx) {
        ctx.save();

        ctx.fillStyle = this.windshieldColor;
        ctx.fillRect(this.windshieldStartX, this.windshieldStartY, this.windshieldLength, this.windshieldWidth);

        ctx.restore();
    }

    drawLights(ctx) {
        ctx.save();

        ctx.fillStyle = "yellow";
        
        ctx.beginPath();
        ctx.arc(12, -4, 1, 0, MathHelper.PI2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(12, 4, 1, 0, MathHelper.PI2);
        ctx.fill();
        
        ctx.restore();
    }

    drawTires(ctx) {
        ctx.save();

        ctx.fillStyle = this.tireColor;

        ctx.fillRect(this.tireBackX, this.tireLeftY, this.tireLength, this.tireWidth);
        ctx.fillRect(this.tireBackX, this.tireRightY, this.tireLength, this.tireWidth);
        
        ctx.save();
        ctx.translate(this.tireFrontXMiddle, this.tireFrontLeftYMiddle);
        ctx.rotate(this.steerAngle);
        ctx.fillRect(this.tireFrontStartX, this.tireFrontStartY, this.tireLength, this.tireWidth);
        ctx.restore();

        ctx.save();
        ctx.translate(this.tireFrontXMiddle, this.tireFrontRightYMiddle);
        ctx.rotate(this.steerAngle);
        ctx.fillRect(this.tireFrontStartX, this.tireFrontStartY, this.tireLength, this.tireWidth);
        ctx.restore();

        ctx.restore();
    }

    drawBody(ctx) {
        ctx.save();

        ctx.fillStyle = this.bodyColor;
        ctx.fillRect(this.bodyStartX, this.bodyStartY, this.length, this.width);

        ctx.restore();
    }
}