import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export function assertCleanSarif(reports) {
  if (!Array.isArray(reports) || reports.length === 0) throw new Error('Missing code-scanning reports.');
  let findings = 0;
  const findingLocations = [];
  for (const report of reports) {
    if (report.version !== '2.1.0' || !Array.isArray(report.runs) || report.runs.length === 0) {
      throw new Error('Malformed or empty code-scanning report.');
    }
    for (const run of report.runs) {
      if (!run.tool?.driver?.name || !Array.isArray(run.results)) throw new Error('Missing scanner identity or results.');
      if (run.invocations?.some(invocation => invocation.executionSuccessful === false)) throw new Error('Scanner execution failed.');
      findings += run.results.length;
      for (const result of run.results) {
        const location = result.locations?.[0]?.physicalLocation;
        const file = location?.artifactLocation?.uri;
        const line = location?.region?.startLine;
        // Emit only repository-relative locations and standard rule identifiers,
        // never result messages, snippets, URLs, or arbitrary report strings.
        if (/^[a-zA-Z0-9_./-]+$/.test(result.ruleId ?? '') &&
            typeof file === 'string' && /^(src|scripts|public|tests)\/[a-zA-Z0-9_./()@-]+$/.test(file) &&
            !file.split('/').includes('..') && Number.isSafeInteger(line) && line > 0) {
          findingLocations.push({ file, line, rule: result.ruleId });
        }
      }
    }
  }
  if (findings) throw Object.assign(new Error(`Release blocked: ${findings} code-scanning finding(s). Review scanner results; raw evidence is not printed here.`), { findingLocations });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const directory = process.argv[2];
    if (!directory) throw new Error('A SARIF output directory is required.');
    const files = fs.readdirSync(directory, { recursive: true }).filter(file => file.endsWith('.sarif'));
    assertCleanSarif(files.map(file => JSON.parse(fs.readFileSync(path.join(directory, file), 'utf8'))));
    console.log('PASS: scanner reports exist and contain no findings.');
  } catch (error) {
    // Make the failure category visible through the Checks API when log downloads
    // are unavailable. Never put scanner contents or parser excerpts in annotations.
    const message = error instanceof SyntaxError ? 'Malformed SARIF JSON report; raw contents withheld.' : error.message;
    console.error(message);
    if (process.env.GITHUB_ACTIONS === 'true') {
      const known = /^(Missing code-scanning reports\.|Malformed or empty code-scanning report\.|Missing scanner identity or results\.|Scanner execution failed\.|Release blocked: \d+ code-scanning finding\(s\)\. Review scanner results; raw evidence is not printed here\.|Malformed SARIF JSON report; raw contents withheld\.)$/;
      console.error(`::error::${known.test(message) ? message : 'SARIF validation failed; inspect the restricted job logs.'}`);
      for (const { file, line, rule } of error.findingLocations ?? []) {
        console.error(`::error file=${file},line=${line}::CodeQL rule ${rule}; result text withheld.`);
      }
    }
    process.exitCode = 1;
  }
}
