import React from "react";

const Tree = ({ mergedStructure, parsedData, remainingFieldsToMap, onBackToTable }) => {
  return (
    <div style={{ display: 'flex' }}>
      <div style={{ width: '50%', padding: '10px', borderRight: '1px solid black' }}>
        <h2>Excel Columns</h2>
        <ul>
          {remainingFieldsToMap.filter(field => field.visible).map(field => (
            <li key={field.keyName}>{field.keyName}</li>
          ))}
        </ul>
      </div>
      <div style={{ width: '50%', padding: '10px' }}>
        <h2>Mapped Document Structure</h2>
        <div>
          {parsedData.mergedStructure ? <pre>{JSON.stringify(parsedData.mergedStructure, null, 2)}</pre> : "No mapped document available"}
        </div>
        <h2>First Registry Mapped Document Preview</h2>
        <div>
          {parsedData.mappedDocument ? <pre>{JSON.stringify(parsedData.mappedDocument, null, 2)}</pre> : "No mapped document available"}
        </div>
      </div>
    </div>
  );
};

export default Tree;
