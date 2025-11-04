/**
 * Report Formatter - CLI output
 */

const chalk = require('chalk');
const Table = require('cli-table3');

class ReportFormatter {
  static format(lighthouse, html, ai) {
    const lines = [];

    lines.push('');
    lines.push(chalk.cyan('═'.repeat(70)));
    lines.push(chalk.bold.cyan('                    SEO AUDIT REPORT'));
    lines.push(chalk.cyan('═'.repeat(70)));
    lines.push('');

    // Lighthouse Scores
    lines.push(chalk.bold('📊 LIGHTHOUSE SCORES'));
    lines.push('');

    const scoreTable = new Table({
      head: ['Category', 'Score', 'Status'],
      style: { head: [], border: ['gray'] },
    });

    const addScore = (name, score) => {
      let color = chalk.red;
      let status = '❌ Needs Work';

      if (score >= 90) {
        color = chalk.green;
        status = '✅ Good';
      } else if (score >= 50) {
        color = chalk.yellow;
        status = '⚠️  Fair';
      }

      scoreTable.push([name, color(score + '/100'), status]);
    };

    addScore('Performance', lighthouse.scores.performance);
    addScore('SEO', lighthouse.scores.seo);
    addScore('Accessibility', lighthouse.scores.accessibility);
    addScore('Best Practices', lighthouse.scores.bestPractices);

    lines.push(scoreTable.toString());
    lines.push('');

    // Core Web Vitals
    lines.push(chalk.bold('⚡ CORE WEB VITALS'));
    lines.push('');

    const vitalColor = (metric, good, fair) => {
      if (metric <= good) return chalk.green(Math.round(metric));
      if (metric <= fair) return chalk.yellow(Math.round(metric));
      return chalk.red(Math.round(metric));
    };

    lines.push(`  LCP: ${vitalColor(lighthouse.metrics.lcp, 2500, 4000)}ms (Good: <2.5s)`);
    lines.push(`  CLS: ${vitalColor(lighthouse.metrics.cls, 0.1, 0.25)} (Good: <0.1)`);
    lines.push(`  FCP: ${vitalColor(lighthouse.metrics.fcp, 1800, 3000)}ms (Good: <1.8s)`);
    lines.push(`  TTI: ${vitalColor(lighthouse.metrics.tti, 3800, 7300)}ms (Good: <3.8s)`);
    lines.push('');

    // Meta Tags
    lines.push(chalk.bold('🏷️  META TAGS'));
    lines.push('');

    const metaTable = new Table({
      head: ['Tag', 'Status', 'Value'],
      colWidths: [20, 10, 40],
      wordWrap: true,
      style: { head: [], border: ['gray'] },
    });

    metaTable.push([
      'Title',
      html.meta.title ? (html.meta.titleLength >= 50 && html.meta.titleLength <= 60 ? '✅' : '⚠️') : '❌',
      html.meta.title ? `${html.meta.title.substring(0, 37)}... (${html.meta.titleLength} chars)` : 'Missing',
    ]);

    metaTable.push([
      'Description',
      html.meta.description ? (html.meta.descriptionLength >= 150 && html.meta.descriptionLength <= 160 ? '✅' : '⚠️') : '❌',
      html.meta.description ? `${html.meta.descriptionLength} chars` : 'Missing',
    ]);

    metaTable.push([
      'Canonical',
      html.meta.canonical ? '✅' : '❌',
      html.meta.canonical || 'Missing',
    ]);

    lines.push(metaTable.toString());
    lines.push('');

    // Headings
    lines.push(chalk.bold('📝 HEADING STRUCTURE'));
    lines.push('');
    lines.push(`  H1: ${html.headings.h1.length === 1 ? chalk.green('✅ 1') : chalk.red(`❌ ${html.headings.h1.length}`)} - ${html.headings.h1.join(', ').substring(0, 50)}`);
    lines.push(`  H2: ${html.headings.h2.length} headings`);
    lines.push('');

    // Images
    lines.push(chalk.bold('🖼️  IMAGES'));
    lines.push('');
    lines.push(`  Total: ${html.images.total}`);
    lines.push(`  Missing alt: ${html.images.missingAlt > 0 ? chalk.red(html.images.missingAlt) : chalk.green('0')}`);
    lines.push('');

    // Schema
    lines.push(chalk.bold('🔖 SCHEMA MARKUP'));
    lines.push('');
    if (html.schema.length > 0) {
      html.schema.forEach(s => {
        lines.push(`  ✅ ${s['@type'] || 'Unknown'}`);
      });
    } else {
      lines.push(`  ${chalk.red('❌ No schema found')}`);
    }
    lines.push('');

    // AI Recommendations
    if (ai.enabled && ai.recommendations.length > 0) {
      lines.push(chalk.bold('🤖 AI RECOMMENDATIONS'));
      lines.push('');

      ai.recommendations.forEach((rec, i) => {
        const priority = rec.priority === 'HIGH' ? chalk.red('HIGH') :
                        rec.priority === 'MEDIUM' ? chalk.yellow('MED') :
                        chalk.gray('LOW');

        lines.push(`  ${i + 1}. [${priority}] ${rec.issue}`);
        lines.push(`     → ${chalk.cyan(rec.fix)}`);
        lines.push('');
      });
    }

    lines.push(chalk.cyan('═'.repeat(70)));
    lines.push('');

    return lines.join('\n');
  }
}

module.exports = ReportFormatter;
