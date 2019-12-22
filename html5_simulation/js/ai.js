class AI {
    constructor() {
        this.time = 0;

        let that = this;

        eventManager.subscribe(Topics.APP_INFO, function(d) {
            that.forward = 1;
            that.time += d["Delta Time"].val;

            let time = that.time;
            if (time >= 0 && time <= 0.3) {
                that.forward = 0;
                that.backward = 1;
                that.right = 0;
                that.left = 1;
            } else if (time > 0.3 && time <= 0.6) {
                that.forward = 1;
                that.backward = 0;
                that.right = 1;
                that.left = 0;
            } else {
                that.time = 0;
            }
        });
    }

    run() {
        eventManager.publish(Topics.CAR_STEER, { left: this.left, right: this.right, forward: this.forward, backward: this.backward });
    }
}