import React, { useCallback, useEffect, useState } from "react";
import "./FileUploadWithLink.css";
import { Button, DropZone, Spinner } from "@shopify/polaris";
import { CheckSmallIcon } from "@shopify/polaris-icons";

const FileUploadWithLink = ({ label, value, onChange }) => {
  const [files, setFiles] = useState([]);
  const [url, setUrl] = useState(value);

  const [isLoading, setIsLoading] = useState(false);

  function createRandomString(length) {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  const id = createRandomString(24);

  const handleSubmitFile = useCallback(() => {
    setIsLoading(true);
    const formData = new FormData();

    formData.append("async-upload", files[0]);
    const url = `https://files.bplugins.com/wp-json/media-upload/v1/image-upload`;
    fetch(url, {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((imageData) => {
        if (imageData?.success) {
          setUrl(imageData.data.url);
          setIsLoading(false);
        } else {
          setIsLoading(false);
        }
      });
  });

  useEffect(() => {
    value && setUrl(value);
    setFiles([]);
  }, [value]);
  useEffect(() => {
    onChange(url);
    setFiles([]);
  }, [url]);

  const handleDropZoneDrop = useCallback(
    (_dropFiles, acceptedFiles, _rejectedFiles) =>
      setFiles((files) => [...files, ...acceptedFiles]),
    [],
  );


  return (
    <div className="FileUpload">
      <label htmlFor={`FileUpload-${id}`}>{label}</label>
      <div className="filed">
        {isLoading && (
          <Spinner accessibilityLabel="Small spinner example" size="small" />
        )}
        <input
          type="url"
          value={url}
          onChange={setUrl}
          id={`FileUpload-${id}`}
          disabled={isLoading}
        />
        <div style={{ width: 40, height: 40 }}>
          <DropZone onDrop={handleDropZoneDrop}>
            <DropZone.FileUpload />
          </DropZone>
          {files?.length > 0 ? (
            <Button
              icon={CheckSmallIcon}
              accessibilityLabel="Save"
              onClick={handleSubmitFile}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default FileUploadWithLink;
