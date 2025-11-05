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

async function auditSingle(url, jsonOutput = false, silent = false) {
  if (!silent && !jsonOutput) {
    console.log(chalk.cyan(`\n🔍 Auditing ${url}...\n`));
  }

  // Run Lighthouse
  if (!silent && !jsonOutput) console.log(chalk.gray('Running Lighthouse...'));
  const lighthouseRunner = new LighthouseRunner();
  const lighthouse = await lighthouseRunner.run(url);

  // Parse HTML
  if (!silent && !jsonOutput) console.log(chalk.gray('Analyzing HTML...'));
  const htmlAnalyzer = new HTMLAnalyzer();
  const html = await htmlAnalyzer.analyze(url);

  // AI Analysis
  if (!silent && !jsonOutput) console.log(chalk.gray('Generating AI recommendations...'));
  const aiAnalyzer = new AIAnalyzer();
  const ai = await aiAnalyzer.analyze(url, lighthouse, html);

  const report = { url, lighthouse, html, ai, timestamp: new Date().toISOString() };

  if (jsonOutput && !silent) {
    console.log(JSON.stringify(report, null, 2));
  } else if (!silent) {
    console.log(ReportFormatter.format(lighthouse, html, ai));

    const filename = `seo-audit-${new URL(url).hostname}-${Date.now()}.json`;
    fs.writeFileSync(filename, JSON.stringify(report, null, 2));
    console.log(chalk.gray(`Report saved: ${filename}\n`));
  }

  return report;
}

async function auditBatch(urls, jsonOutput = false) {
  const results = [];
  const startTime = Date.now();

  if (!jsonOutput) {
    console.log(chalk.cyan(`\n🔍 Batch auditing ${urls.length} URLs...\n`));
  }

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    if (!jsonOutput) {
      console.log(chalk.bold(`[${i + 1}/${urls.length}] ${url}`));
    }

    try {
      const report = await auditSingle(url, false, jsonOutput);
      results.push({ ...report, success: true });
    } catch (error) {
      if (!jsonOutput) {
        console.error(chalk.red(`❌ Failed: ${error.message}\n`));
      }
      results.push({ url, success: false, error: error.message, timestamp: new Date().toISOString() });
    }
  }

  const duration = Math.round((Date.now() - startTime) / 1000);
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  if (jsonOutput) {
    console.log(JSON.stringify({
      summary: { total: urls.length, successful, failed, duration },
      results
    }, null, 2));
  } else {
    console.log(chalk.cyan('\n' + '═'.repeat(70)));
    console.log(chalk.bold.cyan('BATCH AUDIT SUMMARY'));
    console.log(chalk.cyan('═'.repeat(70)));
    console.log(`\n${chalk.green('✅ Successful:')} ${successful}/${urls.length}`);
    console.log(`${chalk.red('❌ Failed:')} ${failed}/${urls.length}`);
    console.log(`${chalk.gray('⏱️  Duration:')} ${duration}s\n`);

    const filename = `seo-audit-batch-${Date.now()}.json`;
    fs.writeFileSync(filename, JSON.stringify({
      summary: { total: urls.length, successful, failed, duration },
      results
    }, null, 2));
    console.log(chalk.gray(`Batch report saved: ${filename}\n`));
  }
}

async function run() {
  const args = process.argv.slice(2).filter(arg => !arg.startsWith('--'));
  const jsonOutput = process.argv.includes('--json');

  if (args.length === 0) {
    console.log(chalk.red('\n❌ Error: URL required'));
    console.log(chalk.gray('\nUsage:'));
    console.log(chalk.gray('  Single: seo-audit <url>'));
    console.log(chalk.gray('  Batch:  seo-audit <url1> <url2> <url3>...'));
    console.log(chalk.gray('  JSON:   seo-audit <url> --json\n'));
    console.log(chalk.gray('Example:'));
    console.log(chalk.gray('  seo-audit https://example.com'));
    console.log(chalk.gray('  seo-audit https://site1.com https://site2.com https://site3.com\n'));
    process.exit(1);
  }

  try {
    if (args.length === 1) {
      await auditSingle(args[0], jsonOutput);
    } else {
      await auditBatch(args, jsonOutput);
    }
  } catch (error) {
    console.error(chalk.red('\n❌ Audit failed:'), error.message);
    process.exit(1);
  }
}

run();
