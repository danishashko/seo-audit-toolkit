# seo-audit-toolkit 🔍

**Automated SEO audits in 60 seconds. Lighthouse + AI = Actionable fixes.**

[![npm version](https://img.shields.io/npm/v/seo-audit-toolkit.svg)](https://www.npmjs.com/package/seo-audit-toolkit)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

Complete SEO analysis: Lighthouse scores, Core Web Vitals, meta tags, schema validation, and AI-powered recommendations.

## 🚀 Quick Start

```bash
# No install needed
npx seo-audit https://yoursite.com

# Or install globally
npm install -g seo-audit-toolkit
seo-audit https://yoursite.com
```

## 💡 What You Get

### 📊 Lighthouse Scores
- Performance (0-100)
- SEO (0-100)
- Accessibility (0-100)
- Best Practices (0-100)

### ⚡ Core Web Vitals
- LCP (Largest Contentful Paint)
- CLS (Cumulative Layout Shift)
- FCP (First Contentful Paint)
- TTI (Time to Interactive)

### 🏷️ Meta Tags Analysis
- Title (length, presence)
- Description (length, presence)
- Canonical URL
- Open Graph tags
- Twitter Cards

### 📝 Content Structure
- Heading hierarchy (H1-H6)
- H1 optimization
- Internal/external links
- Image alt tags

### 🔖 Schema Markup
- JSON-LD detection
- Schema types validation

### 🤖 AI Recommendations
- Prioritized action items (HIGH/MEDIUM/LOW)
- Specific fixes for each issue
- Search query opportunities
- Content optimization suggestions

## ✨ Features

**Lighthouse Integration**
- Automated performance auditing
- Core Web Vitals measurement
- SEO best practices validation

**Deep HTML Analysis**
- Meta tag extraction
- Schema.org parsing
- Open Graph validation
- Image optimization checks

**AI-Powered Insights**
- OpenAI GPT-5-mini or Google Gemini 2.0 Flash
- Context-aware recommendations with savings estimates
- Prioritized action items (HIGH/MEDIUM/LOW)
- Failed audit analysis with specific fixes

**Multiple Output Formats**
- Beautiful CLI report
- JSON export for automation
- Auto-saved reports

## 📖 Usage

### Basic Audit
```bash
seo-audit https://example.com
```

### JSON Output
```bash
seo-audit https://example.com --json
```

### With AI Recommendations
```bash
# Option 1: OpenAI (default: gpt-5-mini)
export OPENAI_API_KEY='your-key-here'
export AI_PROVIDER='openai'
seo-audit https://example.com

# Option 2: Google Gemini
export GEMINI_API_KEY='your-key-here'
seo-audit https://example.com
```

## 🤖 AI Setup (Optional)

**OpenAI:**
1. Get API key: https://platform.openai.com/api-keys
2. `export OPENAI_API_KEY='sk-...'`
3. `export AI_PROVIDER='openai'`

**Google Gemini:**
1. Get free API key: https://ai.google.dev
2. `export GEMINI_API_KEY='your-key'`

**Without AI:** Still get Lighthouse + HTML analysis
**With AI:** Get 8-10 prioritized, actionable recommendations with savings estimates

## 📊 Example Report

```
══════════════════════════════════════════════════════════════════════
                    SEO AUDIT REPORT
══════════════════════════════════════════════════════════════════════

📊 LIGHTHOUSE SCORES

┌────────────────┬─────────┬──────────┐
│ Category       │ Score   │ Status   │
├────────────────┼─────────┼──────────┤
│ Performance    │ 100/100 │ ✅ Good  │
│ SEO            │ 80/100  │ ⚠️  Fair │
│ Accessibility  │ 100/100 │ ✅ Good  │
│ Best Practices │ 93/100  │ ✅ Good  │
└────────────────┴─────────┴──────────┘

⚡ CORE WEB VITALS

  LCP: 852ms (Good: <2.5s)
  CLS: 0 (Good: <0.1)
  FCP: 852ms (Good: <1.8s)

🏷️  META TAGS

  Title: ⚠️  14 chars (optimal: 50-60)
  Description: ❌ Missing
  Canonical: ❌ Missing

🤖 AI RECOMMENDATIONS

  1. [HIGH] Missing Meta Description
     → Write compelling 150-160 char description with target keywords

  2. [HIGH] Missing Open Graph Tags
     → Implement OG tags for social media sharing

  3. [MED] Add Canonical Tag
     → Prevent duplicate content issues
```

## 🎯 Use Cases

**For Developers**
- Pre-launch SEO checks
- CI/CD integration
- Performance monitoring

**For Marketers**
- Content optimization
- Competitor analysis
- Quick site audits

**For Agencies**
- Client reports
- Automated monitoring
- Batch audits

## ⚙️ Technical Details

**Dependencies:**
- Lighthouse (Google's official tool)
- Chrome Launcher (headless Chrome)
- Cheerio (HTML parsing)
- Google Gemini (AI analysis)

**What Gets Analyzed:**
- Performance metrics
- SEO fundamentals
- Accessibility standards
- Meta tag completeness
- Schema markup validation
- Heading structure
- Image optimization
- Link analysis

**No Data Sent:** All analysis runs locally except optional AI (Gemini API)

## 🛡️ Privacy

- Lighthouse runs in local headless Chrome
- HTML analysis is client-side
- AI recommendations use Gemini API (optional)
- No data stored or transmitted (except Gemini API calls)
- Reports saved locally only

## 📄 Output Files

Auto-saves JSON reports:
```
seo-audit-example.com-1234567890.json
```

Contains:
- Complete Lighthouse data
- HTML analysis results
- AI recommendations
- Timestamp

## 🔥 Pro Tips

**Monthly Audits**
```bash
# Track SEO progress over time
seo-audit https://yoursite.com
```

**CI/CD Integration**
```bash
# Fail build if SEO score < 80
seo-audit https://staging.yoursite.com --json | \
  jq '.lighthouse.scores.seo < 80' && exit 1
```

**Batch Audits**
```bash
# Audit multiple pages
for url in page1 page2 page3; do
  seo-audit https://site.com/$url
done
```

## 👤 Author

**Daniel Shashko**
- GitHub: [@danishashko](https://github.com/danishashko)
- LinkedIn: [daniel-shashko](https://linkedin.com/in/daniel-shashko)
- npm: [seo-audit-toolkit](https://www.npmjs.com/package/seo-audit-toolkit)

## 📄 License

MIT © Daniel Shashko

---

## 🔍 Stop Guessing. Start Optimizing.

```bash
npx seo-audit https://yoursite.com
```
