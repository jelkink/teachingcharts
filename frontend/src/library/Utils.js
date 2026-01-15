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

export { round, repeat };