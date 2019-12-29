class Track {
    constructor() {
        this.outerPoints = [[250, 250], [1500, 250], [1500, 400], [1200, 400], [1200, 500], [1500, 500], [1500, 800], [250, 800], [250, 500], [1000, 500], [1000, 400], [250, 400]];
        this.innerPoints = [[300, 300], [1450, 300], [1450, 350], [1150, 350], [1150, 550], [1450, 550], [1450, 750], [300, 750], [300, 550], [1050, 550], [1050, 350], [300, 350]].reverse();
        this.startX = 375;
        this.startY = 275;
    }

    draw(ctx) {
        ctx.save();

        ctx.fillStyle = "#F8F8F8";
        ctx.strokeStyle = "#7A7A7A";

        ctx.beginPath();
        this.drawLines(ctx, this.outerPoints);
        this.drawLines(ctx, this.innerPoints);
        ctx.stroke();
        ctx.fill();

        ctx.restore();
    }

    drawLines(ctx, points) {
        const len = points.length;
        const firstPoint = points[0];
        const firstX = firstPoint[0];
        const firstY = firstPoint[1];

        ctx.moveTo(firstX, firstY);
        for (let i = 1; i < len; i++) {
            const point = points[i];
            ctx.lineTo(point[0], point[1]);
        }
        ctx.closePath();
    }

    lineSegmentIntersect(x1, y1, x2, y2, calcIntersectionPoint) {
        const outerPoints = this.outerPoints,
              innerPoints = this.innerPoints,
              trackPointsLen = outerPoints.length;
              
        for (let j = 0; j < trackPointsLen; j++) {
            const nextIndex = j === trackPointsLen - 1 ? 0 : j + 1, 
                    outerPoint = outerPoints[j],
                    outerPointNext = outerPoints[nextIndex];
            let intersection = PhysicsHelper.lineSegmentIntersect(x1, y1, x2, y2, outerPoint[0], outerPoint[1], outerPointNext[0], outerPointNext[1], calcIntersectionPoint);
            if (intersection) {
                return intersection;
            }

            const innerPoint = innerPoints[j],
                  innerPointNext = innerPoints[nextIndex];
            intersection = PhysicsHelper.lineSegmentIntersect(x1, y1, x2, y2, innerPoint[0], innerPoint[1], innerPointNext[0], innerPointNext[1], calcIntersectionPoint);
            if (intersection) {
                return intersection;
            }
        }

        return false;
    }
}