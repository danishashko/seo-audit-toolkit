/**
 * HTML Analyzer - Deep SEO analysis
 */

const axios = require('axios');
const cheerio = require('cheerio');

class HTMLAnalyzer {
  async analyze(url) {
    const response = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 SEO-Audit-Toolkit' },
      timeout: 10000,
    });

    const $ = cheerio.load(response.data);

    return {
      meta: this.extractMeta($),
      headings: this.extractHeadings($),
      images: this.analyzeImages($),
      links: this.analyzeLinks($, url),
      schema: this.extractSchema($),
      openGraph: this.extractOpenGraph($),
      twitter: this.extractTwitter($),
      technical: this.analyzeTechnical($),
    };
  }

  extractMeta($) {
    return {
      title: $('title').text() || null,
      titleLength: ($('title').text() || '').length,
      description: $('meta[name="description"]').attr('content') || null,
      descriptionLength: ($('meta[name="description"]').attr('content') || '').length,
      keywords: $('meta[name="keywords"]').attr('content') || null,
      robots: $('meta[name="robots"]').attr('content') || null,
      canonical: $('link[rel="canonical"]').attr('href') || null,
      author: $('meta[name="author"]').attr('content') || null,
      viewport: $('meta[name="viewport"]').attr('content') || null,
    };
  }

  extractHeadings($) {
    const headings = { h1: [], h2: [], h3: [], h4: [], h5: [], h6: [] };

    for (let i = 1; i <= 6; i++) {
      $(`h${i}`).each((_, el) => {
        const text = $(el).text().trim();
        if (text) headings[`h${i}`].push(text);
      });
    }

    return headings;
  }

  analyzeImages($) {
    const images = [];
    let missingAlt = 0;

    $('img').each((_, el) => {
      const src = $(el).attr('src');
      const alt = $(el).attr('alt');

      if (!alt || alt.trim() === '') missingAlt++;

      images.push({ src, alt: alt || null });
    });

    return { total: images.length, missingAlt, images: images.slice(0, 10) };
  }

  analyzeLinks($, baseUrl) {
    let internal = 0;
    let external = 0;
    const externalLinks = [];

    $('a[href]').each((_, el) => {
      const href = $(el).attr('href');

      if (href.startsWith('http') && !href.includes(new URL(baseUrl).hostname)) {
        external++;
        if (externalLinks.length < 5) externalLinks.push(href);
      } else if (href.startsWith('/') || href.startsWith(baseUrl)) {
        internal++;
      }
    });

    return { internal, external, externalLinks };
  }

  extractSchema($) {
    const schemas = [];

    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const data = JSON.parse($(el).html());
        schemas.push(data);
      } catch (e) {
        // Invalid JSON
      }
    });

    return schemas;
  }

  extractOpenGraph($) {
    const og = {};

    $('meta[property^="og:"]').each((_, el) => {
      const property = $(el).attr('property').replace('og:', '');
      const content = $(el).attr('content');
      og[property] = content;
    });

    return og;
  }

  extractTwitter($) {
    const twitter = {};

    $('meta[name^="twitter:"]').each((_, el) => {
      const name = $(el).attr('name').replace('twitter:', '');
      const content = $(el).attr('content');
      twitter[name] = content;
    });

    return twitter;
  }

  analyzeTechnical($) {
    return {
      hasGoogleAnalytics: $('script[src*="google-analytics"]').length > 0 ||
                          $('script[src*="gtag"]').length > 0,
      hasGTM: $('script[src*="googletagmanager"]').length > 0,
      scripts: $('script').length,
      deferredScripts: $('script[defer]').length,
      asyncScripts: $('script[async]').length,
      inlineScripts: $('script:not([src])').length,
      stylesheets: $('link[rel="stylesheet"]').length,
    };
  }
}

module.exports = HTMLAnalyzer;
