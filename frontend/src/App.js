import React, { useEffect, useState } from "react";
import "./css/App.css";

import Data from "./components/Data"
import Header from "./components/Header";
import Form from "./components/Form";
import Canvas from "./components/Canvas";

function App() {

  const [data, setData] = useState(null);

  useEffect(() => {
      async function fetchData() {

          const res = new Data();
          await res.load();

          setData(res);
      }

      fetchData();
  }, []);

  return (
    <div id="App">
      {<Header />}
      <div id="main">
        {<Form data={data} />}
        {<Canvas data={data} />}
      </div>
    </div>
  );
}

export default App;
