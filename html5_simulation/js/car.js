const SteerDirection = {
    LEFT: 1,
    RIGHT: 2,
    FORWARD: 3,
    BACKWARD: 4
};

class Car {
    constructor(options = {}) {
        this.width = 14;
        this.height = 25;
        this.position = Vector.create(options.x || 100, options.y || 100);
    
        this.steerAngle = 0;
        this.maxSteerAngle = options.maxSteerAngle || Math.PI / 4;
        this.speed = options.speed || 0.25;
        this.maxSpeed = 4;
        this.frictionRate = 0.025;
        this.acceleration = 0.2;
        this.deceleration = 0.05;
        this.heading = MathHelper.degreeToRadians(options.heading || 180);

        this.middleHeight = this.height / 2;
        this.middleWidth = this.width / 2;
        this.screenWidth = options.screenWidth;
        this.screenHeight = options.screenHeight;

        this.bodyStartX = -this.middleWidth;
        this.bodyStartY = -this.middleHeight;
        this.bodyColor = "#3F3F3F";

        this.windshieldStartX = this.bodyStartX + 1;
        this.windshieldWidth = this.width - 2;
        this.windshieldHeight = 4;
        this.windshieldColor = "#E0E0E0";

        this.tireBackY = this.bodyStartY - 2;
        this.tireLeftX = this.middleWidth - 1;
        this.tireRightX = this.bodyStartX - 2;
        this.tireWidth = 3;
        this.tireHeight = 5;
        this.tireFrontLeftXMiddle = this.tireLeftX + this.tireWidth / 2;
        this.tireFrontRightXMiddle = this.tireRightX + this.tireWidth / 2;
        this.tireFrontYMiddle = this.middleHeight - 4 + this.tireHeight / 2;
        this.tireFrontStartX = -this.tireWidth / 2;
        this.tireFrontStartY = -this.tireHeight / 2;
        this.tireColor = "#000";

        this.laserScan = new LaserScan({x: 0, y: 2 + this.windshieldHeight / 2 });

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
            "Speed": this.speed.toFixed(2), 
            "Steer Angle": Math.floor(MathHelper.radiansToDegree(this.steerAngle)),
            "Car Angle": (Math.floor(MathHelper.radiansToDegree(this.heading)) + 270) % 360,
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
        const { heading, middleHeight, steerAngle, speed } = this;

        const sinHeading = Math.sin(heading);
        const cosHeading = Math.cos(heading);
        const vectorXChange = middleHeight * sinHeading;
        const vectorYChange = middleHeight * cosHeading;
        const front = Vector.create(x + vectorXChange, y + vectorYChange);
        const back = Vector.create(x - vectorXChange, y - vectorYChange);   
        const frontAngle = heading + steerAngle;

        front.addScalar(speed * Math.sin(frontAngle), speed * Math.cos(frontAngle));
        back.addScalar(speed * sinHeading, speed * cosHeading);

        this.position.set((front.x + back.x) / 2, (front.y + back.y) / 2);
        this.heading = Math.atan2(front.x - back.x, front.y - back.y);
    }

    steer(dir) {
        if (dir === SteerDirection.FORWARD) {
            this.speed += this.acceleration;
        } else if (dir === SteerDirection.BACKWARD) {
            this.speed -= this.deceleration;
        } else if (dir === SteerDirection.LEFT) {
            this.steerAngle = this.steerAngle >= this.maxSteerAngle ? this.maxSteerAngle : this.steerAngle + 0.08;
        } else if (dir === SteerDirection.RIGHT) {
          this.steerAngle = this.steerAngle <= -this.maxSteerAngle ? -this.maxSteerAngle : this.steerAngle - 0.08;
        }
    
        if (this.speed < -this.maxSpeed) {
            this.speed = -this.maxSpeed;
        } else if (this.speed > this.maxSpeed) {
            this.speed = this.maxSpeed;
        }
    }

    draw(ctx) {
        ctx.save();

        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(-this.heading);

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
        ctx.fillRect(this.windshieldStartX, 2, this.windshieldWidth, this.windshieldHeight);

        ctx.restore();
    }

    drawLights(ctx) {
        ctx.save();

        ctx.fillStyle = "yellow";
        
        ctx.beginPath();
        ctx.arc(-5, 12, 1, 0, MathHelper.PI2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(5, 12, 1, 0, MathHelper.PI2);
        ctx.fill();
        
        ctx.restore();
    }

    drawTires(ctx) {
        ctx.save();

        ctx.fillStyle = this.tireColor;

        ctx.fillRect(this.tireLeftX, this.tireBackY, this.tireWidth, this.tireHeight);
        ctx.fillRect(this.tireRightX, this.tireBackY, this.tireWidth, this.tireHeight);
        
        ctx.save();
        ctx.translate(this.tireFrontLeftXMiddle, this.tireFrontYMiddle);
        ctx.rotate(-this.steerAngle);
        ctx.fillRect(this.tireFrontStartX, this.tireFrontStartY, this.tireWidth, this.tireHeight);
        ctx.restore();

        ctx.save();
        ctx.translate(this.tireFrontRightXMiddle, this.tireFrontYMiddle);
        ctx.rotate(-this.steerAngle);
        ctx.fillRect(this.tireFrontStartX, this.tireFrontStartY, this.tireWidth, this.tireHeight);
        ctx.restore();

        ctx.restore();
    }

    drawBody(ctx) {
        ctx.save();

        ctx.fillStyle = this.bodyColor;
        ctx.fillRect(this.bodyStartX, this.bodyStartY, this.width, this.height);

        ctx.restore();
    }
}