class AI {
    constructor() {
        this.forward = 1;

        this.pidController = new PidController({
            kp: 0.02,
            ki: 0.00025,
            kd: 0.225,
            ITermMin: -0.0025,
            ITermMax: 0.0025,
            outputMin: -5,
            outputMax: 5,
            outputMinThreshold: -5,
            target: 15
        });

        let that = this;

        eventManager.subscribe(Topics.CAR_INFO, function(d) {
            that.steerAngle = d["Car Steer Angle"];
            const speed = d["Car Speed"].val;
            that.speed = speed;

            if (!speed){
                that.forward = 1;
                that.backward = 0;
            } else if (speed > 1.5) {
                that.forward = 0;
                that.backward = 1;
            } else {
                that.forward = 1;
                that.backward = 0;
            }
        });

        eventManager.subscribe(Topics.LASER_SCAN, function(d) {
            const startAngle = d["LaserScan Start Angle"];
            const endAngle = d["LaserScan End Angle"];
            const angleInterval = d["LaserScan Angle Interval"];
            const ranges = d["LaserScan Ranges"].val;
            const centerRangeIndex = Math.round(Math.abs(startAngle - endAngle) / angleInterval) / 2 + 1;

            const rightRange = AI.getMinRange(ranges, centerRangeIndex);
            const frontRange = ranges[centerRangeIndex];
            const pidController = that.pidController;
            const pidOutput = pidController.run(rightRange);

            eventManager.publish(Topics.DEBUG_INFO, { "AI Car Right Distance": rightRange, "AI Car Front Distance": frontRange, "AI PID Output": pidOutput });

            if (that.steerAngle !== undefined && pidOutput >= pidController.ITermMin && pidOutput <= pidController.ITermMax) {
                if (that.steerAngle > 0) {
                    AI.setLeft(that);
                } else if (that.steerAngle < 0) {
                    AI.setRight(that);
                } else {
                    that.right = 0;
                    that.left = 0;
                }
            } else if (pidOutput > 0) {
                AI.setRight(that);
            } else if(pidOutput < 0) {
                AI.setLeft(that);
            } else {
                that.right = 0;
                that.left = 0;
            }

            if (rightRange <= 20 && frontRange <= 45) {
                AI.setLeft(that);
            }
        });
    }

    static getMinRange(ranges, len) {
        let min = null;
        for (let i = 0; i < len; i++) {
            const current = ranges[i];
            if (min === null || current < min){
                min = current;
            }
        }

        return min;
    }

    static setLeft(o) {
        o.left = 1;
        o.right = 0;
    }

    static setRight(o) {
        o.left = 0;
        o.right = 1;
    }

    run() {
        eventManager.publish(Topics.CAR_STEER, { left: this.left, right: this.right, forward: this.forward, backward: this.backward });
    }
}