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

export { rand_normal, minimum, maximum, mean, stddev, variance, covariance, linearRegression, multipleRegression };