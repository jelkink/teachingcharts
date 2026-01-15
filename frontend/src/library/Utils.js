function round(num) {
    if (Math.abs(num) >= .1) {
        return (Math.round(num * 100) / 100).toFixed(2)
    } else {
        return num.toPrecision(3)
    }
}

function repeat(value, length) {
    return Array.apply(null, Array(length)).map(function() { return value })
}

export { round, repeat };