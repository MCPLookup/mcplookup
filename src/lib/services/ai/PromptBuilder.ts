// Prompt Builder - Three-step process: keywords → search → AI narrowing

export interface MCPSearchResult {
  slug: string;
  name: string;
  description: string;
  capabilities: string[];
  tags: string[];
  domain?: string;
}

export interface SlugSelectionResult {
  selectedSlugs: string[];
  reasoning: string;
  confidence: number;
}

export class PromptBuilder {

  /**
   * Step 1: Extract clean keywords for search (remove stop words, negations, etc.)
   */
  extractSearchKeywords(query: string): string[] {
    const lowerQuery = query.toLowerCase();

    // Remove negation phrases and stop words
    const cleanQuery = lowerQuery
      .replace(/\b(not|don't|doesn't|isn't|aren't|won't|can't)\s+\w+/g, '') // Remove "not gmail", "don't want slack"
      .replace(/\b(and|or|but|the|a|an|in|on|at|to|for|of|with|by)\b/g, ' ') // Remove stop words
      .replace(/\b(like|similar|alternative|instead|replace)\b/g, ' ') // Remove comparison words
      .replace(/[^\w\s]/g, ' ') // Remove punctuation
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim();

    // Extract meaningful keywords
    const words = cleanQuery.split(' ')
      .filter(word => word.length > 2) // Remove short words
      .filter(word => !this.isStopWord(word))
      .slice(0, 10); // Limit to 10 keywords max

    return [...new Set(words)]; // Remove duplicates
  }

  /**
   * Step 2: Build AI prompt to narrow down search results to relevant slugs
   */
  buildSlugSelectionPrompt(query: string, searchResults: MCPSearchResult[]): {
    systemPrompt: string;
    userPrompt: string;
  } {
    const systemPrompt = `You are an expert at understanding user intent and selecting the most relevant MCP servers from search results.

Your task:
1. Understand the user's natural language query including negations and preferences
2. Select 5-10 most relevant MCP server slugs from the search results
3. Pay attention to exclusions (e.g., "not Gmail" means exclude gmail-related servers)
4. Consider context and intent, not just keyword matching

Respond with valid JSON only.`;

    const userPrompt = `User Query: "${query}"

Search Results:
${this.formatSearchResults(searchResults)}

Instructions:
- Select 5-10 most relevant server slugs based on the user's intent
- Pay attention to negations: "not Gmail" means exclude Gmail-related servers
- Consider alternatives: "instead of Slack" means find Slack alternatives
- Focus on user intent, not just keyword matching
- If user wants privacy/security, prioritize those features

Respond with:
{
  "selectedSlugs": ["server1.com", "server2.com", "server3.com"],
  "reasoning": "Selected privacy-focused email servers excluding Gmail as requested",
  "confidence": 0.9
}

Respond with valid JSON only:`;

    return { systemPrompt, userPrompt };
  }

  /**
   * Helper: Check if word is a stop word
   */
  private isStopWord(word: string): boolean {
    const stopWords = [
      'find', 'show', 'get', 'need', 'want', 'looking', 'search',
      'help', 'can', 'could', 'would', 'should', 'will', 'shall',
      'me', 'my', 'i', 'you', 'we', 'they', 'it', 'this', 'that',
      'some', 'any', 'all', 'each', 'every', 'most', 'many', 'few'
    ];
    return stopWords.includes(word);
  }

  /**
   * Helper: Format search results for AI prompt
   */
  private formatSearchResults(results: MCPSearchResult[]): string {
    return results.map((result, index) => {
      return `${index + 1}. ${result.slug}
   Name: ${result.name}
   Description: ${result.description}
   Capabilities: ${result.capabilities.join(', ')}
   Tags: ${result.tags.join(', ')}`;
    }).join('\n\n');
  }

}
