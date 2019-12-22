class DebugWatch {
    constructor() {
        this.data = {};
        this.lineSize = 13;
        this.startX = 10;
        this.startY = 10;
    }

    set(key, value) {
        this.data[key] = value;
    }

    draw(ctx) {
        ctx.save();

        ctx.fillStyle = "rgba(0,0,0,0.5)";
        
        let i = 0;
        const data = this.data;
        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                const element = data[key];
                ctx.fillText(key + ": " + element.toString(), this.startX, this.startY + (i++) * this.lineSize);
            }
        }

        ctx.restore();
    }
}