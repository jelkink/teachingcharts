import React, { useState, useEffect } from "react"

function Form({data, plot, info}) {

    const dataSets = ["ines_2020", "test"]
    const graphs = ["", "bar", "scatter", "histogram", "boxplot"]

    const [selectedDataSet, setSelectedDataSet] = useState(dataSets[0])
    const [selectedGraph, setSelectedGraph] = useState('')
    const [selectedVar1, setSelectedVar1] = useState('')
    const [selectedVar2, setSelectedVar2] = useState('')
    const [selectedVar3, setSelectedVar3] = useState('')
    const [selectedVarSubset, setSelectedVarSubset] = useState('')
    const [selectedGroupSubset, setSelectedGroupSubset] = useState('')
    const [proportion, setProportion] = useState(false)
    const [jitter, setJitter] = useState(false)
    const [jitter_sd, setJitterSD] = useState(10)
    const [bins, setBins] = useState(10)
    const [regression, setRegression] = useState(false)
    const [subset, setSubset] = useState(false)

    useEffect(() => {

        plot.update(data, selectedGraph, selectedVar1, selectedVar2, selectedVar3, selectedVarSubset, selectedGroupSubset, subset, proportion, jitter, jitter_sd, bins, regression)
        info.updateVariableDescription(data, selectedGraph, regression, selectedVar1, selectedVar2, selectedVar3, selectedVarSubset)
    }, [selectedGraph, selectedVar1, selectedVar2, selectedVar3, selectedVarSubset, selectedGroupSubset, subset, proportion, jitter, jitter_sd, bins, regression])

    useEffect((e) => {

        if (data) {

            data.changeFile(selectedDataSet)
                .then(() => {
                    setSelectedGraph('')
                    setSelectedVar1(data.getVariableNames()[0])
                    setSelectedVar2(data.getVariableNames()[0])
                    setSelectedVar3(data.getVariableNames()[0])
                })
        }
    }, [selectedDataSet])

    return (
        <div id="left-bar">
            {data ? (
            <form name="options">
                <h2>Data</h2>

                <table><tbody>
                    <tr>
                        <td>Data set</td>
                        <td>
                            <select value={selectedDataSet} onChange={(e) => setSelectedDataSet(e.target.value)}>
                                {dataSets.map((option, index) => (
                                    <option key={index} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <td>Graph type</td>
                        <td>
                            <select value={selectedGraph} onChange={(e) => setSelectedGraph(e.target.value)}>
                                {graphs.map((option, index) => (
                                    <option key={index} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <td>Variable 1</td>
                        <td>
                            <select value={selectedVar1} onChange={(e) => setSelectedVar1(e.target.value)}>
                                {data.getVariableNames().map((option, index) => (
                                    <option key={index} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                        </td>
                     </tr> 

                     <tr>
                        <td>Variable 2</td>
                        <td>
                            <select value={selectedVar2} onChange={(e) => setSelectedVar2(e.target.value)}>
                                {data.getVariableNames().map((option, index) => (
                                    <option key={index} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                        </td>
                     </tr>

                     <tr>
                        <td>Variable 3</td>
                        <td>
                            <select value={selectedVar3} onChange={(e) => setSelectedVar3(e.target.value)}>
                                {data.getVariableNames().map((option, index) => (
                                    <option key={index} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                        </td>
                     </tr>

                </tbody></table>
                     
                <h2>Options</h2>

                <table><tbody>

                    <tr>
                        <td>
                            Proportions 
                        </td>
                        <td>
                            <input type="checkbox" checked={proportion} onChange={() => setProportion(!proportion)}/> on/off  
                        </td>
                    </tr>
                    
                     <tr>
                        <td>Bins</td>
                        <td>
                            <input type="range" value={bins} onChange={(e) => setBins(parseInt(e.target.value))} min="1" max="20" />
                        </td>
                     </tr>
                     
                                          <tr>
                        <td>
                            Jitter 
                        </td>
                        <td>
                            <input type="checkbox" checked={jitter} onChange={() => setJitter(!jitter)}/> on/off  
                        </td>
                    </tr>
                    <tr>
                        <td>
                        </td>
                        <td>
                            <input type="range" value={jitter_sd} onChange={(e) => setJitterSD(parseInt(e.target.value))} min="0" max="500" />
                        </td>
                    </tr>

                     <tr>
                        <td>
                            Regression line 
                        </td>
                        <td>
                            <input type="checkbox" checked={regression} onChange={() => setRegression(!regression)}/> on/off
                        </td>
                    </tr>

                    <tr>
                        <td>
                            Subset
                        </td>
                        <td>
                            <input type="checkbox" checked={subset} onChange={() => setSubset(!subset)}/> on/off
                        </td>
                    </tr>
                    <tr>
                        <td></td>
                        <td>
                            <select value={selectedVarSubset} onChange={(e) => setSelectedVarSubset(e.target.value)}>
                                {data.getVariableNames().map((option, index) => (
                                    <option key={index} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                        </td>
                     </tr>
                     <tr>
                        <td></td>
                        <td>
                            <select value={selectedGroupSubset} onChange={(e) => setSelectedGroupSubset(e.target.value)}>
                                {data.getValueLabels(selectedVarSubset).map((option, index) => (
                                    <option key={index} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                        </td>
                     </tr>
                </tbody></table>
            </form>
            ) : (
                <p>Loading data ...</p>
            )}
        </div>
    )
}

export default Form