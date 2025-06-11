/**
 * Example API endpoint showing how to use AsyncGenerator with Server-Sent Events (SSE)
 * This demonstrates how to stream progress updates to a web client
 */

import { GitHubClient } from '../github-client.js';

/**
 * API handler for streaming GitHub analysis with progress updates
 * Can be used with Express.js, Next.js API routes, etc.
 */
export async function handleGitHubAnalysisWithProgress(req: any, res: any) {
  const { query, maxResults = 5 } = req.query;
  
  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  // Set headers for Server-Sent Events
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  const client = new GitHubClient(process.env.GITHUB_TOKEN);

  try {
    // Use the AsyncGenerator to stream progress
    const analysisGenerator = client.searchAndParseWithProgress(query, parseInt(maxResults));
    
    for await (const progress of analysisGenerator) {
      // Send progress update to client
      res.write(`data: ${JSON.stringify({
        type: 'progress',
        ...progress
      })}\n\n`);
    }

    // Get the final result
    // Get the final result by consuming the generator
    let results: any;
    for await (const progress of analysisGenerator) {
      results = progress;
    }
    
    // Send final result
    res.write(`data: ${JSON.stringify({
      type: 'result',
      data: results.value,
      timestamp: new Date().toISOString()
    })}\n\n`);

  } catch (error) {
    // Send error
    res.write(`data: ${JSON.stringify({
      type: 'error',
      message: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    })}\n\n`);
  } finally {
    res.end();
  }
}

/**
 * Alternative: Promise-based API with callback for progress
 * Better for Node.js APIs that don't support streaming
 */
export async function handleGitHubAnalysisWithCallback(req: any, res: any) {
  const { query, maxResults = 5, webhookUrl } = req.body;
  
  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  // Start analysis in background
  const analysisId = `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Return analysis ID immediately
  res.json({ 
    analysisId,
    status: 'started',
    message: 'Analysis started. Progress updates will be sent to webhook if provided.'
  });

  // Run analysis in background
  (async () => {
    const client = new GitHubClient(process.env.GITHUB_TOKEN);
    
    try {
      const analysisGenerator = client.searchAndParseWithProgress(query, parseInt(maxResults));
      
      for await (const progress of analysisGenerator) {
        // Send progress to webhook if provided
        if (webhookUrl) {
          try {
            await fetch(webhookUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                analysisId,
                type: 'progress',
                ...progress
              })
            });
          } catch (webhookError) {
            
          }
        }
        
        // Could also store progress in database/Redis for polling
        console.log(`Analysis ${analysisId} progress:`, progress.message);
      }

      // Get final result
      // Get the final result by consuming the generator
      let results: any;
      for await (const progress of analysisGenerator) {
        results = progress;
      }
      
      // Send final result to webhook
      if (webhookUrl) {
        try {
          await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              analysisId,
              type: 'result',
              data: results.value,
              timestamp: new Date().toISOString()
            })
          });
        } catch (webhookError) {
          
        }
      }

    } catch (error) {
      
      
      // Send error to webhook
      if (webhookUrl) {
        try {
          await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              analysisId,
              type: 'error',
              message: error instanceof Error ? error.message : String(error),
              timestamp: new Date().toISOString()
            })
          });
        } catch (webhookError) {
          
        }
      }
    }
  })();
}

/**
 * WebSocket-based progress streaming
 * For real-time applications
 */
export function handleGitHubAnalysisWebSocket(ws: any, message: any) {
  const { query, maxResults = 5 } = JSON.parse(message);
  
  if (!query) {
    ws.send(JSON.stringify({ type: 'error', message: 'Query is required' }));
    return;
  }

  (async () => {
    const client = new GitHubClient(process.env.GITHUB_TOKEN);
    
    try {
      const analysisGenerator = client.searchAndParseWithProgress(query, parseInt(maxResults));
      
      for await (const progress of analysisGenerator) {
        // Send progress update via WebSocket
        ws.send(JSON.stringify({
          type: 'progress',
          ...progress
        }));
      }

      // Get and send final result
      // Get the final result by consuming the generator
      let results: any;
      for await (const progress of analysisGenerator) {
        results = progress;
      }
      ws.send(JSON.stringify({
        type: 'result',
        data: results.value,
        timestamp: new Date().toISOString()
      }));

    } catch (error) {
      ws.send(JSON.stringify({
        type: 'error',
        message: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      }));
    }
  })();
}
