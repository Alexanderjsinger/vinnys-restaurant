import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { pathToFileURL } from 'node:url';
const exec = promisify(execFile);
const repository = 'Alexanderjsinger/vinnys-restaurant';

export function assessPolicyPr(pr) {
  const blockers = [];
  if (pr.state !== 'OPEN') blockers.push('PR is not open');
  if (pr.baseRefName !== 'codex/alternative-homepage') blockers.push('Unexpected policy PR base');
  if (pr.headRefName !== 'codex/solo-owner-review-policy') blockers.push('Unexpected policy PR head branch');
  if (!/^[0-9a-f]{40}$/.test(pr.headRefOid ?? '')) blockers.push('Missing current commit SHA');
  const ownerComment = (pr.comments ?? []).find(comment =>
    comment.author?.login?.toLowerCase() === 'alexanderjsinger' &&
    comment.body?.trim() === `Reviewed ${pr.headRefOid}` && comment.url);
  if (!ownerComment) blockers.push('No owner Reviewed comment for the current head SHA');
  const checks = pr.statusCheckRollup ?? [];
  if (!checks.length) blockers.push('No check results available');
  for (const check of checks) {
    const passed = check.__typename === 'StatusContext' ? check.state === 'SUCCESS' : check.status === 'COMPLETED' && check.conclusion === 'SUCCESS';
    if (!passed) blockers.push(`Unsuccessful reported check: ${check.name ?? check.context ?? 'unnamed'}`);
  }
  if (pr.isDraft) blockers.push('PR is still a draft');
  return { number: pr.number, url: pr.url, head: pr.headRefOid, ownerCommentUrl: ownerComment?.url ?? null, reportedChecks: checks.length, blockers };
}

export function assessFinalPolicySnapshot(pr, current, { headPushAt = null, commentCreatedAt = null } = {}) {
  const blockers = [];
  if (current.state !== 'open' || current.draft !== false) blockers.push('PR state/draft changed or is unverified');
  if (current.head?.sha !== pr.headRefOid || current.head?.ref !== pr.headRefName ||
      current.base?.ref !== pr.baseRefName || current.base?.sha !== pr.baseRefOid ||
      current.head?.repo?.full_name !== repository || current.base?.repo?.full_name !== repository) {
    blockers.push('PR branch/repository identity changed or is unverified; rerun');
  }
  if (current.mergeable !== true || current.mergeable_state !== 'clean') blockers.push('GitHub has not confirmed clean mergeability');
  const pushed = Date.parse(headPushAt ?? ''), reviewed = Date.parse(commentCreatedAt ?? '');
  if (!Number.isFinite(pushed)) blockers.push('Latest head-push timestamp lacks trusted branch-specific evidence; review freshness is unverified');
  else if (!Number.isFinite(reviewed) || reviewed < pushed) blockers.push('Owner review does not follow the latest verified head push');
  return blockers;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const number = process.argv[2] ?? '57';
  if (!/^[1-9][0-9]*$/.test(number)) throw new Error('Usage: node scripts/check-policy-pr.mjs [PR number]');
  try {
    const { stdout } = await exec('gh', ['pr', 'view', number, '--repo', repository, '--json',
      'number,url,state,isDraft,headRefName,headRefOid,baseRefName,baseRefOid,statusCheckRollup,comments'], { maxBuffer: 8 * 1024 * 1024 });
    const pr = JSON.parse(stdout);
    const result = assessPolicyPr(pr);
    const api = async endpoint => JSON.parse((await exec('gh', ['api', endpoint], { maxBuffer: 8 * 1024 * 1024 })).stdout);
    const base = encodeURIComponent(pr.baseRefName);
    let classic;
    try { classic = await api(`repos/${repository}/branches/${base}/protection`); }
    catch (error) {
      if (!String(error.stderr).includes('404')) throw error;
      classic = null;
    }
    const rules = await api(`repos/${repository}/rules/branches/${base}`);
    if (!Array.isArray(rules)) throw new Error('Missing effective rules');
    const required = [
      ...(classic?.required_status_checks?.contexts ?? []),
      ...(classic?.required_status_checks?.checks ?? []).map(check => check.context),
      ...rules.filter(rule => rule.type === 'required_status_checks').flatMap(rule => rule.parameters?.required_status_checks?.map(check => check.context) ?? []),
    ];
    result.requiredChecks = [...new Set(required)];
    if (!result.requiredChecks.length) result.blockers.push('No enforced required status checks found for the base branch');
    for (const context of result.requiredChecks) {
      if (!(pr.statusCheckRollup ?? []).some(check => (check.name ?? check.context) === context &&
          (check.__typename === 'StatusContext' ? check.state === 'SUCCESS' : check.status === 'COMPLETED' && check.conclusion === 'SUCCESS'))) {
        result.blockers.push(`Required check missing or unsuccessful: ${context}`);
      }
    }
    const conversationRule = classic?.required_conversation_resolution?.enabled || rules.some(rule => rule.type === 'pull_request' && rule.parameters?.required_review_thread_resolution === true);
    if (!conversationRule) result.blockers.push('Conversation-resolution requirement is not verified as enforced');
    const query = 'query($owner:String!,$name:String!,$number:Int!,$endCursor:String){repository(owner:$owner,name:$name){pullRequest(number:$number){reviewThreads(first:100,after:$endCursor){nodes{isResolved} pageInfo{hasNextPage endCursor}}}}}';
    const { stdout: threadsJson } = await exec('gh', ['api', 'graphql', '--paginate', '--slurp', '-f', `query=${query}`, '-f', 'owner=Alexanderjsinger', '-f', 'name=vinnys-restaurant', '-F', `number=${number}`], { maxBuffer: 8 * 1024 * 1024 });
    const pages = JSON.parse(threadsJson);
    if (!Array.isArray(pages) || !pages.length) throw new Error('Missing review threads');
    let unresolved = 0;
    for (const page of pages) {
      const nodes = page.data?.repository?.pullRequest?.reviewThreads?.nodes;
      if (page.errors || !Array.isArray(nodes)) throw new Error('Unverified review threads');
      unresolved += nodes.filter(thread => !thread.isResolved).length;
    }
    result.unresolvedConversations = unresolved;
    if (unresolved) result.blockers.push('Unresolved review conversations');
    const commit = await api(`repos/${repository}/commits/${pr.headRefOid}`);
    const comment = pr.comments.find(comment => comment.url === result.ownerCommentUrl);
    const committed = Date.parse(commit.commit?.committer?.date ?? '');
    const commented = Date.parse(comment?.createdAt ?? '');
    if (!Number.isFinite(committed) || !Number.isFinite(commented) || commented < committed) result.blockers.push('Owner review comment is not verified after the head commit');
    // Re-read head after all requests so a moving PR cannot reuse stale evidence.
    const current = await api(`repos/${repository}/pulls/${number}`);
    result.blockers.push(...assessFinalPolicySnapshot(pr, current, { commentCreatedAt: comment?.createdAt }));
    // A commit's declared date is not server-side proof of the latest push.
    // Do not accept user-supplied dates or self-authored local approval receipts.
    // A trusted branch-specific GitHub event is needed before this gate can pass.
    result.disposition = result.blockers.length ? 'NOT READY' : 'READY FOR OWNER MERGE DECISION';
    result.limits = 'Account identity does not prove a human posted the comment; merge/deploy authority is not granted by this script.';
    console.log(JSON.stringify(result, null, 2));
    process.exitCode = result.blockers.length ? 1 : 0;
  } catch {
    console.error('BLOCKED: could not read GitHub PR data. No review, merge or deployment action was performed.');
    process.exitCode = 2;
  }
}
