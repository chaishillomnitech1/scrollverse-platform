# GitHub Fleet Workflow Recovery Triage — 2026-11-16

**Purpose:** Surface dormant, cancelled, failing, noisy, risky, or overlooked GitHub repositories and Actions workflows before attempting reactivation.

**Scope:** Complete accessible repository metadata inventory (100 repositories; first page returned 100, offsets 100 and 200 returned zero). Detailed workflow-file and recent-run triage performed for 12 priority repositories. This is an initial risk-based tranche, not a claim that all 100 repositories' workflow histories have been exhaustively inspected.

**Safety:** No workflow was enabled, dispatched, rerun, cancelled, merged, deployed, or modified as part of this audit. No production, financial, advertising, DAO, NFT, or content actions were triggered.

## Executive findings

1. The fleet has material CI failure/cancellation concentrations and several workflows whose automatic execution can spend money, mutate content, write repositories, deploy production, or interact with DAO/NFT infrastructure.
2. Some apparent cancellation clusters are consistent with superseded commits during rapid PR updates; cancelled is not automatically a defect and should not be blindly rerun.
3. At least one repository is a scheduled-workflow dormancy candidate: `Expansion-` has no returned workflow run newer than 2026-08-29 and its last repository push is 2026-07-02. Its latest 100 returned runs were successful. GitHub documents that scheduled workflows in public repositories can be automatically disabled after 60 days without repository activity. The workflow enabled/disabled state was not available from the current connector, so auto-disable is a hypothesis to verify, not a confirmed state.
4. `VinelandEternal` has no returned Actions run newer than 2026-06-28 even though the repository reports a push on 2026-11-15. This is a significant schedule/trigger/actor/state discrepancy. The exact reason is not established.
5. `scrollsoul-music-sync` contains an hourly workflow that includes paid Google Ads promotion and automatic content archiving. It must not be reactivated until those side effects are removed or explicitly authorized and guarded.
6. `cosmic-constitution-scrollverse` has a scheduled DAO automation workflow that connects to contract/RPC secrets and processes governance events. Do not dispatch it as a generic health check.
7. `Chaishillomnitech1` has a very large workflow surface and 38,458 reported run records; 87 of the latest 100 returned runs failed. One observed production deployment job failed while downloading build artifacts.
8. `scrollverse_commerce` and `OmniBuilderZero` show high failure counts in their latest 100-run windows. Their build/test paths have some passing evidence, but provider-dependent deployments and auxiliary workflows remain blocked or failing.

## Repository inventory and detailed run sample

Counts below are for the latest 100 runs returned by GitHub, unless fewer than 100 runs existed. They are not lifetime pass rates.

| Repository | Workflow files in default-branch directory | Total runs reported | Latest returned window | Key signal |
|---|---:|---:|---|---|
| `scrollverse-platform` | 1 | 31 | 18 success / 9 failure / 4 cancelled | Latest main run passed; failures are concentrated in older feature branches and earlier revisions. |
| `scrollverse-ai-legion` | 1 | 80 | 20 success / 9 failure / 51 cancelled | Cancellation storm on AURELLION feature branch during rapid successive updates; latest successful PR evidence exists. |
| `scrollverse_commerce` | 9 | 475 | 24 success / 76 failure | Recent main CI and deployment jobs failed; prior PR evidence shows formatter and Vercel provider blockers. |
| `OmniBuilderZero` | 25 | 728 | 30 success / 70 failure | CI, E2E and docs checks passed on recent PR revisions; Vercel deployment failed; many auxiliary workflow failures require individual classification. |
| `Chaishillomnitech1` | 70+ | 38,458 | 12 success / 87 failure / 1 cancelled | Large workflow surface; latest sampled production deployment failed at artifact download. |
| `Expansion-` | 50 | 8,890 | 100 success | Latest returned run is 2026-08-29; last repository push 2026-07-02; scheduled dormancy candidate. |
| `scrollsoul-music-sync` | 15 | 7,442 | 2 success / 98 failure | Hourly content-performance workflow repeatedly fails at video-performance retrieval; dangerous paid-promotion/archive steps are present. |
| `scrollverse-web-app` | 4 | 174 | 53 success / 24 failure / 23 cancelled | Sovereign invariant audit fails at application type-check; cancelled runs are on a clearance PR branch. |
| `omnitech1-portal` | 25 | 265 | 19 success / 77 failure / 4 cancelled | Fortify AST scan is a recurring failure; vendor/credential cause not yet confirmed. |
| `nextjs-commerce` | 6 | 416 | 8 success / 92 failure | Scheduled repository-sync fails at checkout; workflow has repository write permissions and PAT dependency, while sync logic is still a placeholder. |
| `cosmic-constitution-scrollverse` | 12 | 4,306 | 31 success / 69 failure | DAO Automation fails during dependency/Python setup; workflow can call DAO/RPC processing and write issues/PRs. |
| `VinelandEternal` | 4 | 729 | 0 success / 100 failure | Latest returned run is 2026-06-28; Deploy Agape and Omni-Pulse fail during Python setup. |

