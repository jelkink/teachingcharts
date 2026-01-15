import { Chart, LinearScale, CategoryScale, registerables } from 'chart.js';
import { BoxPlotController, BoxAndWiskers } from "@sgratzl/chartjs-chart-boxplot"
import { tabulate, tabulate_bivariate, subset_variable, split_by_group, pair, bin } from "./Tabulate"
import { linearRegression, minimum, maximum } from "./Stats"

Chart.register(...registerables)
Chart.register(BoxPlotController, BoxAndWiskers, LinearScale, CategoryScale)    

const singleBarChart = function(var1, proportion) {

    const table = tabulate(var1, true, proportion)

    return({
        labels: Object.keys(table),
        datasets: [{
            data: Object.values(table),
            label: var1.label,
            type: "bar"
        }],
        backgroundColor: "blue",
        borderWidth: 1,
    })
}

const bivariateBarChart = function(var1, var2, proportion) {

    var tables = tabulate_bivariate(var1, var2, proportion)

    return({
        labels: Object.keys(tabulate(var1)),
        datasets: tables
    })
}

const histogram = function(var1, bins, proportion) {

    const table = bin(var1, bins, proportion)

    return({
        labels: Object.keys(table),
        datasets: [{
            data: Object.values(table),
            label: var1.label,
            type: "bar"
        }],
        backgroundColor: "blue",
        borderWidth: 1,
    })
}

const boxplot = function(var1) {

    return({
        labels: [var1.label],
        datasets: [{
            data: [var1.values],
            label: var1.label,
            type: "boxplot"
        }]
    })
}

const bivariateBoxplot = function(var1, var2) {

    const vars = split_by_group(var1, var2)

    return({
        labels: Object.keys(tabulate(var2)),
        datasets: [{
            data: vars.map((v) => v.values),
            label: vars.map((v) => v.labels),
            type: "boxplot"
        }]
    })
}

const trivariateBoxplot = function(var1, var2, var3) {

    const variables = split_by_group(var1, var3)
    const groups = split_by_group(var2, var3)

    const labels = tabulate(var3, true)

    var datasets = []

    variables.forEach((v, key) => {

        var v = bivariateBoxplot(v, groups[key]).datasets[0]
        v.label = Object.keys(labels)[key]

        datasets.push(v)
    })

    return({
        labels: Object.keys(tabulate(var2)),
        datasets: datasets
    })
}

const scatterPlot = function(var1, var2, var3, jitter, jitter_sd, regression = false) {

    const paired = pair(var2, var1, jitter, jitter_sd)

    var ds = [{
        label: var1.label + " by " + var2.label,
        data: paired,
        type: "scatter"
    }]

    if (regression) {

        const x1 = minimum(var2.values)
        const x2 = maximum(var2.values)
            
        const y = var3 === null ? [var1.values] : split_by_group(var1, var3).map((y) => y.values)
        const x = var3 === null ? [var2.values] : split_by_group(var2, var3).map((x) => x.values)

        const labels = var3 === null ? var2.label : Object.keys(tabulate(var3, true))

        y.forEach((val, key) => {

            const coef = linearRegression(y[key], x[key])[0]

            ds.push({
                label: labels[key],
                type: "line",
                data: [
                    { x: x1, y: x1 * coef[1] + coef[0] },
                    { x: x2, y: x2 * coef[1] + coef[0] }
                ]
            })
        })
    }

    return { datasets: ds }
}

class Plot {

    constructor() {
        this.chart = null
    }

