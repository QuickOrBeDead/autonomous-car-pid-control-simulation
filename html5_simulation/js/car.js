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
        this.track = options.track;
        this.x = this.track.startX || 100;
        this.y = this.track.startY || 100;
        this.routePoints = [];
        this.distance = 0;
        this.carCrashPoint = null;
        this.carEdgePoints = [];
        this.showCarEdgePoints = false;
        this.showRoutePoints = true;

        this.steerAngle = 0;
        this.maxSteerAngle = options.maxSteerAngle || Math.PI / 4;
        this.carAngle = MathHelper.degreeToRadians(options.carAngle || 0);
        this.speed = options.speed || 0;
        this.maxSpeed = 3;
        this.frictionRate = 0.025;
        this.acceleration = 0.2;
        this.deceleration = 0.05;

        this.minusMaxSteerAngle = -this.maxSteerAngle;
        this.minusMaxSpeed = -this.maxSpeed;

        this.middleLength = this.length / 2;
        this.middleWidth = this.width / 2;
        this.screenWidth = options.screenWidth;
        this.screenHeight = options.screenHeight;

        this.bodyStartX = -this.middleLength;
        this.bodyStartY = -this.middleWidth;
        this.bodyColor = "#3F3F3F";

        this.roofStartX = 2;
        this.roofStartY = -this.middleWidth + 1;
        this.roofWidth = this.width - 2;
        this.roofLength = 4;
        this.roofColor = "#E0E0E0";

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

        this.lazerScanRelativeX = 2 + this.roofLength / 2;
        this.laserScan = new LaserScan({ track: this.track });
        this.setLaserScanPosition();

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

        eventManager.subscribe(Topics.KEYBOARD_KEY_PRESSED, function(e) {
            if (e.key === "e") {
                that.showCarEdgePoints = !that.showCarEdgePoints;
            } else if (e.key === "t") {
                that.showRoutePoints = !that.showRoutePoints;
            }
        });
    }

    update() {
        this.constrain();
        this.friction();
        this.move();
        this.calculateEdgePoints();

        this.setLaserScanPosition();
        this.laserScan.update();

        this.updateRoutePoints();

        eventManager.publish(Topics.CAR_INFO, { 
            "Car Speed": { val: this.speed, toString: function(){ return this.val.toFixed(2); } }, 
            "Car Steer Angle": Math.floor(MathHelper.radiansToDegree(this.steerAngle)),
            "Car Angle": (Math.floor(MathHelper.radiansToDegree(this.carAngle))),
            "Car Position": "(" + Math.floor(this.x) + " , " + Math.floor(this.y) + ")",
            "Car Distance": Math.floor(this.distance)
        });
    }

    calculateEdgePoints() {
        const carAngle = this.carAngle, 
            rx = this.middleLength, 
            ry = this.middleWidth, 
            cosA = Math.cos(carAngle), 
            sinA = Math.sin(carAngle), 
            x = this.x, 
            y = this.y, 
            x1 = x + rx * cosA - ry * sinA, 
            y1 = y + rx * sinA + ry * cosA, 
            x2 = x + rx * cosA - -ry * sinA, 
            y2 = y + rx * sinA + -ry * cosA, 
            x3 = x + -rx * cosA - -ry * sinA, 
            y3 = y + -rx * sinA + -ry * cosA, 
            x4 = x + -rx * cosA - ry * sinA, 
            y4 = y + -rx * sinA + ry * cosA;
        
        const edgePoints = this.carEdgePoints;
        edgePoints[0] = [x1, y1];
        edgePoints[1] = [x2, y2];
        edgePoints[2] = [x3, y3];
        edgePoints[3] = [x4, y4];

        let crashPoint = null;
        if ((crashPoint = this.track.lineSegmentIntersect(x1, y1, x2, y2, true)) ||
            (crashPoint = this.track.lineSegmentIntersect(x2, y2, x3, y3, true)) ||
            (crashPoint = this.track.lineSegmentIntersect(x3, y3, x4, y4, true)) ||
            (crashPoint = this.track.lineSegmentIntersect(x4, y4, x1, y1, true))) {
            this.carCrashPoint = crashPoint;

            eventManager.publish(Topics.APP_CONTROL, ApplicationStates.PAUSED);
            eventManager.publish(Topics.APP_CONTROL, ApplicationStates.RESTART);
        }
    }

    updateRoutePoints() {
        if (!this.showRoutePoints) {
            if (this.routePoints.length) {
                this.routePoints = [];
            }
            return;
        }

        const routePoints = this.routePoints;
        if (routePoints.length > 500) {
            routePoints.splice(0, 1);
        }
        routePoints.push({ x: this.x, y: this.y });
    }

    setLaserScanPosition() {
        const carAngle = this.carAngle;
        const lazerScanRelativeX = this.lazerScanRelativeX;
        
        this.laserScan.setPosition(this.x + MathHelper.calculateRotationX(lazerScanRelativeX, 0, carAngle), this.y + MathHelper.calculateRotationY(lazerScanRelativeX, 0, carAngle), carAngle);
    }

    constrain() {
        const x = this.x;
        if (x < 0) {
            this.x = 0;
        }

        const screenWidth = this.screenWidth;
        if (x > screenWidth) {
            this.x = screenWidth; 
        }

        const y = this.y;
        if (y < 0) {
            this.y = 0;
        }

        const screenHeight = this.screenHeight;
        if (y > screenHeight) {
            this.y = screenHeight;
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
        const x = this.x,
              y = this.y,
              carAngle = this.carAngle,
              middleLength = this.middleLength,
              steerAngle = this.steerAngle,
              speed = this.speed;

        const sinHeading = Math.sin(carAngle),
              cosHeading = Math.cos(carAngle),
              rotateXChange = middleLength * cosHeading,
              rotateYChange = middleLength * sinHeading,
              frontAngle = carAngle + steerAngle,
              frontX = x + rotateXChange + speed * Math.cos(frontAngle),
              frontY = y + rotateYChange + speed * Math.sin(frontAngle),
              backX = x - rotateXChange + speed * cosHeading,
              backY = y - rotateYChange + speed * sinHeading;

        this.x = (frontX + backX) / 2;
        this.y = (frontY + backY) / 2;
        this.carAngle = Math.atan2(frontY - backY, frontX - backX);

        this.distance += MathHelper.distance(x, y, this.x, this.y);
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
        this.track.draw(ctx);

        this.drawCar(ctx);
        this.drawRoutePoints(ctx);
        this.drawCarEdgePoints(ctx);

        this.laserScan.draw(ctx);

        this.drawCarCrashPoint(ctx);
    }

    drawCarCrashPoint(ctx) {
        const crashPoint = this.carCrashPoint;
        if (crashPoint) {
            ctx.save();

            ctx.fillStyle = "yellow";

            ctx.beginPath();
            ctx.arc(crashPoint.x, crashPoint.y, 3, 0, MathHelper.PI2);
            ctx.fill();

            ctx.restore();
        }
    }

    drawCarEdgePoints(ctx) {
        if (!this.showCarEdgePoints) {
            return;
        }

        ctx.save();

        ctx.fillStyle = "green";

        const edgePoints = this.carEdgePoints;
        const len = edgePoints.length;
        for (let i = 0; i < len; i++) {
            const edgePoint = edgePoints[i];

            ctx.beginPath();
            ctx.arc(edgePoint[0], edgePoint[1], 2, 0, MathHelper.PI2);
            ctx.fill();
        }

        ctx.restore();
    }

    drawCar(ctx) {
        ctx.save();

        ctx.translate(this.x, this.y);
        ctx.rotate(this.carAngle);

        this.drawTires(ctx);
        this.drawBody(ctx);
        this.drawLights(ctx);
        this.drawRoof(ctx);

        ctx.restore();
    }

    drawRoutePoints(ctx) {
        if (!this.showRoutePoints) {
            return;
        }
        
        ctx.save();

        ctx.fillStyle = "rgba(0,0,255,0.2)";
        
        const routePoints = this.routePoints;
        const len = routePoints.length;
        for (let i = 0; i < len; i++) {
            const point = routePoints[i];

            ctx.beginPath();
            ctx.arc(point.x, point.y, 1, 0, MathHelper.PI2);
            ctx.fill();
        }

        ctx.restore();
    }

    drawRoof(ctx) {
        ctx.save();

        ctx.fillStyle = this.roofColor;
        ctx.fillRect(this.roofStartX, this.roofStartY, this.roofLength, this.roofWidth);

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