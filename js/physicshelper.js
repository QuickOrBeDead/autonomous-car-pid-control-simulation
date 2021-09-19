class PhysicsHelper {
    static lineSegmentIntersect(x1, y1, x2, y2, x3, y3, x4, y4, calcIntersectionPoint) {
        const a1 = y2 - y1,
              a2 = y4 - y3,
              b1 = x2 - x1,
              b2 = x4 - x3,
              c1 = y1 - y3,
              c2 = x1 - x3,
              d = a2 * b1 - b2 * a1;
        const uA = (b2 * c1 - a2 * c2) / d;
        const uB = (b1 * c1 - a1 * c2) / d;

        if (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1) {
            if (calcIntersectionPoint) {
                return {
                    x: x1 + uA * b1,
                    y: y1 + uA * a1
                };
            } else {
                return true;
            }
        }

        return false;
    }
}