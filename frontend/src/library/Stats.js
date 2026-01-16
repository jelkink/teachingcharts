import * as math from "mathjs"
import { repeat } from "./Utils.js"

function rand_normal(mean=0, stdev=1) {
    const u = 1 - Math.random()
    const v = Math.random()
    const z = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v )
    return z * stdev + mean
}

function mean(v) {

    return v.reduce((acc, val) => acc + val) / v.length
}

function variance(v) {

    const mu = mean(v)

    return v.map(x => Math.pow(x - mu, 2)).reduce((acc, val) => acc + val) / v.length
}

function stddev(v) {

    return Math.sqrt(variance(v))
}

function covariance(v1, v2) {

    const mu1 = mean(v1)
    const mu2 = mean(v2) 

    return mean(v1.map((x, i) => (x - mu1) * (v2[i] - mu2)))
}

function chisquared(v1, v2) {

    let chi2 = 0.0

    const n = v1.length

    function relabel(v) {
        const levels = Array.from(new Set(v))
        const map = new Map(levels.map((x, i) => [x, i + 1]))
        return v.map(x => map.get(x))
    }

    const v1r = relabel(v1)
    const v2r = relabel(v2)

    const I = math.max(v1r)
    const J = math.max(v2r)

    var table = math.zeros(I, J)
    for (let i = 0; i < v1.length; i++) {
        table._data[v1r[i]-1][v2r[i]-1] += 1
    }

    const row_sums = math.multiply(table, math.ones(J))._data
    const col_sums = math.multiply(math.ones(I), table)._data

    for (let i = 0; i < I; i++) {
        for (let j = 0; j < J; j++) {
            const expected = (row_sums[i] * col_sums[j]) / n

            if (expected !== 0) {
                chi2 += Math.pow(table._data[i][j] - expected, 2) / expected
            }
        }
    }

    const df = (I - 1) * (J - 1)

    // Using Wilson–Hilferty normal approximation
    const z = (Math.pow(chi2 / df, 1/3) - (1 - 2/(9 * df))) / Math.sqrt(2/(9 * df))
    const p = 1 - 0.5 * (1 + math.erf(z / Math.sqrt(2)))

    const CramersV = Math.sqrt(chi2 / (n * Math.min(I - 1, J - 1)))

    return { chi2, df, p, CramersV, n }
}

function multipleRegression(y, X) {

    const Xmatrix = math.transpose(math.matrix(X))
    const ymatrix = math.matrix(y)

    const n = y.length
    const k = X.length

    const Xt = math.transpose(Xmatrix)
    const XtX = math.multiply(Xt, Xmatrix)
    const XtX_inv = math.inv(XtX)
    const XtY = math.multiply(Xt, ymatrix)
    const B = math.multiply(XtX_inv, XtY)

    const yhat = math.multiply(Xmatrix, B)
    const e = math.subtract(ymatrix, yhat)
    const rss = math.sum(math.dotPow(e, 2))
    const s2 = rss / (n - k)

    const se = math.map(math.diag(math.multiply(XtX_inv, s2)), math.sqrt)

    const R2 = 1 - rss / math.sum(math.dotPow(math.subtract(ymatrix, mean(y)), 2))

    return [ B._data, se._data, n, R2, k ]
}

function linearRegression(y, x) {

    return multipleRegression(y, [repeat(1, y.length), x])
}

function minimum(v) {

    var min = v[0]

    for (var i = 0; i < v.length; i++) {
        if (v[i] < min) { min = v[i]; }
    }  

    return min
}

function maximum(v) {

    var max = v[0]

    for (var i = 0; i < v.length; i++) {
        if (v[i] > max) { max = v[i]; }
    }  

    return max
}

export { rand_normal, minimum, maximum, mean, stddev, variance, covariance, linearRegression, multipleRegression, chisquared };