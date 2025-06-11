/**
 * Generic OpenRouter JSON Parser with structured output
 * DRY implementation that accepts any prompt and schema
 */

export class OpenRouterJSONParser {
    apiKey: string | undefined;
  private readonly model: string | undefined;

  constructor() {
    this.apiKey = this.apiKey || process.env.OPENROUTER_API_KEY;
    this.model = this.model || "deepseek/deepseek-r1-0528:free";

    
    
  }

  /**
   * Parse any content with any schema using OpenRouter's structured output
   */
  async parseWithSchema(prompt: string, schema: object, schemaName: string = "response"): Promise<object> {
    

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://mcplookup.org',
          'X-Title': 'MCP GitHub Parser'
        },
        body: JSON.stringify({
          model: this.model,
          messages: [{
            role: "user",
            content: prompt
          }],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: schemaName,
              schema: schema,
              strict: true
            }
          },
          temperature: 0.1,
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter API error ${response.status}: ${errorText}`);
      }

      const data : any = await response.json();
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid response structure from OpenRouter');
      }

      const content = data.choices[0].message.content;
      

      try {
        return JSON.parse(content);
      } catch (parseError : any) {
        
        
        throw new Error(`Invalid JSON response from OpenRouter: ${parseError.message}`);
      }

    } catch (error : any) {
      
      throw error;
    }
  }

  /**
   * Parse Smithery YAML configuration file into structured data
   */
  async parseSmitheryConfig(yamlContent: string): Promise<object> {
    const prompt = `
Parse this Smithery configuration YAML file and extract all structured configuration data:

${yamlContent}

Extract:
1. startCommand configuration (type, configSchema, commandFunction, exampleConfig)
2. Metadata (name, description, version, author, license, repository, homepage, tags)
3. All configuration schema properties and their types
4. Example configuration values

Return a complete structured representation of this Smithery configuration.
`;

    const smitherySchema = {
      type: "object",
      properties: {
        startCommand: {
          type: "object",
          properties: {
            type: { 
              type: "string",
              enum: ["stdio", "sse", "websocket"]
            },
            configSchema: {
              type: "object",
              properties: {
                type: { type: "string" },
                required: {
                  type: "array",
                  items: { type: "string" }
                },
                properties: { type: "object" }
              }
            },
            commandFunction: { type: "string" },
            exampleConfig: { type: "object" }
          },
          required: ["type"]
        },
        name: { type: "string" },
        description: { type: "string" },
        version: { type: "string" },
        author: { type: "string" },
        license: { type: "string" },
        repository: { type: "string" },
        homepage: { type: "string" },
        tags: {
          type: "array",
          items: { type: "string" }
        }
      },
      required: ["startCommand"]
    };

    return this.parseWithSchema(prompt, smitherySchema, "smithery_config");
  }
}
