class Track {
    constructor() {
        this.outerPoints = [[200, 50], [1450, 50], [1450, 200], [1150, 200], [1150, 300], [1450, 300], [1450, 600], [200, 600], [200, 300], [950, 300], [950, 200], [200, 200]];
        this.innerPoints = [[250, 100], [1400, 100], [1400, 150], [1100, 150], [1100, 350], [1400, 350], [1400, 550], [250, 550], [250, 350], [1000, 350], [1000, 150], [250, 150]];
        this.startX = 225;
        this.startY = 75;
    }

    draw(ctx) {
        ctx.save();

        ctx.fillStyle = "#F8F8F8";
        ctx.strokeStyle = "#7A7A7A";

        ctx.beginPath();
        this.drawOuterLines(ctx);
        this.drawInnerLines(ctx);
        ctx.stroke();
        ctx.fill();

        ctx.restore();
    }

    drawOuterLines(ctx) {
        const points = this.outerPoints,
              len = points.length,
              firstPoint = points[0],
              firstX = firstPoint[0],
              firstY = firstPoint[1];

        ctx.moveTo(firstX, firstY);
        for (let i = 1; i < len; i++) {
            const point = points[i];
            ctx.lineTo(point[0], point[1]);
        }
        ctx.closePath();
    }

    drawInnerLines(ctx) {
        const points = this.innerPoints,
              lastIndex = points.length - 1,
              firstPoint = points[lastIndex],
              firstX = firstPoint[0],
              firstY = firstPoint[1],
              startIndex = lastIndex - 1;

        ctx.moveTo(firstX, firstY);

        for (let i = startIndex; i >= 0; i--) {
            const point = points[i];
            ctx.lineTo(point[0], point[1]);
        }
        ctx.closePath();
    }

    lineSegmentIntersect(x1, y1, x2, y2, calcIntersectionPoint) {
        const outerPoints = this.outerPoints,
              innerPoints = this.innerPoints,
              trackPointsLen = outerPoints.length,
              trackPointsLastIndex = trackPointsLen - 1;
              
        for (let j = 0; j < trackPointsLen; j++) {
            const nextIndex = j === trackPointsLastIndex ? 0 : j + 1, 
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