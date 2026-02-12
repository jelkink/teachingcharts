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

function dummyCode(x) {

    const cols = []
    var xint = relabel(x)
    const levels = math.max(...xint)
    for (let l = 1; l <= levels; l++) {
        cols.push(xint.map(x => x === l ? 1 : 0))
    }

    return cols
}

function interactionTerms(A, B) {
    const terms = []
    for (let a of A) {
        for (let b of B) {
            terms.push(a.map((x,i) => x * b[i]))
        }
    }
    return terms
}

// Based on https://visualstudiomagazine.com/articles/2022/08/02/logbeta-loggamma-functions-csharp.aspx
function logGamma(z) {

    const coef = [76.18009172947146,-86.50532032941677,24.01409824083091,
                 -1.231739572450155,0.1208650973866179e-2,-0.5395239384953e-5]

    if (z < 0.5) {
        return Math.log(Math.PI / Math.sin(Math.PI * z)) - logGamma(1.0 - z)
    }

    let zz = z - 1
    let b = z + 5.5
    let sum = coef[0]

    for (let i = 0; i < coef.length; i++) {
        sum += coef[i] / (zz + i)
    }

    return 0.91893853320467274178 + Math.log(sum) - b + Math.log(b) * (zz + 0.5)
}

// Based on https://visualstudiomagazine.com/articles/2022/08/02/logbeta-loggamma-functions-csharp.aspx
function logBeta(a, b) {

    return logGamma(a) + logGamma(b) - logGamma(a + b)
}

// Based on https://visualstudiomagazine.com/articles/2022/08/02/logbeta-loggamma-functions-csharp.aspx
function approxContinuedFraction(x, a, b) {

    const maxTerms = 100

    var d = new Array(maxTerms).fill(0)

    for (let m = 0; m < (maxTerms / 2); m++) {
        
        let i = 2 * m
        let j = i + 1
        
        d[i] = (m * (b - m) * x) / ((a + 2 * m - 1) * (a + 2 * m))
        d[j] = -1 * ((a + m) * (a + b + m) * x) / ((a + 2 * m) * (a + 2 * m + 1))
    }

    let t = new Array(maxTerms).fill(0)
    t[maxTerms - 1] = 1 + d[maxTerms - 1]
    for (let j = maxTerms - 2; j >= 1; j--) {
        t[j] = 1 + d[j] / t[j + 1]
    }

    return 1 / t[1]
}

// Based on https://visualstudiomagazine.com/articles/2022/08/02/logbeta-loggamma-functions-csharp.aspx
function regIncBeta(x, a, b) {

    let cf = approxContinuedFraction(x, a, b)
    let logTop = (a * Math.log(x)) + (b * Math.log(1 - x))
    let logBot = Math.log(a) + logBeta(a, b)
    let logLeft = logTop - logBot
    
    return Math.exp(logLeft) * cf
}

// Based on https://visualstudiomagazine.com/articles/2022/08/02/logbeta-loggamma-functions-csharp.aspx
function regularizedIncompleteBeta(x, a, b) {

  // pick the form of RegIncompleteBeta() that converges best
  if (x < (a + 1.0) / (a + b + 2.0))
    return regIncBeta(x, a, b)
  else
    return 1.0 - regIncBeta(1 - x, b, a)
}

function pf(f, df1, df2) {

    const x = df1*f / (df1*f + df2)
    return regularizedIncompleteBeta(x, df1/2, df2/2)
}

export { round, repeat, sig, relabel, outer, logGamma, pf, dummyCode, interactionTerms }

