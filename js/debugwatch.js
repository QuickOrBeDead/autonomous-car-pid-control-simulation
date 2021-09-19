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
        
        let currentY = this.startY;
        const data = this.data;
        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                const element = data[key];
                const value = element.toString();
                const text = key + ": " + value;
                const measure = ctx.measureText(text);
                if (measure.width > 175) {
                    currentY += this.lineSize;
                    ctx.fillText(key + ": ", this.startX, currentY);
                    
                    currentY += this.lineSize;
                    ctx.fillText(value, this.startX, currentY);
                } else {
                    currentY += this.lineSize;   
                    
                    ctx.fillText(text, this.startX, currentY);
                }

            }
        }

        ctx.restore();
    }
}