/**
 * 1€ (One Euro) Filter for smooth landmark tracking without jitter or lag
 */
export class OneEuroFilter {
  constructor(freq = 30, mincutoff = 1.0, beta = 0.007, dcutoff = 1.0) {
    this.freq = freq;
    this.mincutoff = mincutoff;
    this.beta = beta;
    this.dcutoff = dcutoff;
    this.x = new LowPassFilter(this.alpha(mincutoff));
    this.dx = new LowPassFilter(this.alpha(dcutoff));
    this.lastTime = null;
  }

  alpha(cutoff) {
    const te = 1.0 / this.freq;
    const tau = 1.0 / (2 * Math.PI * cutoff);
    return 1.0 / (1.0 + tau / te);
  }

  filter(val, timestamp) {
    if (this.lastTime !== null && timestamp) {
      this.freq = 1.0 / Math.max((timestamp - this.lastTime) / 1000, 0.001);
    }
    this.lastTime = timestamp;

    const dval = this.x.hasLast() ? (val - this.x.last()) * this.freq : 0;
    const edval = this.dx.filterWithAlpha(dval, this.alpha(this.dcutoff));
    const cutoff = this.mincutoff + this.beta * Math.abs(edval);
    return this.x.filterWithAlpha(val, this.alpha(cutoff));
  }

  reset() {
    this.x.reset();
    this.dx.reset();
    this.lastTime = null;
  }
}

class LowPassFilter {
  constructor(alpha) {
    this.setAlpha(alpha);
    this.y = null;
    this.s = null;
  }

  setAlpha(alpha) {
    this.alpha = alpha;
  }

  filterWithAlpha(val, alpha) {
    this.setAlpha(alpha);
    return this.filter(val);
  }

  filter(val) {
    if (this.y === null) {
      this.s = val;
    } else {
      this.s = this.alpha * val + (1.0 - this.alpha) * this.s;
    }
    this.y = val;
    return this.s;
  }

  hasLast() {
    return this.y !== null;
  }

  last() {
    return this.y;
  }

  reset() {
    this.y = null;
    this.s = null;
  }
}

/**
 * Filter container for 2D Neck Anchor coordinates
 */
export class PoseSmoother {
  constructor() {
    this.fx = new OneEuroFilter(30, 1.2, 0.015);
    this.fy = new OneEuroFilter(30, 1.2, 0.015);
    this.fw = new OneEuroFilter(30, 1.0, 0.01);
    this.fRot = new OneEuroFilter(30, 1.5, 0.02);
  }

  smooth({ x, y, width, rotation }, timestamp = performance.now()) {
    return {
      x: this.fx.filter(x, timestamp),
      y: this.fy.filter(y, timestamp),
      width: this.fw.filter(width, timestamp),
      rotation: this.fRot.filter(rotation, timestamp)
    };
  }

  reset() {
    this.fx.reset();
    this.fy.reset();
    this.fw.reset();
    this.fRot.reset();
  }
}
