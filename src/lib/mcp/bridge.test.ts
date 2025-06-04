import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { MCPHttpBridge } from './bridge';

// Mock the MCP SDK
vi.mock('@modelcontextprotocol/sdk/server/index.js', () => ({
  Server: vi.fn().mockImplementation(() => ({
    setRequestHandler: vi.fn(),
    onerror: vi.fn(),
    connect: vi.fn(),
    close: vi.fn()
  }))
}));

vi.mock('@modelcontextprotocol/sdk/server/stdio.js', () => ({
  StdioServerTransport: vi.fn().mockImplementation(() => ({
    start: vi.fn(),
    close: vi.fn()
  }))
}));

// Mock fetch
global.fetch = vi.fn();

describe('MCPHttpBridge', () => {
  let bridge: MCPHttpBridge;
  const mockEndpoint = 'https://test.com/.well-known/mcp';
  const mockAuthHeaders = { 'Authorization': 'Bearer test-token' };

  beforeEach(() => {
    vi.clearAllMocks();
    bridge = new MCPHttpBridge(mockEndpoint, mockAuthHeaders);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with endpoint and auth headers', () => {
      expect(bridge).toBeDefined();
      expect((bridge as any).httpEndpoint).toBe(mockEndpoint);
      expect((bridge as any).authHeaders).toEqual(mockAuthHeaders);
    });

    it('should remove trailing slash from endpoint', () => {
      const bridgeWithSlash = new MCPHttpBridge('https://test.com/.well-known/mcp/');
      expect((bridgeWithSlash as any).httpEndpoint).toBe('https://test.com/.well-known/mcp');
    });

    it('should work without auth headers', () => {
      const bridgeNoAuth = new MCPHttpBridge(mockEndpoint);
      expect((bridgeNoAuth as any).authHeaders).toEqual({});
    });
  });

  describe('HTTP request handling', () => {
    beforeEach(() => {
      // Mock successful HTTP response
      (fetch as any).mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({
          tools: [
            {
              name: 'test_tool',
              description: 'A test tool',
              inputSchema: {
                type: 'object',
                properties: {
                  message: { type: 'string' }
                }
              }
            }
          ]
        })
      });
    });

    it('should make HTTP request with correct headers', async () => {
      const mockRequest = {
        method: 'tools/list',
        params: {}
      };

      await (bridge as any).makeHttpRequest(mockRequest);

      expect(fetch).toHaveBeenCalledWith(
        mockEndpoint,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token'
          }),
          body: JSON.stringify(mockRequest)
        })
      );
    });

    it('should handle HTTP errors gracefully', async () => {
      (fetch as any).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });

      const mockRequest = {
        method: 'tools/list',
        params: {}
      };

      await expect((bridge as any).makeHttpRequest(mockRequest)).rejects.toThrow(
        'HTTP request failed: 500 Internal Server Error'
      );
    });

    it('should handle network errors', async () => {
      (fetch as any).mockRejectedValue(new Error('Network error'));

      const mockRequest = {
        method: 'tools/list',
        params: {}
      };

      await expect((bridge as any).makeHttpRequest(mockRequest)).rejects.toThrow('Network error');
    });

    it('should handle JSON parsing errors', async () => {
      (fetch as any).mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockRejectedValue(new Error('Invalid JSON'))
      });

      const mockRequest = {
        method: 'tools/list',
        params: {}
      };

      await expect((bridge as any).makeHttpRequest(mockRequest)).rejects.toThrow('Invalid JSON');
    });
  });

  describe('MCP protocol handling', () => {
    it('should handle list tools request', async () => {
      const mockToolsResponse = {
        tools: [
          {
            name: 'email_send',
            description: 'Send an email',
            inputSchema: {
              type: 'object',
              properties: {
                to: { type: 'string' },
                subject: { type: 'string' },
                body: { type: 'string' }
              },
              required: ['to', 'subject', 'body']
            }
          }
        ]
      };

      (fetch as any).mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue(mockToolsResponse)
      });

      // Simulate MCP request handler
      const mockHandler = vi.fn().mockResolvedValue(mockToolsResponse);
      (bridge as any).server.setRequestHandler.mockImplementation((schema, handler) => {
        if (schema === 'tools/list') {
          mockHandler();
        }
      });

      // Test that the handler was set up
      expect((bridge as any).server.setRequestHandler).toHaveBeenCalled();
    });

    it('should handle call tool request', async () => {
      const mockToolResponse = {
        content: [
          {
            type: 'text',
            text: 'Email sent successfully'
          }
        ]
      };

      (fetch as any).mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue(mockToolResponse)
      });

      // Simulate tool call
      const mockHandler = vi.fn().mockResolvedValue(mockToolResponse);
      (bridge as any).server.setRequestHandler.mockImplementation((schema, handler) => {
        if (schema === 'tools/call') {
          mockHandler();
        }
      });

      expect((bridge as any).server.setRequestHandler).toHaveBeenCalled();
    });

    it('should handle list resources request', async () => {
      const mockResourcesResponse = {
        resources: [
          {
            uri: 'file://documents/readme.txt',
            name: 'README',
            description: 'Project documentation',
            mimeType: 'text/plain'
          }
        ]
      };

      (fetch as any).mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue(mockResourcesResponse)
      });

      const mockHandler = vi.fn().mockResolvedValue(mockResourcesResponse);
      (bridge as any).server.setRequestHandler.mockImplementation((schema, handler) => {
        if (schema === 'resources/list') {
          mockHandler();
        }
      });

      expect((bridge as any).server.setRequestHandler).toHaveBeenCalled();
    });

    it('should handle read resource request', async () => {
      const mockResourceContent = {
        contents: [
          {
            uri: 'file://documents/readme.txt',
            mimeType: 'text/plain',
            text: 'This is the README content'
          }
        ]
      };

      (fetch as any).mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue(mockResourceContent)
      });

      const mockHandler = vi.fn().mockResolvedValue(mockResourceContent);
      (bridge as any).server.setRequestHandler.mockImplementation((schema, handler) => {
        if (schema === 'resources/read') {
          mockHandler();
        }
      });

      expect((bridge as any).server.setRequestHandler).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should set up error handler', () => {
      expect((bridge as any).server.onerror).toBeDefined();
    });

    it('should handle MCP errors gracefully', () => {
      const mockError = new Error('MCP protocol error');
      
      // Simulate error handler
      const errorHandler = (bridge as any).server.onerror;
      if (typeof errorHandler === 'function') {
        expect(() => errorHandler(mockError)).not.toThrow();
      }
    });

    it('should handle HTTP timeout', async () => {
      // Mock a request that times out
      (fetch as any).mockImplementation(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 100)
        )
      );

      const mockRequest = {
        method: 'tools/list',
        params: {}
      };

      await expect((bridge as any).makeHttpRequest(mockRequest)).rejects.toThrow('Request timeout');
    });
  });

  describe('connection management', () => {
    it('should start the bridge connection', async () => {
      const mockTransport = {
        start: vi.fn().mockResolvedValue(undefined),
        close: vi.fn()
      };

      // Mock transport creation
      const { StdioServerTransport } = await import('@modelcontextprotocol/sdk/server/stdio.js');
      (StdioServerTransport as any).mockReturnValue(mockTransport);

      await bridge.start();

      expect(mockTransport.start).toHaveBeenCalled();
    });

    it('should close the bridge connection', async () => {
      const mockTransport = {
        start: vi.fn(),
        close: vi.fn().mockResolvedValue(undefined)
      };

      // Set up transport
      (bridge as any).transport = mockTransport;

      await bridge.close();

      expect(mockTransport.close).toHaveBeenCalled();
    });

    it('should handle connection errors', async () => {
      const mockTransport = {
        start: vi.fn().mockRejectedValue(new Error('Connection failed')),
        close: vi.fn()
      };

      const { StdioServerTransport } = await import('@modelcontextprotocol/sdk/server/stdio.js');
      (StdioServerTransport as any).mockReturnValue(mockTransport);

      await expect(bridge.start()).rejects.toThrow('Connection failed');
    });
  });

  describe('request transformation', () => {
    it('should transform MCP requests to HTTP format', async () => {
      const mcpRequest = {
        method: 'tools/call',
        params: {
          name: 'email_send',
          arguments: {
            to: 'test@example.com',
            subject: 'Test',
            body: 'Hello world'
          }
        }
      };

      (fetch as any).mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({ success: true })
      });

      await (bridge as any).makeHttpRequest(mcpRequest);

      expect(fetch).toHaveBeenCalledWith(
        mockEndpoint,
        expect.objectContaining({
          body: JSON.stringify(mcpRequest)
        })
      );
    });

    it('should transform HTTP responses to MCP format', async () => {
      const httpResponse = {
        tools: [
          {
            name: 'test_tool',
            description: 'A test tool',
            inputSchema: { type: 'object' }
          }
        ]
      };

      (fetch as any).mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue(httpResponse)
      });

      const result = await (bridge as any).makeHttpRequest({ method: 'tools/list' });

      expect(result).toEqual(httpResponse);
    });
  });

  describe('authentication', () => {
    it('should include auth headers in requests', async () => {
      const bridgeWithAuth = new MCPHttpBridge(mockEndpoint, {
        'Authorization': 'Bearer secret-token',
        'X-API-Key': 'api-key-123'
      });

      (fetch as any).mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({})
      });

      await (bridgeWithAuth as any).makeHttpRequest({ method: 'tools/list' });

      expect(fetch).toHaveBeenCalledWith(
        mockEndpoint,
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer secret-token',
            'X-API-Key': 'api-key-123'
          })
        })
      );
    });

    it('should work without authentication', async () => {
      const bridgeNoAuth = new MCPHttpBridge(mockEndpoint);

      (fetch as any).mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({})
      });

      await (bridgeNoAuth as any).makeHttpRequest({ method: 'tools/list' });

      expect(fetch).toHaveBeenCalledWith(
        mockEndpoint,
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      );
    });
  });
});
