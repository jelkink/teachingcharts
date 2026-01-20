import { tabulate, split_by_group, tabulate_bivariate } from "./Tabulate"
import { mean, stddev, minimum, maximum, linearRegression, multipleRegression, chisquared } from "./Stats"
import { round, sig } from "./Utils.js"

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

Data.prototype.getIndependenceTestTable = function(yname, xname) {

    const yvar = this.getVariable(yname)
    const xvar = this.getVariable(xname)

    const n = yvar.values.length

    const chisq = chisquared(xvar.values, yvar.values)

    var res = "<table>"
    res += "<tr><td colspan=\"3\" align=\"left\"><b>Chi-squared test of association</b></td></tr>"
    res += "<tr class=\"dividerBottom\"><td></td><td>Value</td><td></td></tr>"
    res += "<tr><td>Cramér's V</td><td align=\"right\">" + round(chisq.CramersV) + "</td><td></td></tr>"
    res += "<tr><td>Chi-squared</td><td align=\"right\">" + round(chisq.chi2) + "</td><td>" + sig(chisq.p) + "</td></tr>"
    res += "<tr class=\"dividerTop\"><td>Degrees of freedom</td><td align=\"right\">" + chisq.df + "</td><td></td></tr>"
    res += "<tr><td>n</td><td align=\"right\">" + chisq.n + "</td><td></td></tr>"
    res += "</table><br/><br/>"

    res += "<i>* indicates statistical significance at α = 0.1; ** at α = 0.05; and *** at α = 0.01</i>"

    return res
}

Data.prototype.getRegressionTable = function(yname, xname) {

    const yvar = this.getVariable(yname)
    const xvar = this.getVariable(xname)

    const y = yvar.values
    const x = xvar.values

    var res = "Dependent variable: <i>" + yname + "</i><br/><br/>"

    const coef = linearRegression(y, x)

    res += "<table>"
    res += "<tr class=\"dividerBottom\"><td></td><td>Estimate</td><td>Std. Error</td></tr>"
    res += "<tr><td>Intercept</td><td align=\"right\">" + round(coef.B[0]) + "</td>"
    res += "<td align=\"right\">(" + round(coef.se[0]) + ")</td>"
    res += "<td>" + sig(coef.p[0]) + "</td></tr>"
    res += "<tr><td><i>" + xname + "</i></td><td align=\"right\">" + round(coef.B[1]) + "</td>"
    res += "<td align=\"right\">(" + round(coef.se[1]) + ")</td>"
    res += "<td>" + sig(coef.p[1]) + "</td></tr>"
    res += "<tr class=\"dividerTop\"><td>n</td><td align=\"right\">" + coef.n + "</td><td></td></tr>"
    res += "<tr><td>R²</td><td align=\"right\">" + round(coef.R2) + "</td><td></td></tr>"
    res += "</table><br/><br/>"
    
    res += "<i>* indicates statistical significance at α = 0.1; ** at α = 0.05; and *** at α = 0.01</i>"

    return res
}


Data.prototype.getMultipleRegressionTable = function(yname, xname, zname) {

    const yvar = this.getVariable(yname)
    const xvar = this.getVariable(xname)
    const zvar = this.getVariable(zname)

    if (zvar.length === 0) return this.getRegressionTable(yname, xname)

    const labels = Object.keys(tabulate(zvar, true))
    const groups = Object.keys(tabulate(zvar, false))

    const y = yvar.values

    var X = []

    groups.map((group) => {
        X.push(zvar.values.map((val) => val == group ? 1 : 0))
    })   

    groups.map((group) => {
        X.push(xvar.values.map((val, key) => zvar.values[key] == group ? val : 0))
    })   

    const coef = multipleRegression(y, X)

    const k = coef.k

    var res = "Dependent variable: <i>" + yname + "</i><br/><br/>"

    res += "<table>"
    res += "<tr class=\"dividerBottom\"><td></td><td>Estimate</td><td>Std. Error</td></tr>"

    for (let i = 0; i < k; i++) {

        const b = coef.B[i]
        const se = coef.se[i]

        if (i < k / 2) {
            var label = zname + " = " + labels[i]
        } else {
            var label = xname + " (" + zname + " = " + labels[i - k / 2] + ")"
        }

        res += "<tr><td><i>" + label + "</i></td>"
        res += "<td align=\"right\">" + round(b) + "</td>"
        res += "<td align=\"right\">(" + round(se) + ")</td>"
        res += "<td>" + (Math.abs(b / se) > 1.96 ? "*" : "") + "</td></tr>"
    }

    res += "<tr class=\"dividerTop\"><td>n</td><td align=\"right\">" + coef.n + "</td><td></td></tr>"
    res += "<tr><td>R²</td><td align=\"right\">" + round(coef.R2) + "</td><td></td></tr>"
    res += "</table><br/><br/>"
    res += "<i>* indicates statistical significance at α = 0.05</i>"

    return res
}

export default Data