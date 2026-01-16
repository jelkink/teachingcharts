function round(num) {
    if (Math.abs(num) >= .1) {
        return (Math.round(num * 100) / 100).toFixed(3)
    } else if (Math.abs(num) >= .00001) {
        return num.toPrecision(3)
    } else {
        return num.toFixed(3)
    }
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

export { round, repeat, sig };