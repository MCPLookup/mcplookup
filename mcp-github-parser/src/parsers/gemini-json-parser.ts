/**
 *  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.model = "gemini-2.0-flash"; // Free model with JSON mode support
    this.baseURL = "https://generativelanguage.googleapis.com/v1beta";eric Google Gemini JSON Parser with structured output
 * DRY implementation that accepts any prompt and schema
 * Uses Google AI Studio's free Gemini models with JSON mode support
 */

class GeminiJSONParser {
  apiKey: string | undefined;
  model: string | undefined;
  baseURL: string | undefined;
  constructor() {
    this.apiKey = this.apiKey || process.env.GEMINI_API_KEY;
    this.model = this.model || "gemini-2.5-flash-preview-05-20"; // Free model with JSON mode support
    this.baseURL = this.baseURL || "https://generativelanguage.googleapis.com/v1beta";

    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }

    
    
  }


  /**
   * Parse any content with any schema using Gemini's structured output
   * @param {string} prompt - The prompt to send to the LLM
   * @param {object} schema - JSON schema to enforce the response structure
   * @param {string} schemaName - Name for the schema (optional, defaults to "response")
   * @returns {Promise<object>} - Parsed JSON response matching the schema
   */
  async parseWithSchema(prompt : string, schema : object, schemaName = "response") {
    

    try {

      const response = await fetch(`${this.baseURL}/models/${this.model}:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],          generationConfig: {
            temperature: 0.1,
            responseMimeType: "application/json",
            responseSchema: schema
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
      }

      const data : any = await response.json();
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error('No content returned from Gemini API');
      }

      const content : string = data.candidates[0].content.parts[0].text;


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
      const jsonPrompt = `${prompt}\n\nPlease respond only with valid JSON format.`;

      const response = await fetch(`${this.baseURL}/models/${this.model}:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: jsonPrompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 4000,
            responseMimeType: "application/json"
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
      }

      const data : any = await response.json();
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error('No content returned from Gemini API');
      }

      const content = data.candidates[0].content.parts[0].text;

      
      

      const parsedOutput = JSON.parse(content);

      
      return parsedOutput;

    } catch (error : any) {
      
      throw error;
    }
  }
}

export { GeminiJSONParser };
