import axios from "axios";
import React, { useState } from "react";

const Selector = ({ 
  onUploadComplete, 
  remainingFieldsToMap, 
  setRemainingFieldsToMap, 
  contractInfo, 
  headersInfo,
  onDocumentMapView 
}) => {

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [downloadFileUrl, setDownloadFileUrl] = useState(null);
  const [fileType, setFileType] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [hasStartedParsing, setHasStartedParsing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1); // New state for pagination
  const [pageSize, setPageSize] = useState(10); // New state for page size

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setUploadProgress(0);
    setDownloadFileUrl(null);
    setIsParsing(false);
    setHasStartedParsing(false);
  };

  const API_UPLOAD_ENDPOINT = "http://localhost:4000/api/generate-presigned-url";
  const API_DOWNLOAD_ENDPOINT = "http://localhost:4000/api/download-presigned-url";
  const API_PARSE_EXCEL_ENDPOINT = "http://localhost:4000/api/parse-excel";
  const API_MAP_DOCUMENT_PREVIEW_ENDPOINT = "http://localhost:4000/api/map-document-preview";
  const API_VALIDATE_DOCUMENTS_ENDPOINT = "http://localhost:4000/api/validate-documents";

  const getUploadPresignedUrl = async () => {
    const response = await axios({
      method: "GET",
      url: `${API_UPLOAD_ENDPOINT}?path=${selectedFile.name}`,
    });
    return response.data.uploadURL;
  };

  const getDownloadPresignedUrl = async () => {
    const response = await axios({
      method: "GET",
      url: `${API_DOWNLOAD_ENDPOINT}?path=${selectedFile.name}`,
    });
    return response.data.downloadURL;
  };

  const uploadToPresignedUrl = async (presignedUrl) => {
    await axios.put(presignedUrl, selectedFile, {
      headers: {
        "Content-Type": "application/octet-stream",
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        setUploadProgress(percentCompleted);
      },
    });
    setUploadProgress(100);
    const downloadUrl = await getDownloadPresignedUrl();
    setDownloadFileUrl(downloadUrl);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      console.error("No file selected.");
      return;
    }
    const presignedUrl = await getUploadPresignedUrl();
    if (presignedUrl) {
      await uploadToPresignedUrl(presignedUrl);
    }
  };

  const parseExcelFile = async () => {
    if (!downloadFileUrl) {
      console.error("No file available for parsing.");
      return;
    }

    setIsParsing(true);
    setHasStartedParsing(true);
    try {
      const response = await axios({
        method: "GET",
        url: `${API_PARSE_EXCEL_ENDPOINT}?file-name=${selectedFile.name}`,
      });

      onUploadComplete({
        headersInfo: response.data.headersInfo,
        parsedData: response.data.data,
        contractInfo: response.data.contractInfo || [],
        fileName: selectedFile.name,
      });

      setRemainingFieldsToMap(response.data.contractInfo.map(item => ({
        keyName: item.keyName,
        visible: true,
        required: item.required,
        type: item.type,
        relatedKeys: []
      })));

    } catch (error) {
      console.error("Error parsing file:", error);
    } finally {
      setIsParsing(false);
    }
  };

  const isDocumentMapViewEnabled = hasStartedParsing && remainingFieldsToMap.filter(
    field => 
      field.visible && 
      field.required && 
      !field.keyName.includes('[N]')
  ).length === 0;

  const handleDocumentMapView = async () => {
    if (!headersInfo.length) {
      console.error("Headers info is not available.");
      return;
    }

    const configPayload = headersInfo.map((header, index) => ({
      index,
      inputHeader: header.inputHeader || "",
      inputHeaderType: header.inputType || "",
      inputDateFormat: header.inputDateFormat || "",
      targetHeader: header.targetHeader || "",
      targetHeaderType: header.targetType || "",
    }));

    try {
      const response = await axios.post(`${API_MAP_DOCUMENT_PREVIEW_ENDPOINT}?file-name=${selectedFile.name}`, configPayload);
      const mergedStructure = response.data;
      onDocumentMapView(mergedStructure);
    } catch (error) {
      console.error("Error sending Document Map View configuration:", error);
    }
  };

  const handleValidateDocuments = async () => {
    if (!headersInfo.length) {
      console.error("Headers info is not available.");
      return;
    }

    const configPayload = headersInfo.map((header, index) => ({
        index,
        inputHeader: header.inputHeader || "",
        inputHeaderType: header.inputType || "",
        inputDateFormat: header.inputDateFormat || "",
        targetHeader: header.targetHeader || "",
        targetHeaderType: header.targetType || "",
    }));

    try {
      const response = await axios.post(
        `${API_VALIDATE_DOCUMENTS_ENDPOINT}?file-name=${selectedFile.name}&current-page=${currentPage}&page-size=${pageSize}`,
        configPayload
      );
      const mergedStructure = response.data.mergedStructure;
      const mappedDocument = response.data.mappedDocument;
      // Handle the response as needed, for example:
      console.log('Validated Document:', mappedDocument);
      onDocumentMapView({ mergedStructure, mappedDocument });
    } catch (error) {
      console.error("Error validating documents:", error);
    }
  };

  return (
    <div>
      <h1>File Upload and Parsing</h1>
      <div>
        <label>Select File Type:</label>
        <select value={fileType} onChange={(e) => setFileType(e.target.value)}>
          <option value="">Select</option>
          <option value="account">Account</option>
          <option value="item">Item</option>
          <option value="vendor">Vendor</option>
        </select>
      </div>
      <div>
        <label htmlFor="file-upload">Upload File:</label>
        <input type="file" id="file-upload" onChange={handleFileChange} />
        <button onClick={handleUpload} disabled={uploadProgress > 0 && uploadProgress < 100}>
          Upload
        </button>
      </div>
      {uploadProgress > 0 && <div>Upload Progress: {uploadProgress}%</div>}
      {downloadFileUrl && (
        <>
          <button onClick={parseExcelFile} disabled={isParsing}>
            {isParsing ? "Parsing..." : "Parse File"}
          </button>
          <button
            onClick={handleDocumentMapView}
            disabled={!isDocumentMapViewEnabled}
          >
            Document Map View
          </button>
          <div>
            <label>Current Page:</label>
            <input 
              type="number" 
              value={currentPage} 
              onChange={(e) => setCurrentPage(parseInt(e.target.value, 10) || 1)} 
            />
            <label>Page Size:</label>
            <input 
              type="number" 
              value={pageSize} 
              onChange={(e) => setPageSize(parseInt(e.target.value, 10) || 10)} 
            />
            <button
              onClick={handleValidateDocuments}
              disabled={isParsing}
            >
              Validate Documents
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Selector;
