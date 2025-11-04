/**
 * AI Analyzer - Smart SEO recommendations
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const OpenAI = require('openai');

class AIAnalyzer {
  constructor() {
    const geminiKey = process.env.GEMINI_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    this.provider = process.env.AI_PROVIDER || (openaiKey ? 'openai' : 'gemini');
    this.enabled = !!(geminiKey || openaiKey);

    if (this.enabled) {
      if (this.provider === 'openai' && openaiKey) {
        this.client = new OpenAI({ apiKey: openaiKey });
        this.model = process.env.OPENAI_MODEL || 'gpt-5-mini';
      } else if (geminiKey) {
        this.provider = 'gemini';
        this.genAI = new GoogleGenerativeAI(geminiKey);
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
      } else {
        this.enabled = false;
      }
    }
  }

  async analyze(url, lighthouseData, htmlData) {
    if (!this.enabled) {
      return { enabled: false, recommendations: [] };
    }

    const prompt = this.buildPrompt(url, lighthouseData, htmlData);

    try {
      let text;

      if (this.provider === 'openai') {
        const completion = await this.client.chat.completions.create({
          model: this.model,
          messages: [{ role: 'user', content: prompt }],
        });
        text = completion.choices[0].message.content;
      } else {
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        text = response.text();
      }

      return {
        enabled: true,
        provider: this.provider,
        model: this.model,
        recommendations: this.parseRecommendations(text),
        raw: text,
      };
    } catch (error) {
      return { enabled: false, error: error.message };
    }
  }

  buildPrompt(url, lighthouse, html) {
    const failedAudits = lighthouse.failedAudits || [];
    const opportunities = lighthouse.opportunities || [];
    const diagnostics = lighthouse.diagnostics || [];

    return `Analyze this website's SEO and provide 5-10 actionable fixes.

URL: ${url}

LIGHTHOUSE SCORES:
- Performance: ${lighthouse.scores.performance}/100
- SEO: ${lighthouse.scores.seo}/100
- Accessibility: ${lighthouse.scores.accessibility}/100
- Best Practices: ${lighthouse.scores.bestPractices}/100

CORE WEB VITALS:
- LCP: ${Math.round(lighthouse.metrics.lcp)}ms
- CLS: ${lighthouse.metrics.cls.toFixed(3)}
- FCP: ${Math.round(lighthouse.metrics.fcp)}ms
- TTI: ${Math.round(lighthouse.metrics.tti)}ms
- TBT: ${Math.round(lighthouse.metrics.tbt)}ms
- Speed Index: ${Math.round(lighthouse.metrics.si)}ms

FAILED LIGHTHOUSE AUDITS (Top ${failedAudits.length}):
${failedAudits.length > 0 ? failedAudits.map(a => `- ${a.title}: ${a.description}`).join('\n') : '- None'}

PERFORMANCE OPPORTUNITIES:
${opportunities.length > 0 ? opportunities.map(o => `- ${o.title} (saves ${Math.round(o.savings)}ms): ${o.description}`).join('\n') : '- None'}

DIAGNOSTICS:
${diagnostics.length > 0 ? diagnostics.map(d => `- ${d.title}: ${d.description}`).join('\n') : '- None'}

META DATA:
- Title: ${html.meta.title || 'MISSING'} (${html.meta.titleLength} chars)
- Description: ${html.meta.description ? `Present (${html.meta.descriptionLength} chars)` : 'MISSING'}
- Canonical: ${html.meta.canonical || 'MISSING'}

HEADINGS:
- H1: ${html.headings.h1.length} found - ${JSON.stringify(html.headings.h1.slice(0, 2))}
- H2: ${html.headings.h2.length} found

IMAGES:
- Total: ${html.images.total}
- Missing alt: ${html.images.missingAlt}

SCHEMA:
- Found: ${html.schema.length} schemas
- Types: ${html.schema.map(s => s['@type']).join(', ')}

OPEN GRAPH:
- Title: ${html.openGraph.title ? 'Yes' : 'No'}
- Description: ${html.openGraph.description ? 'Yes' : 'No'}
- Image: ${html.openGraph.image ? 'Yes' : 'No'}

CRITICAL: Use EXACTLY this format for each recommendation:
1. [HIGH] Issue title → Specific fix action in 1-2 sentences
2. [MEDIUM] Issue title → Specific fix action in 1-2 sentences
3. [LOW] Issue title → Specific fix action in 1-2 sentences

Requirements:
- ONE line per recommendation
- Priority must be HIGH, MEDIUM, or LOW in brackets
- Use → arrow between issue and fix
- Fix must be 1-2 sentences maximum
- No bullet points, no sub-lists
- Max 10 recommendations

Focus on:
- Quick wins (high impact, low effort)
- Failed Lighthouse audits with specific savings
- Core Web Vitals improvements
- Technical SEO gaps

Example:
1. [HIGH] LCP 5.8s exceeds threshold → Preload hero image and defer non-critical CSS/JS to reduce LCP below 2.5s
2. [MEDIUM] 50 images missing alt text → Add descriptive alt attributes to all images for accessibility and SEO`;
  }

  parseRecommendations(text) {
    const lines = text.split('\n');
    const recommendations = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Match: 1. [HIGH] issue → fix or 1. [PRIORITY: HIGH] issue → fix
      const match = line.match(/^\d+\.\s*\[(?:PRIORITY:\s*)?(HIGH|MEDIUM|MED|LOW)\]\s*(.+?)(?:→(.+))?$/i);

      if (match) {
        const priority = match[1].toUpperCase() === 'MED' ? 'MEDIUM' : match[1].toUpperCase();
        const issue = match[2].trim();
        const fix = match[3]?.trim() || '';

        // If no arrow, next lines might be the fix
        let fullFix = fix;
        if (!fix && i + 1 < lines.length) {
          const nextLine = lines[i + 1].trim();
          if (nextLine.startsWith('→')) {
            fullFix = nextLine.substring(1).trim();
            i++;
          }
        }

        recommendations.push({
          priority,
          issue,
          fix: fullFix || issue, // fallback to issue if no fix
        });
      }
    }

    return recommendations;
  }
}

module.exports = AIAnalyzer;
