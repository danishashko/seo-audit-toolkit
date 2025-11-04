/**
 * Lighthouse Runner - Performance & SEO scoring
 */

const { startFlow } = require('lighthouse');
const puppeteer = require('puppeteer');

class LighthouseRunner {
  async run(url) {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    const flow = await startFlow(page, {
      config: {
        extends: 'lighthouse:default',
        settings: {
          onlyCategories: ['performance', 'seo', 'accessibility', 'best-practices'],
          skipAudits: ['screenshot-thumbnails', 'final-screenshot'],
          maxWaitForLoad: 45000,
        },
      },
    });

    await flow.navigate(url);

    const report = await flow.createFlowResult();
    await browser.close();

    const lhr = report.steps[0].lhr;

    // Extract actionable items
    const failedAudits = Object.entries(lhr.audits)
      .filter(([_, audit]) => audit.score !== null && audit.score < 1)
      .map(([id, audit]) => ({
        id,
        title: audit.title,
        description: audit.description,
        score: audit.score,
      }))
      .slice(0, 15);

    const opportunities = (lhr.audits['diagnostics'] ? [] : [])
      .concat(
        Object.entries(lhr.audits)
          .filter(([_, audit]) => audit.details && audit.details.type === 'opportunity')
          .map(([id, audit]) => ({
            id,
            title: audit.title,
            description: audit.description,
            savings: audit.details.overallSavingsMs || 0,
          }))
      )
      .slice(0, 10);

    const diagnostics = Object.entries(lhr.audits)
      .filter(([_, audit]) => audit.details && audit.details.type === 'table' && audit.score !== null && audit.score < 1)
      .map(([id, audit]) => ({
        id,
        title: audit.title,
        description: audit.description,
      }))
      .slice(0, 10);

    return {
      scores: {
        performance: Math.round(lhr.categories.performance.score * 100),
        seo: Math.round(lhr.categories.seo.score * 100),
        accessibility: Math.round(lhr.categories.accessibility.score * 100),
        bestPractices: Math.round(lhr.categories['best-practices'].score * 100),
      },
      metrics: {
        fcp: lhr.audits['first-contentful-paint'].numericValue,
        lcp: lhr.audits['largest-contentful-paint'].numericValue,
        cls: lhr.audits['cumulative-layout-shift'].numericValue,
        tti: lhr.audits['interactive'].numericValue,
        tbt: lhr.audits['total-blocking-time'].numericValue,
        si: lhr.audits['speed-index'].numericValue,
      },
      audits: {
        metaDescription: lhr.audits['meta-description'].score === 1,
        httpStatusCode: lhr.audits['http-status-code'].score === 1,
        linkText: lhr.audits['link-text'].score === 1,
        crawlable: lhr.audits['is-crawlable'].score === 1,
        robots: lhr.audits['robots-txt'].score === 1,
        hreflang: lhr.audits['hreflang'].score === 1,
        canonical: lhr.audits['canonical'].score === 1,
      },
      failedAudits,
      opportunities,
      diagnostics,
      fullReport: lhr,
    };
  }
}

module.exports = LighthouseRunner;