    update(data, selectedGraph, selectedVar1, selectedVar2, selectedVar3, selectedVarSubset, selectedGroupSubset, subset, proportion, jitter, jitter_sd, bins, regression) {

        const ctx = document.getElementById("chart")

        var var1 = null
        var var2 = null
        var var3 = null
        var varSS = null
        var title = ''
        var labelX = ''
        var labelY = ''
        var showLegend = true

        if (data) {
            var1 = (data.hasVariable(selectedVar1) ? data.getVariable(selectedVar1) : null)
            var2 = (data.hasVariable(selectedVar2) ? data.getVariable(selectedVar2) : null)
            var3 = (data.hasVariable(selectedVar3) ? data.getVariable(selectedVar3) : null)
            varSS = (data.hasVariable(selectedVarSubset) ? data.getVariable(selectedVarSubset) : null)
        } 
        
        if (subset && varSS !== null && selectedGroupSubset !== ''){
            var1 = var1 ? subset_variable(var1, varSS, selectedGroupSubset) : null
            var2 = var2 ? subset_variable(var2, varSS, selectedGroupSubset) : null
            var3 = var3 ? subset_variable(var3, varSS, selectedGroupSubset) : null
            title = "\n(" + selectedVarSubset + " = " + selectedGroupSubset + ")"
        }

        if (selectedGraph) {

            const newGraph = this.chart === null || this.chart.type !== selectedGraph

            var data = null

            if (selectedGraph === "bar" & var1 !== null) {

                if (var2 === null || selectedVar1 == selectedVar2) {
                    data = singleBarChart(var1, proportion)
                    title = "Bar chart of " + selectedVar1 + title
                    labelX = var1.label
                    labelY = proportion ? "Proportion" : "Frequency"
                    showLegend = false
                } else {
                    data = bivariateBarChart(var1, var2, proportion)
                    title = "Bar chart of " + selectedVar2 + " by " + selectedVar1 + title
                    labelX = var1.label
                    labelY = proportion ? "Proportion" : "Frequency"
                }
            }

            if (selectedGraph === "histogram" & var1 !== null) {

                data = histogram(var1, bins, proportion)
                title = "Histogram of " + selectedVar1 + title
                labelX = var1.label
                labelY = proportion ? "Proportion" : "Frequency"
                showLegend = false
            }


            if (selectedGraph === "boxplot" & var1 !== null) {

                if (var2 === null || selectedVar1 == selectedVar2) {

                    data = boxplot(var1)
                    title = "Boxplot of " + selectedVar1 + title
                    labelY = var1.label
                    showLegend = false
                } else if (var3 === null) {
                    
                    data = bivariateBoxplot(var1, var2)
                    title = "Boxplot of " + selectedVar2 + " by " + selectedVar1 + title
                    labelY = var1.label
                    showLegend = false
                } else {
                                        
                    data = trivariateBoxplot(var1, var2, var3)
                    title = "Boxplot of " + selectedVar1 + " by " + selectedVar2 + " and " + selectedVar3 + title
                    labelY = var1.label
                    showLegend = true
                }
            }

            if (selectedGraph === "scatter" & var1 !== null & var2 !== null) {

                data = scatterPlot(var1, var2, var3, jitter, jitter_sd, regression)
                title = "Scatter plot of " + selectedVar1 + " by " + selectedVar2 + title
                labelX = var2.label
                labelY = var1.label
                showLegend = var3 !== null & regression
            }

            if (data !== null) {

                var config = {
                    data: data,
                    options: {
                        plugins: {
                            title: {
                                text: title,
                                display: true,
                            },
                            legend: {
                                position: "bottom",
                                display: showLegend
                            }
                        },
                        scales: {
                            y: {
                                title: {
                                    text: labelY,
                                    display: true
                                },
                                ticks: {
                                    beginAtZero: true,
                                }
                            },
                            x: {
                                title: {
                                    text: labelX,
                                    display: true
                                }
                            }
                        }
                    },
                }

                if (newGraph) {
                    if (this.chart !== null) this.chart.destroy()
                    this.chart = new Chart(ctx, config)
                } else {
                    this.chart.data = data
                    this.chart.type = (selectedGraph === "histogram" ? "bar" : selectedGraph)
                    this.chart.options = config.options
                    this.chart.update()
                }
            }
        }
    }
}

export default Plot