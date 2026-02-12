import * as math from "mathjs"
import { repeat, relabel, outer, pf, dummyCode, interactionTerms } from "./Utils.js"

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

    if (math.det(XtX) === 0) {
        console.log("Singular matrix in multiple regression")
        console.log("X: ", Xmatrix)
        return { B: repeat(NaN, k), se: repeat(NaN, k), p: repeat(NaN, k), R2: NaN, n, k }
    }

    const XtX_inv = math.inv(XtX)
    const XtY = math.multiply(Xt, ymatrix)
    const B = math.multiply(XtX_inv, XtY)

    const yhat = math.multiply(Xmatrix, B)
    const e = math.subtract(ymatrix, yhat)
    const rss = math.sum(math.dotPow(e, 2))
    const s2 = rss / (n - k)

    const se = math.map(math.diag(math.multiply(XtX_inv, s2)), math.sqrt)
    const z = math.abs(math.dotDivide(B, se))
    const phi = math.subtract(1, math.erf(math.dotDivide(z, Math.sqrt(2))))
    const p = math.dotMultiply(2, phi)

    const R2 = 1 - rss / math.sum(math.dotPow(math.subtract(ymatrix, mean(y)), 2))

    return { B: B._data, se: se._data, p: p._data, R2, n, k, rss }
}

function linearRegression(y, x) {

    return multipleRegression(y, [repeat(1, y.length), x])
}

function anova(v1, v2, v3=null) {

    const oneWay = v3 === null

    const n = v1.length

    const y = v1
    const x1 = relabel(v2)
    const x2 = oneWay ? Array(n).fill(0) : relabel(v3)
    const intercept = Array(n).fill(1)

    const I = math.max(x1)
    const J = math.max(x2)

    const x1dummies = dummyCode(x1).slice(1)

    const X0 = [intercept]
    const X1 = [intercept, ...x1dummies]

    let RSS0 = multipleRegression(y, X0).rss
    let RSS1 = multipleRegression(y, X1).rss
    let RSS2 = RSS1
    let RSS3 = RSS1
    let RSS4 = RSS1

    if (!oneWay) {
        const x2dummies = dummyCode(x2).slice(1)

        const X2 = [intercept, ...x1dummies, ...x2dummies]
        RSS2 = multipleRegression(y, X2).rss

        const interactions = interactionTerms(x1dummies, x2dummies)
        const X3 = [intercept, ...x1dummies, ...x2dummies, ...interactions]
        RSS3 = multipleRegression(y, X3).rss

        const X4 = [intercept, ...x2dummies]
        RSS4 = multipleRegression(y, X4).rss
    }

    const ss1 = oneWay ? RSS0 - RSS1 : RSS4 - RSS3
    const ss2 = oneWay ? 0 : RSS1 - RSS3
    const ss3 = oneWay ? 0 : RSS2 - RSS3
    const sse = oneWay ? RSS1 : RSS3

    const df1 = I - 1
    const df2 = oneWay ? 0 : J - 1
    const df3 = df1 * df2
    const dfe = n - (1 + df1 + df2 + df3)

    const ms1 = ss1 / df1
    const ms2 = oneWay ? 0 : ss2 / df2
    const ms3 = oneWay ? 0 : ss3 / df3
    const mse = sse / dfe

    const f1 = ms1 / mse
    const f2 = oneWay ? 0 : ms2 / mse
    const f3 = oneWay ? 0 : ms3 / mse

    const p1 = 1-pf(f1, df1, dfe)
    const p2 = oneWay ? null : 1-pf(f2, df2, dfe)
    const p3 = oneWay ? null : 1-pf(f3, df3, dfe)

    return { ss1: ss1, ss2: ss2, ss3: ss3, sse: sse, df1: df1, df2: df2, df3: df3, dfe: dfe, ms1: ms1, ms2: ms2, ms3: ms3, mse: mse, f1: f1, f2: f2, f3: f3, p1: p1, p2: p2, p3: p3, n: n }
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

export { rand_normal, minimum, maximum, mean, stddev, variance, covariance, linearRegression, multipleRegression, chisquared, anova };