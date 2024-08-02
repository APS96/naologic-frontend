import React from "react";
import { v4 as uuidv4 } from 'uuid';
// Define the input type options
const inputTypeOptions = ["string", "number", "boolean", "date", "array"];

const Table = ({
  headersInfo,
  setHeadersInfo,
  parsedData,
  contractInfo = [],
  customHeaders,
  setCustomHeaders,
  setRemainingFieldsToMap,
  remainingFieldsToMap = [],
}) => {
  
    const handleTargetHeaderChange = (index, value) => {
    // Create a copy of the headersInfo array to avoid direct mutation
    const updatedHeadersInfo = [...headersInfo];
    const oldTargetHeader = updatedHeadersInfo[index].targetHeader;
    
    // Update the target header in the copied array
    updatedHeadersInfo[index].targetHeader = value;
    
    // Determine the type of the selected target header from contractInfo
    const targetType = contractInfo.find(item => item.keyName === value)?.type || "N/A";
    updatedHeadersInfo[index].targetType = targetType;
    
    // Update state with the modified headers info
    setHeadersInfo(updatedHeadersInfo);
    
    // Handle visibility for old target header
    if (oldTargetHeader && oldTargetHeader !== "N/A") {
        setRemainingFieldsToMap(prevFields =>
        prevFields.map(field => {
            // Always keep fields containing '[N]' visible
            if (field.keyName.includes('[N]')) {
            return field;
            }
            // Return the old related keys to visible
            return field.relatedKeys.includes(oldTargetHeader)
            ? { ...field, visible: true }
            : field;
        })
        );
    }
    
    // Handle visibility for new target header
    if (value && value !== "N/A") {
        const relatedKeys = [];
        const arrays = value.split(".");
    
        let dynamicPath = "";
        arrays.forEach((array, index) => {
        dynamicPath += `${array}`;
        let toSave = '';
        if (index < arrays.length - 1) {
            dynamicPath += ".";
            if (dynamicPath.endsWith("[N].")) {
            toSave = dynamicPath.slice(0, -4);
            } else {
            toSave = dynamicPath;
            }
        } else {
            toSave = dynamicPath;
        }
        relatedKeys.push(toSave);
        });
    
        setRemainingFieldsToMap(prevFields =>
        prevFields.map(field => {
            // Always keep fields containing '[N]' visible
            if (field.keyName.includes('[N]')) {
            return field;
            }
            // Set visibility of related keys for the new target header
            return relatedKeys.includes(field.keyName)
            ? { ...field, visible: false, relatedKeys: [...field.relatedKeys, value] }
            : field;
        })
        );
    } else {
        // If new target header is "N/A", revert the visibility of related fields
        setRemainingFieldsToMap(prevFields =>
        prevFields.map(field => {
            // Always keep fields containing '[N]' visible
            if (field.keyName.includes('[N]')) {
            return field;
            }
            // Revert visibility of related keys for the old target header
            return field.relatedKeys.includes(oldTargetHeader)
            ? { ...field, visible: true }
            : field;
        })
        );
    }
    };
  

  // Function to handle input type change
  const handleInputTypeChange = (index, value) => {
    const updatedHeadersInfo = [...headersInfo];
    updatedHeadersInfo[index].inputType = value;
    setHeadersInfo(updatedHeadersInfo);
  };

  // Function to handle input date format change
  const handleInputDateFormatChange = (index, value) => {
    const updatedHeadersInfo = [...headersInfo];
    updatedHeadersInfo[index].inputDateFormat = value;
    setHeadersInfo(updatedHeadersInfo);
  };

  // Function to handle target date format change
  const handleTargetDateFormatChange = (index, value) => {
    const updatedHeadersInfo = [...headersInfo];
    updatedHeadersInfo[index].targetDateFormat = value;
    setHeadersInfo(updatedHeadersInfo);
  };

  if (!headersInfo.length || !parsedData) return null;

  return (
    <table style={{ borderSpacing: "20px" }}>
      <thead>
        <tr>
          <th>Input Header</th>
          <th>Input Type</th>
          <th>Input Date Format</th>
          <th>Is Array</th>
          <th>Target Header</th>
          <th>Target Type</th>
          <th>Target Date Format</th>
        </tr>
      </thead>
      <tbody>
        {headersInfo.map((headerInfo, index) => (
          <tr key={index}>
            <td>{headerInfo.inputHeader}</td>
            <td>
              <select
                value={headerInfo.inputType}
                onChange={(e) => handleInputTypeChange(index, e.target.value)}
              >
                {inputTypeOptions.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </td>
            <td>
              {headerInfo.inputType === "date" && (
                <select
                  value={headerInfo.inputDateFormat || ""}
                  onChange={(e) => handleInputDateFormatChange(index, e.target.value)}
                >
                  <option value="">Select Format</option>
                  <option value="ISO">ISO</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  <option value="YYYY-DD-MM">YYYY-DD-MM</option>
                  <option value="timestamp">Timestamp</option>
                </select>
              )}
            </td>
            <td>{headerInfo.isArray ? "True" : "False"}</td>
            <td>
              <select
                value={headerInfo.targetHeader}
                onChange={(e) => handleTargetHeaderChange(index, e.target.value)}
              >
                <option value="N/A">N/A</option>
                {remainingFieldsToMap
                  .filter(field => field.visible)
                  .map((fieldName) => (
                    <option key={uuidv4()} value={fieldName.keyName}>
                      {fieldName.keyName}
                    </option>
                  ))}
                {remainingFieldsToMap
                  .filter(field => !field.visible && field.relatedKeys.includes(headerInfo.targetHeader))
                  .map((fieldName) => fieldName.relatedKeys.map(relatedKey => (
                    <option key={uuidv4()} value={relatedKey}>
                      {relatedKey}
                    </option>
                  )))}
              </select>
            </td>
            <td>{headerInfo.targetType || "N/A"}</td>
            <td>
              {headerInfo.targetType === "date" && (
                <select
                  value={headerInfo.targetDateFormat || ""}
                  onChange={(e) => handleTargetDateFormatChange(index, e.target.value)}
                >
                  <option value="">Select Format</option>
                  <option value="ISO">ISO</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  <option value="YYYY-DD-MM">YYYY-DD-MM</option>
                  <option value="timestamp">Timestamp</option>
                </select>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Table;
