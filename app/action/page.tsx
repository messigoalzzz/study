"use client";

import React, { useState } from "react";

const ActionsPage: React.FC = () => {
  const [actionUrl, setActionUrl] = useState<string | null>(null);

  const generateAction = async () => {
    try {
      const response = await fetch("/api/action/token-detail");
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create action: ${errorText}`);
      }
  
      const data = await response.json();
      console.log("Generated Action:", data);
  
      // 验证 actionUrl 是否存在
      if (data.actionUrl) {
        setActionUrl(data.actionUrl);
      } else {
        throw new Error("API response missing 'actionUrl'");
      }
    } catch (error) {
      console.error("Error generating action:", error);
      alert(`Failed to create action. Error: ${error.message}`);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Generate Token Action</h1>
      <button
        onClick={generateAction}
        style={{
          padding: "10px 20px",
          backgroundColor: "blue",
          color: "white",
          cursor: "pointer",
        }}
      >
        Generate Action
      </button>
      {actionUrl && (
        <div style={{ marginTop: "20px" }}>
          <p>Action URL:</p>
          <a href={actionUrl} target="_blank" rel="noopener noreferrer">
            {actionUrl}
          </a>
        </div>
      )}
    </div>
  );
};

export default ActionsPage;