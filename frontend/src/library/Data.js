import { tabulate, split_by_group } from "./Tabulate"
import { mean, stddev, minimum, maximum, linearRegression } from "./Stats"

function round(num) {
    if (Math.abs(num) >= .1) {
        return (Math.round(num * 100) / 100).toFixed(2)
    } else {
        return num.toPrecision(3)
    }
}

function Data() {

    this.data = null
    this.filename = ""
}

Data.prototype.changeFile = async function(name) {

    this.filename = name
    await this.load()
}

Data.prototype.load = async function() {

    console.log("Loading data (" + this.filename + ")")

    try {
        const response = await fetch(process.env.PUBLIC_URL + "/data/" + this.filename + "_data.json")
        this.data = await response.json()
    } catch (error) {
        console.log("ERROR Fetching data files: ", error)
    }
}

Data.prototype.getVariableNames = function() {
    if (this.data !== null) {
        return [''].concat(Object.keys(this.data))
    } else {
        return ['']
    }
}

Data.prototype.hasVariable = function(v) {
    if (this.data !== null) {
        return Object.keys(this.data).includes(v)
    } else {
        return false
    }
}

Data.prototype.getVariable = function(v) {
    if (this.hasVariable(v)) {
        return this.data[v]
    } else {
        return []
    }
}

Data.prototype.getValueLabels = function(v) {
    if (this.hasVariable(v)) {
        if (this.data[v].labels) {
            return [''].concat(Object.values(this.data[v].labels))
        } else {
            return [''].concat(Object.keys(tabulate(this.data[v])))
        }
    } else {
        return ['']
    }
}

Data.prototype.getDescription = function(v) {

    var res = "<i>" + v + "</i>: "

    v = this.getVariable(v)

    const table = tabulate(v)

    res += v.label
    res += "<br/><br/><table>"

    if (v.labels) {
        for (const key in v.labels) {
            res += "<tr><td>" + key + "</td><td>" + v.labels[key] + "</td><td>" + table[v.labels[key]] + "</td></tr>"
        }
    } else {

        res += "<tr><td>Minimum</td><td>" + round(minimum(v.values)) + "</td></tr>"
        res += "<tr><td>Mean</td><td>" + round(mean(v.values)) + "</td></tr>"
        res += "<tr><td>Maximum</td><td>" + round(maximum(v.values)) + "</td></tr>"
        res += "<tr><td>Standard deviation</td><td>" + round(stddev(v.values)) + "</td></tr>"
    }

    res += "</table>"

    return res
}

Data.prototype.getRegressionTables = function(yname, xname, zname) {

    const yvar = this.getVariable(yname)
    const xvar = this.getVariable(xname)
    const zvar = this.getVariable(zname)

    const y = zvar == [] ? [yvar.values] : split_by_group(yvar, zvar).map((y) => y.values)
    const x = zvar == [] ? [xvar.values] : split_by_group(xvar, zvar).map((x) => x.values)

    const labels = zvar == [] ? xvar.label : Object.keys(tabulate(zvar, true))

    var res = "Dependent variable: <i>" + yname + "</i><br/><br/>"

    y.forEach((val, key) => {

        const coef = linearRegression(y[key], x[key])

        res += "<table>"

        if (zvar != []) {
            res += "<tr><td colspan=\"4\" align=\"left\"><b>Model " + (key + 1) + "</b> (<i>" + zname + "</i> = " + labels[key] + ")</td></tr>"
        }

        res += "<tr style=\"border-bottom:1px solid black\"><td></td><td>Estimate</td><td>Std. Error</td></tr>"
        res += "<tr><td><i>" + xname + "</i></td><td align=\"right\">" + round(coef[1]) + "</td>"
        res += "<td align=\"right\">(" + round(coef[3]) + ")</td>"
        res += "<td>" + (Math.abs(coef[1] / coef[3]) > 1.96 ? "*" : "") + "</td></tr>"
        res += "<tr style=\"border-bottom:1px solid black\"><td>Intercept</td><td align=\"right\">" + round(coef[0]) + "</td>"
        res += "<td align=\"right\">(" + round(coef[2]) + ")</td>"
        res += "<td>" + (Math.abs(coef[0] / coef[2]) > 1.96 ? "*" : "") + "</td></tr>"
        res += "<tr><td>n</td><td align=\"right\">" + coef[4] + "</td><td></td></tr>"
        res += "<tr style=\"border-bottom:1px solid black\"><td>R²</td><td align=\"right\">" + round(coef[5]) + "</td><td></td></tr>"
        res += "</table><br/><br/>"
    })

    res += "<i>* indicates statistical significance at α = 0.05</i>"

    return res
}

export default Data