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

function linearRegression(v1, v2) { 

    const n = v1.length
    const variance_v2 = variance(v2)
    const covariance_v1_v2 = covariance(v1, v2)

    const slope = covariance_v1_v2
    const intercept = mean(v1) - slope * mean(v2)
    const yhat = v2.map(x => intercept + slope * x)
    const e = v1.map((y, i) => y - yhat[i])
    const rss = e.map(x => x * x).reduce((acc, val) => acc + val)
    const s = Math.sqrt(rss  / (n - 2))
    const se_slope = s / Math.sqrt(n) * 1 / Math.sqrt(variance_v2)
    const se_intercept = s / Math.sqrt(n) * Math.sqrt(1 + Math.pow(mean(v2), 2) / variance_v2)
    const R2 = Math.pow(covariance_v1_v2, 2) / (variance(v1) * variance_v2)
    
    return [ intercept, slope, se_intercept, se_slope, n, R2 ]
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

export { rand_normal, minimum, maximum, mean, stddev, variance, covariance, linearRegression };