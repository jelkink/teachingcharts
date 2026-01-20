import * as math from "mathjs"

function round(num) {

    if (!math.isNumber(num)) {
        return NaN
    }

    if (Math.abs(num) >= .1) {
        return (Math.round(num * 100) / 100).toFixed(3)
    } else if (Math.abs(num) >= .00001) {
        return num.toPrecision(3)
    } else {
        return num.toFixed(3)
    }
}

function outer(a, b) {
    return math.multiply(math.reshape(a, [a._size[0], 1]), math.reshape(b, [1, b._size[0]]))
}

function repeat(value, length) {
    return Array.apply(null, Array(length)).map(function() { return value })
}

function sig(p) {
    if (p < 0.01) {
        return "***"
    } else if (p < 0.05) {
        return "**"
    } else if (p < 0.1) {
        return "*"
    } else {
        return ""
    }
}

function relabel(v, base=1) {
    const levels = Array.from(new Set(v))
    const map = new Map(levels.map((x, i) => [x, i + base]))
    return v.map(x => map.get(x))
}

// This function is written by ChatGPT, GPT-5 Mini
function logGamma(xx) {
  const cof = [76.18009172947146,-86.50532032941677,24.01409824083091,
               -1.231739572450155,0.1208650973866179e-2,-0.5395239384953e-5]
  let x = xx - 1
  let tmp = x + 5.5
  tmp -= (x + 0.5) * Math.log(tmp)
  let ser = 1.000000000190015
  for (let j = 0; j < cof.length; j++) {
    x += 1
    ser += cof[j]/x
  }
  return -tmp + Math.log(2.5066282746310005*ser)
}

// This function is written by ChatGPT, GPT-5 Mini
function betaIncomplete(a,b,x) {
  if (x < 0 || x > 1) throw new Error("x must be in [0,1]")

  function bt() {
    return Math.exp(logGamma(a+b) - logGamma(a) - logGamma(b) +
                    a*Math.log(x) + b*Math.log(1-x))
  }

  if (x === 0) return 0
  if (x === 1) return 1

  let swap = false
  if (x > (a+1)/(a+b+2)) {
    swap = true;
    [a,b] = [b,a];
    x = 1 - x;
  }

  let m = 0, qab = a+b, qap = a+1, qam = a-1
  let c = 1, d = 1 - qab*x/qap
  if (Math.abs(d) < 1e-30) d = 1e-30
  d = 1/d
  let h = d

  for (let m = 1; m <= 100; m++) {
    let m2 = 2*m
    let aa = m*(b-m)*x/((qam+m2)*(a+m2))
    d = 1 + aa*d
    if (Math.abs(d) < 1e-30) d = 1e-30
    c = 1 + aa/c
    if (Math.abs(c) < 1e-30) c = 1e-30
    d = 1/d
    h *= d*c

    aa = -(a+m)*(qab+m)*x/((a+m2)*(qap+m2))
    d = 1 + aa*d
    if (Math.abs(d) < 1e-30) d = 1e-30
    c = 1 + aa/c
    if (Math.abs(c) < 1e-30) c = 1e-30
    d = 1/d
    let del = d*c
    h *= del
    if (Math.abs(del-1.0) < 3e-7) break
  }

  let result = bt()/a * h
  if (swap) result = 1 - result
  return result
}

function pf(f, df1, df2) {
  const x = df1*f / (df1*f + df2);
  return betaIncomplete(df1/2, df2/2, x);
}

export { round, repeat, sig, relabel, outer, logGamma, betaIncomplete, pf }

