import { execSync } from "node:child_process";
import {
  createGithubRelease,
  determineSemverChange,
  generateMarkDown,
  getGitDiff,
  loadChangelogConfig,
  parseChangelogMarkdown,
  parseCommits,
  type ResolvedChangelogConfig,
} from "changelogen";
import process from "node:process";
import denoJson from "./deno.json" with { type: "json" };
import { inc } from "semver";
import { readFile, writeFile } from "node:fs/promises";

const dryRun = Deno.args.includes("--dry-run");

const $ = (command: string) => execSync(command, { stdio: "inherit" });

$(`cd ../ui && deno task build`);
$(`deno check .`);

console.log();
const bumped = await bumpVersion();

console.log();
if (!dryRun) {
  console.log("Committing, pushing, creating release...");
  $(`git commit -am "chore(release): ${bumped.nextVersion}"`);
  $(`git tag "${bumped.nextTag}"`);
  $(`git push`);
  $(`git push --tags`);
  await createGithubRelease(bumped.config, {
    tag_name: bumped.nextTag,
    body: bumped.changelog,
    name: bumped.nextTag,
  });
} else {
  console.log("[DRY RUN] Skipped committing, pushing, and creating release");
}

console.log();
if (!dryRun) {
  console.log("Publishing...");
  $(`deno publish`);
} else {
  console.log("[DRY RUN] Skipped publishing to JSR");
}

////////////////////////////////////////

async function bumpVersion() {
  console.log("Bumping version and generating changelog...");

  // deno-lint-ignore no-explicit-any
  const currentVersion: string = (denoJson as any).version;
  const currentTag = `v${currentVersion}`;
  const output = "../CHANGELOG.md";
  const config: ResolvedChangelogConfig = await loadChangelogConfig(
    process.cwd(),
    {
      from: `v${currentVersion}`,
      repo: {
        domain: "github.com",
        provider: "github",
        repo: "aklinker1/job-queue",
      },
      output,
    },
  );
  console.log(`Comparing ${config.from}..${config.to}`);
  const commits = parseCommits(
    await getGitDiff(config.from, config.to),
    config,
  );
  let semverChange = determineSemverChange(commits, config);
  if (currentVersion.startsWith("0.")) {
    if (semverChange === "major") semverChange = "minor";
    else if (semverChange === "minor") semverChange = "patch";
  }
  console.log("Semver change:", semverChange);
  const nextVersion = inc(currentVersion, semverChange);
  const nextTag = `v${nextVersion}`;
  console.log("Next version:", nextVersion);
  if (!dryRun) {
    console.log("Updating deno.json...");
    const denoJsonStr = await readFile("deno.json", "utf8");
    await writeFile(
      "deno.json",
      denoJsonStr.replace(
        `"version": "${currentVersion}"`,
        `"version": "${nextVersion}"`,
      ),
    );
  } else {
    console.log("[DRY RUN] Skipped bumping version in deno.json");
  }

  config.to = nextTag;

  console.log("Generating changelog...");
  const changelog = (await generateMarkDown(commits, config))
    // Remove extra header
    .replace(`## ${config.from}...${config.to}\n\n`, "");

  console.log("Changelog:");
  console.log("┌" + "─".repeat(39));
  console.log("│ " + changelog.replaceAll("\n", "\n│ "));
  console.log("└" + "─".repeat(39));

  const { releases: prevReleases } = await readFile(output, "utf8")
    .then(parseChangelogMarkdown)
    .catch(() => ({ releases: [] }));
  const allReleases = [
    {
      version: nextVersion,
      body: changelog,
    },
    ...prevReleases,
  ];
  const fullChangelog = "# Changelog\n\n" +
    allReleases
      .flatMap((release) => [`## v${release.version}`, release.body])
      .join("\n\n");

  if (!dryRun) {
    console.log("Updating CHANGELOG.md...");
    await writeFile(output, fullChangelog);
  } else {
    console.log("[DRY RUN] Skipped writing CHANGELOG.md");
  }

  console.log("Done bumping version");

  return {
    currentTag,
    currentVersion,
    nextVersion,
    nextTag,
    changelog,
    fullChangelog,
    config,
  };
}
