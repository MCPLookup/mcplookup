import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * API Documentation Endpoint
 * Serves OpenAPI/Swagger documentation for the MCPLookup.org API
 */

export async function GET(request: NextRequest) {
  try {
    // Read the OpenAPI specification
    const openApiPath = join(process.cwd(), 'openapi.yaml');
    const openApiSpec = readFileSync(openApiPath, 'utf8');

    // Parse YAML to JSON for Swagger UI
    const yaml = await import('js-yaml');
    const openApiJson = yaml.load(openApiSpec);

    // Generate Swagger UI HTML
    const swaggerHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MCPLookup.org API Documentation</title>
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.10.3/swagger-ui.css" />
  <style>
    html {
      box-sizing: border-box;
      overflow: -moz-scrollbars-vertical;
      overflow-y: scroll;
    }
    *, *:before, *:after {
      box-sizing: inherit;
    }
    body {
      margin:0;
      background: #fafafa;
    }
    .swagger-ui .topbar {
      background-color: #1f2937;
    }
    .swagger-ui .topbar .download-url-wrapper {
      display: none;
    }
    .swagger-ui .info .title {
      color: #1f2937;
    }
    .swagger-ui .scheme-container {
      background: #fff;
      box-shadow: 0 1px 2px 0 rgba(0,0,0,0.1);
    }
    .transport-highlight {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 1rem;
      border-radius: 8px;
      margin: 1rem 0;
    }
    .transport-highlight h3 {
      margin: 0 0 0.5rem 0;
      color: white;
    }
    .transport-highlight p {
      margin: 0;
      opacity: 0.9;
    }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  
  <script src="https://unpkg.com/swagger-ui-dist@5.10.3/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@5.10.3/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      const ui = SwaggerUIBundle({
        spec: ${JSON.stringify(openApiJson)},
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout",
        tryItOutEnabled: true,
        requestInterceptor: function(request) {
          // Add any request modifications here
          return request;
        },
        responseInterceptor: function(response) {
          // Add any response modifications here
          return response;
        },
        onComplete: function() {
          // Add transport capabilities highlight
          const infoSection = document.querySelector('.swagger-ui .info');
          if (infoSection) {
            const transportHighlight = document.createElement('div');
            transportHighlight.className = 'transport-highlight';
            transportHighlight.innerHTML = \`
              <h3>🚀 Enhanced with Transport Capabilities Discovery</h3>
              <p>This API now automatically discovers and provides detailed MCP streaming HTTP metadata including SSE support, session management, CORS configuration, and performance metrics for intelligent server selection.</p>
            \`;
            infoSection.appendChild(transportHighlight);
          }
        }
      });
    };
  </script>
</body>
</html>`;

    return new NextResponse(swaggerHtml, {
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });

  } catch (error) {
    console.error('Error serving API documentation:', error);
    return NextResponse.json(
      { error: 'Failed to load API documentation' },
      { status: 500 }
    );
  }
}

/**
 * Serve OpenAPI JSON specification
 */
export async function POST(request: NextRequest) {
  try {
    const openApiPath = join(process.cwd(), 'openapi.yaml');
    const openApiSpec = readFileSync(openApiPath, 'utf8');
    
    const yaml = await import('js-yaml');
    const openApiJson = yaml.load(openApiSpec);

    return NextResponse.json(openApiJson, {
      headers: {
        'Cache-Control': 'public, max-age=3600',
      },
    });

  } catch (error) {
    console.error('Error serving OpenAPI JSON:', error);
    return NextResponse.json(
      { error: 'Failed to load OpenAPI specification' },
      { status: 500 }
    );
  }
}
