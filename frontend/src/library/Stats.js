import * as math from "mathjs"
import { repeat, relabel, outer, pf } from "./Utils.js"

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

function anova(v1, v2, v3=null) {

    const oneWay = v3 === null
    
    const y = math.matrix(v1)
    const x1 = math.matrix(relabel(v2, 0))
    const x2 = oneWay ? math.zeros(v1.length) : math.matrix(relabel(v3, 0))

    const n = v1.length

    const I = math.max(x1) + 1
    const J = math.max(x2) + 1

    var cell_means = math.zeros(I, J)
    var cell_counts = math.zeros(I, J)
    for (let i = 0; i < n; i++) {
        const xi = x1._data[i]
        const xj = x2._data[i]
        cell_means._data[xi][xj] += y._data[i]
        cell_counts._data[xi][xj] += 1
    }
    cell_means = math.dotDivide(cell_means, cell_counts)

    const ni = math.sum(cell_counts, 1)
    const nj = math.sum(cell_counts, 0)
    const mu = mean(y._data)

    const marg_means_i = math.dotMultiply(math.multiply(math.dotMultiply(cell_means, cell_counts), math.ones(J)), math.dotDivide(1, ni))
    const marg_means_j = math.dotMultiply(math.transpose(math.multiply(math.ones(I), math.dotMultiply(cell_means, cell_counts))), math.dotDivide(1, nj))

    const mmi = outer(marg_means_i, math.ones(J))
    const mmj = outer(math.ones(I), marg_means_j)

    const tss = math.sum(math.dotPow(math.subtract(y, mu), 2))

    const ss1 = math.sum(math.dotMultiply(math.dotPow(math.subtract(marg_means_i, mu), 2), ni))
    const ss2 = oneWay ? 0 : math.sum(math.dotMultiply(math.dotPow(math.subtract(marg_means_j, mu), 2), nj))
    const ss3 = oneWay ? 0 : math.sum(math.dotMultiply(math.dotPow(math.add(math.subtract(cell_means, math.add(mmi, mmj)), mu), 2), cell_counts))
    const sse = oneWay ? tss - ss1 : tss - ss1 - ss2 - ss3

    const df1 = I - 1
    const df2 = J - 1
    const df3 = df1 * df2
    const dfe = oneWay ? n - I : n - (I * J)

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

    return { tss: tss, ss1: ss1, ss2: ss2, ss3: ss3, sse: sse, df1: df1, df2: df2, df3: df3, dfe: dfe, ms1: ms1, ms2: ms2, ms3: ms3, mse: mse, f1: f1, f2: f2, f3: f3, p1: p1, p2: p2, p3: p3, n: n }
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

    return { B: B._data, se: se._data, p: p._data, R2, n, k }
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

export { rand_normal, minimum, maximum, mean, stddev, variance, covariance, linearRegression, multipleRegression, chisquared, anova };