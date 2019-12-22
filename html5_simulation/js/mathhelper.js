class MathHelper {
    static PI2 = Math.PI * 2;
    static HALFPI = Math.PI / 2;

    static degreeToRadians(degree) {
        return degree * Math.PI / 180;
    }

    static radiansToDegree(radians) {
        return 180 * radians / Math.PI;
    }
}