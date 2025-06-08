"use client";

import React from 'react';

interface PredefinedDiagramProps {
  type: 'architecture' | 'discoveryFlow' | 'storageArchitecture' | 'trustScoring';
  className?: string;
}

export function PredefinedDiagram({ type, className = "" }: PredefinedDiagramProps) {
  const diagrams = {
    architecture: {
      title: "System Architecture",
      description: "High-level overview of the MCPLookup.org serverless architecture"
    },
    discoveryFlow: {
      title: "Discovery Flow",
      description: "How AI agents discover and connect to MCP servers"
    },
    storageArchitecture: {
      title: "Storage Architecture", 
      description: "Multi-provider storage system with automatic environment detection"
    },
    trustScoring: {
      title: "Trust Scoring System",
      description: "How we calculate trust scores for MCP servers"
    }
  };

  const diagram = diagrams[type];

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
      <div className="text-center space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">{diagram.title}</h3>
        <p className="text-gray-600">{diagram.description}</p>
        <div className="bg-gray-100 rounded-lg p-8 text-gray-500">
          <div className="text-4xl mb-2">📊</div>
          <p>Interactive diagram will be rendered here</p>
          <p className="text-sm mt-2">(Mermaid diagram for {type})</p>
        </div>
      </div>
    </div>
  );
}
