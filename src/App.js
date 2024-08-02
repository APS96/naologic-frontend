import React, { useState } from "react";
import "./App.css";
import Selector from "./Components/Selector";
import Table from "./Components/Table";
import Tree from "./Components/Tree";

function App() {
  const [headersInfo, setHeadersInfo] = useState([]);
  const [parsedData, setParsedData] = useState(null);
  const [contractInfo, setContractInfo] = useState([]);
  const [customHeaders, setCustomHeaders] = useState([]);
  const [remainingFieldsToMap, setRemainingFieldsToMap] = useState([]);
  const [showTable, setShowTable] = useState(true);
  const [isParsed, setIsParsed] = useState(false);

  const handleUploadComplete = ({ headersInfo, parsedData, contractInfo, fileName }) => {
    const remainingFields = contractInfo.map(item => ({
      keyName: item.keyName,
      visible: true,
      required: item.required,
      type: item.type,
      relatedKeys: []
    }));
    setHeadersInfo(headersInfo);
    setParsedData(parsedData);
    setContractInfo(contractInfo);
    setRemainingFieldsToMap(remainingFields);
    setIsParsed(false);
  };

  const handleBackToTable = () => {
    setShowTable(true);
  };

  const handleDocumentMapView = (mergedStructure) => {
    setShowTable(false);
    setParsedData(mergedStructure);
  };

  return (
    <div className="App">
      <Selector
        onUploadComplete={handleUploadComplete}
        remainingFieldsToMap={remainingFieldsToMap}
        setRemainingFieldsToMap={setRemainingFieldsToMap}
        contractInfo={contractInfo}
        headersInfo={headersInfo}
        onDocumentMapView={handleDocumentMapView}
      />
      {showTable ? (
        <>
          {remainingFieldsToMap.some(field => field.visible && field.required) && (
            <p>Next step: Map View - Only after remaining fields are mapped: {
              remainingFieldsToMap.filter(
                field => 
                  field.visible && 
                  field.required && 
                  !field.keyName.includes('[N]')
                )
                .map(field => field.keyName).join(", ")
            }</p>
          )}
          <Table
            headersInfo={headersInfo}
            setHeadersInfo={setHeadersInfo}
            parsedData={parsedData}
            contractInfo={contractInfo}
            customHeaders={customHeaders}
            setCustomHeaders={setCustomHeaders}
            setRemainingFieldsToMap={setRemainingFieldsToMap}
            remainingFieldsToMap={remainingFieldsToMap}
          />
        </>
      ) : (
        <Tree 
          headersInfo={headersInfo} 
          parsedData={parsedData} 
          remainingFieldsToMap={remainingFieldsToMap} 
          onBackToTable={handleBackToTable}
        />
      )}
    </div>
  );
}

export default App;
