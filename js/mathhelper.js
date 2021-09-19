class MathHelper {
    static PI2 = Math.PI * 2;
    static HALFPI = Math.PI / 2;

    static degreeToRadians(degree) {
        return degree * Math.PI / 180;
    }

    static radiansToDegree(radians) {
        return 180 * radians / Math.PI;
    }

    static calculateRotationX(x, y, angle) {
        return x * Math.cos(angle) - y * Math.sin(angle);
    }

    static calculateRotationY(x, y, angle) {
        return y * Math.cos(angle) + x * Math.sin(angle);
    }

    static distance(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
    }
}