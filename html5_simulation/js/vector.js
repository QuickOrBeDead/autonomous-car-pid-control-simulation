class Vector {
    constructor(x, y) {
        this.x = x || 0;
        this.y = y || 0;
    }

    negate() {
		this.x = -this.x;
		this.y = -this.y;
		return this;
    }
    
	add(v) {
		this.x += v.x;
		this.y += v.y;
		return this;
	}
	
	addScalar(a, b) {
		this.x += a;
		this.y += b === undefined ? a : b;
		return this;
	}
    
	subtract(v) {
		if (v instanceof Vector) {
			this.x -= v.x;
			this.y -= v.y;
		} else {
			this.x -= v;
			this.y -= v;
		}
		return this;
    }
    
	multiply(v) {
		if (v instanceof Vector) {
			this.x *= v.x;
			this.y *= v.y;
		} else {
			this.x *= v;
			this.y *= v;
		}
		return this;
    }
    
	divide(v) {
		if (v instanceof Vector) {
			if(v.x != 0) this.x /= v.x;
			if(v.y != 0) this.y /= v.y;
		} else {
			if(v != 0) {
				this.x /= v;
				this.y /= v;
			}
		}
		return this;
    }
    
	equals(v) {
		return this.x === v.x && this.y === v.y;
    }
    
	dotProduct(v) {
		return this.x * v.x + this.y * v.y;
    }
    
	crossProduct(v) {
		return this.x * v.y - this.y * v.x
    }
    
	length() {
		return Math.sqrt(this.dotProduct(this));
    }
    
	normalize() {
		return this.divide(this.length());
    }
    
	min() {
		return Math.min(this.x, this.y);
    }
    
	max() {
		return Math.max(this.x, this.y);
    }
    
	toAngles() {
		return -Math.atan2(-this.y, this.x);
    }
    
	angleTo(a) {
		return Math.acos(this.dotProduct(a) / (this.length() * a.length()));
    }
    
	toArray(n) {
		return [this.x, this.y].slice(0, n || 2);
    }
    
	clone() {
		return new Vector(this.x, this.y);
    }
    
	set(x, y) {
		this.x = x; this.y = y;
		return this;
	}

	toString() {
		return "(" + Math.floor(this.x) + " , " + Math.floor(this.y) + ")";
	}

    static negate(v) {
        return new Vector(-v.x, -v.y);
    }

    static add(a, b) {
        if (b instanceof Vector) {
            return new Vector(a.x + b.x, a.y + b.y);
        }
        else {
            return new Vector(a.x + b, a.y + b);
        }
    }

    static subtract(a, b) {
        if (b instanceof Vector) {
            return new Vector(a.x - b.x, a.y - b.y);
        }
        else {
            return new Vector(a.x - b, a.y - b);
        }
    }

    static multiply(a, b) {
        if (b instanceof Vector) {
            return new Vector(a.x * b.x, a.y * b.y);
        }
        else {
            return new Vector(a.x * b, a.y * b);
        }
    }

    static divide(a, b) {
        if (b instanceof Vector) {
            return new Vector(a.x / b.x, a.y / b.y);
        }
        else {
            return new Vector(a.x / b, a.y / b);
        }
    }

    static equals(a, b) {
        return a.x === b.x && a.y === b.y;
    }

    static dotProduct(a, b) {
        return a.x * b.x + a.y * b.y;
    }
    
    static crossProduct(a, b) {
        return a.x * b.y - a.y * b.x;
	}
	
	static create(x, y) {
        return new Vector(x, y);
    }
}