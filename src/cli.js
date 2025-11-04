#!/usr/bin/env node

/**
 * SEO Audit Toolkit - CLI
 */

const chalk = require('chalk');
const LighthouseRunner = require('./lighthouse-runner');
const HTMLAnalyzer = require('./html-analyzer');
const AIAnalyzer = require('./ai-analyzer');
const ReportFormatter = require('./formatter');
const fs = require('fs');

async function run() {
  const url = process.argv[2];

  if (!url) {
    console.log(chalk.red('\n❌ Error: URL required'));
    console.log(chalk.gray('\nUsage: seo-audit <url>'));
    console.log(chalk.gray('Example: seo-audit https://example.com\n'));
    process.exit(1);
  }

  const jsonOutput = process.argv.includes('--json');

  try {
    console.log(chalk.cyan(`\n🔍 Auditing ${url}...\n`));

    // Run Lighthouse
    console.log(chalk.gray('Running Lighthouse...'));
    const lighthouseRunner = new LighthouseRunner();
    const lighthouse = await lighthouseRunner.run(url);

    // Parse HTML
    console.log(chalk.gray('Analyzing HTML...'));
    const htmlAnalyzer = new HTMLAnalyzer();
    const html = await htmlAnalyzer.analyze(url);

    // AI Analysis
    console.log(chalk.gray('Generating AI recommendations...'));
    const aiAnalyzer = new AIAnalyzer();
    const ai = await aiAnalyzer.analyze(url, lighthouse, html);

    if (jsonOutput) {
      const report = { url, lighthouse, html, ai, timestamp: new Date().toISOString() };
      console.log(JSON.stringify(report, null, 2));
    } else {
      console.log(ReportFormatter.format(lighthouse, html, ai));

      // Save JSON
      const filename = `seo-audit-${new URL(url).hostname}-${Date.now()}.json`;
      fs.writeFileSync(filename, JSON.stringify({ url, lighthouse, html, ai, timestamp: new Date().toISOString() }, null, 2));
      console.log(chalk.gray(`Report saved: ${filename}\n`));
    }
  } catch (error) {
    console.error(chalk.red('\n❌ Audit failed:'), error.message);
    process.exit(1);
  }
}

run();