## High-priority findings and recommended disposition

### A. Dormant/schedule recovery candidates

**`Expansion-`**
- Repository `pushed_at`: 2026-07-02T15:14:37Z.
- Latest returned Actions run: 2026-08-29T06:15:12Z.
- Latest 100 returned runs: 100 successes.
- Contains many scheduled/manual workflows, including infrastructure, activation, NFT-minting and quantum/DAO-related workflows.
- **Disposition:** Inspect workflow enabled states, default-branch activity, schedule actor, and exact side effects. Reactivate only read-only diagnostics first. Do not enable the full workflow set.

**`VinelandEternal`**
- Repository `pushed_at`: 2026-11-15T01:20:27Z; `updated_at`: 2026-04-28T21:42:19Z.
- Latest returned Actions run: 2026-06-28.
- Deploy Agape failed at `Set up Python`; dependent tests and deploy job were skipped. Omni-Pulse failed at `Set up Python`.
- The Omni-Pulse workflow has `contents: write` and commits generated chronicles to the repository.
- **Disposition:** Compare main-branch commit history with the recently pushed branch, check workflow enablement and schedule actor, repair Python setup in an isolated PR, then test a read-only job before reactivating the chronicle writer or deploy pipeline.

### B. Unsafe to bulk-reactivate

**`scrollsoul-music-sync` — paid ads and content mutation**
- Hourly `monitor-content.yml` uses `YOUTUBE_API_KEY` and `GOOGLE_ADS_API_KEY`.
- Workflow contains a paid-promotion step and an archive-low-performers step.
- Its current analysis step sets `underperforming_count=3` as a literal placeholder, which can satisfy the paid-promotion condition.
- **Disposition:** Keep paused pending a review PR that separates read-only analytics from any spend or content visibility changes. Do not rerun the current workflow as a diagnostic.

**`cosmic-constitution-scrollverse` — DAO/RPC operations**
- Scheduled `dao-automation.yml` reads `ETH_RPC_URL`, `DAO_CONTRACT_ADDRESS`, and `ZKEVM_RPC_URL`.
- Runs DAO synchronization, governance event processing, zkEVM integration and metrics.
- Workflow permissions include issue and pull-request writes.
- **Disposition:** Read-only preflight and dependency repair first. No dispatch until RPC targets, contract addresses, operation modes, and whether any transaction or governance mutation can occur are explicitly verified.

**`Chaishillomnitech1` — production/cloud deployment fan-out**
- Large workflow directory includes multiple cloud deployment and CI templates.
- A recent `CI - Install, Test, Build, Deploy` run passed install, tests, code quality and build, but its `Deploy to Production` job failed at `Download Build Artifacts`.
- Separate workflows include deployment targets such as ECS, IKS/OpenShift, Pages and Vercel.
- **Disposition:** First consolidate duplicate validation and artifact contracts. Treat each production/cloud deploy as a separate protected release path; do not rerun or dispatch the deployment family in bulk.

**`nextjs-commerce` — write-capable repository sync**
- Scheduled `repo-sync.yml` has `contents: write`, `pull-requests: write`, and a `GITHUB_PAT` checkout.
- Current sync logic is explicitly a placeholder and sets `has_updates=false`.
- Latest sampled scheduled sync failed at checkout.
- **Disposition:** Do not provide or rotate a PAT merely to make a placeholder green. Either implement a bounded read-only upstream check or disable/remove the unused write-capable workflow after review.

### C. Repairable CI/security candidates

**`scrollverse-platform`**
- Current main run on 2026-11-16 passed.
- Four cancellations in the 31-run history appear associated with superseded feature-branch revisions; nine older failures need grouped root-cause review.
- **Disposition:** Keep current main CI active; classify historical failures by commit and branch rather than rerunning stale runs.

**`scrollverse-ai-legion`**
- 51 of 80 recent runs cancelled, many clustered on one feature branch during rapid updates.
- Nine failed runs are on the same AURELLION feature branch family.
- **Disposition:** Check concurrency/cancel-in-progress configuration and the latest head SHA. Do not rerun obsolete commit attempts.

