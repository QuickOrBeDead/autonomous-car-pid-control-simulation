class PidController {
    constructor(options) {
        this.target = options.target;

        this.kp = options.kp;
        this.ki = options.ki;
        this.kd = options.kd;

        this.ITermMin = options.ITermMin;
        this.ITermMax = options.ITermMax;

        this.ITerm = 0;
        this.previousError = 0;
    }

    run(current) {
        const error = current - this.target,
              PTerm = error * this.kp,
              DTerm = (error - this.previousError) * this.kd;

        this.previousError = error;

        this.ITerm += error * this.ki;
        if (this.ITerm > this.ITermMax) {
            this.ITerm = this.ITermMax;
        } else if (this.ITerm < this.ITermMin) {
            this.ITerm = this.ITermMin;
        }

        let output = PTerm + this.ITerm + DTerm;

        return output;
    }
}