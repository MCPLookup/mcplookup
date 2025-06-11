/**
 * Generic Together.ai JSON Parser with structured output
 * DRY implementation that accepts any prompt and schema
 * Uses Together.ai's JSON mode with schema support
 */

class TogetherJSONParser {
  apiKey: string | undefined;
  model: string | undefined;
    constructor() {
    this.apiKey = this.apiKey || process.env.TOGETHER_API_KEY;
    this.model = this.model || "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free"; // Free model with confirmed JSON mode support

    if (!this.apiKey) {
      throw new Error('TOGETHER_API_KEY environment variable is required');
    }

    
    
  }

  /**
   * Parse any content with any schema using Together.ai's structured output
   * @param {string} prompt - The prompt to send to the LLM
   * @param {object} schema - JSON schema to enforce the response structure
   * @param {string} schemaName - Name for the schema (optional, defaults to "response")
   * @returns {Promise<object>} - Parsed JSON response matching the schema
   */
  async parseWithSchema(prompt : string, schema : object, schemaName = "response") {
    

    try {
      const response = await fetch('https://api.together.xyz/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant. Only respond in JSON format using the provided schema.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],          temperature: 0.1,
          // Use Together.ai's structured output feature with JSON schema
          response_format: {
            type: "json_object",
            schema: schema
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Together.ai API error: ${response.status} - ${errorText}`);
      }

      const data : any = await response.json();
      const content = data.choices[0].message.content;

      
      

      const parsedOutput = JSON.parse(content);

      
      return parsedOutput;

    } catch (error : any) {
      
      throw error;
    }
  }

  /**
   * Convenience method for simple JSON parsing without schema enforcement
   * @param {string} prompt - The prompt to send to the LLM
   * @returns {Promise<object>} - Parsed JSON response
   */
  async parseJSON(prompt : string) {
    

    try {
      const response = await fetch('https://api.together.xyz/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant. Only respond in JSON format.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],          temperature: 0.1,
          max_tokens: 2000, // Reduced for simple JSON parsing
          response_format: {
            type: "json_object"
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Together.ai API error: ${response.status} - ${errorText}`);
      }

      const data : any = await response.json();
      const content = data.choices[0].message.content;

      
      

      const parsedOutput = JSON.parse(content);

      
      return parsedOutput;

    } catch (error : any) {
      
      throw error;
    }
  }
}

export { TogetherJSONParser };