**`scrollverse_commerce`**
- Latest sampled main CI failed at formatting; the previously inspected failure identified `components/scrollverse-home.tsx` and `docs/SCROLLVERSE_DIRECT_CUSTOMER_MIRROR.md`.
- Recent Vercel deployment jobs also failed. Root cause for the newest main run is not established by the available step summary.
- **Disposition:** Repair formatting separately; diagnose provider account/deployment status before any deployment retry. Preserve production deploy gates.

**`OmniBuilderZero`**
- Recent PR CI, E2E and documentation checks passed on the reusable compile/test workflow branch.
- Vercel deployment failed at environment-information retrieval. Multiple auxiliary workflow files generated failed push runs during the same branch update window.
- **Disposition:** Preserve passing validation evidence; classify each auxiliary workflow by purpose, secrets, permissions and side effects. Do not rerun all push-triggered workflows.

**`scrollverse-web-app`**
- Sovereign System Invariant Audit failed at `pnpm check` / TypeScript check on latest sampled main run.
- Workflow itself is read-only: type-check, invariant tests, registry tests and production build.
- **Disposition:** This is a strong candidate for a safe diagnostic rerun after the type-check failure is fixed.

**`omnitech1-portal`**
- Fortify AST Scan is the most recent recurring failure.
- The workflow is a vendor security scan; the exact credential/license/network cause has not been verified.
- **Disposition:** Verify Fortify integration prerequisites and action version before retrying. Do not treat a missing vendor integration as a code failure.

## Recovery classification model

Every workflow must be assigned one of these classes before action:

1. **Read-only validation:** lint, type-check, unit tests, build, schema validation, deterministic invariant checks. Eligible for controlled rerun after confirming the exact SHA and cause.
2. **Read-only external diagnostics:** provider health, analytics fetch, security scan. Verify credentials, quotas, costs and rate limits first.
3. **Repository mutation:** auto-commit, sync, issue/PR creation, labels, releases. Require explicit branch scope, permissions and rollback.
4. **Deployment/release:** Pages, Vercel, cloud infrastructure, staging or production. Verify target, environment, artifacts and approval gates; production requires separate authorization.
5. **Financial/on-chain/paid promotion/content mutation:** NFT minting, DAO/governance transactions, token distribution, paid ads, unlisting/archiving content. Never bulk-dispatch; require specific operation-level review and approval.

## Next execution order

1. Complete workflow-state and default-branch activity checks for all repositories with workflow files; distinguish `active`, `disabled_manually`, schedule-suspended, no recent runs, and no workflow file.
2. Paginate run history for the highest-risk repositories and group failures by workflow, branch, commit SHA, actor, and cause.
3. Separate superseded cancellations from genuine stuck/cancelled runs.
4. Repair read-only checks first in isolated branches and capture CI evidence.
5. Verify schedule actors and re-enable only selected low-risk scheduled diagnostics after review.
6. Build a workflow recovery ledger with owner, purpose, trigger, permissions, secrets, external effects, last successful run, last failure, state, cost/usage and rollback.
7. Keep production deploy, financial, DAO/NFT, paid-ad and content-mutating workflows protected pending explicit authorization.

## Evidence and limitations

- Repository listing: 100 returned at offset 0; 0 at offsets 100 and 200.
- Detailed workflow/run samples were fetched from the GitHub repository tree and Actions runs APIs for the 12 repositories above. Several run endpoints returned a maximum of 100 recent records; `total_count` is shown separately.
- GitHub job summaries identified failing steps. Attempts to retrieve some historical job logs returned HTTP 410, so root causes are not invented where logs were unavailable.
- The current connector exposed workflow files and run histories but not the workflow enabled/disabled state endpoint. Therefore no workflow is labeled confirmed disabled or confirmed active unless independently evidenced by an actual run.
- Repository `pushed_at` is not necessarily the last default-branch activity; branch/default-branch reconciliation remains required.
- No workflow state changes, reruns, deployments, commits to protected branches, secrets, DNS, paid operations, or on-chain operations were performed.

## Official GitHub behavior reference

GitHub documents that scheduled workflows in public repositories can be automatically disabled after 60 days without repository activity, that disabled workflows cannot be rerun, and that scheduled workflows may stop if their associated actor is suspended/deleted/deprovisioned:
- https://docs.github.com/en/actions/how-tos/manage-workflow-runs/disable-and-enable-workflows
- https://docs.github.com/en/actions/how-tos/troubleshoot-workflows
- https://docs.github.com/en/actions/how-tos/manage-workflow-runs/re-run-workflows-and-jobs
