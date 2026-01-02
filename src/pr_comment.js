import sleep from "system-sleep";

const CONFIG_NAME = "pr_comment.yml";

const replaceTemplateVariables = async function(context, message) {
  let output = message;
  output = output.replace(/\$AUTHOR/g, context.payload.pull_request.user.login);
  output = output.replace(
    /\$REPO_FULL_NAME/g,
    context.payload.repository.full_name
  );
  output = output.replace(/\$RUN_ID/g, await getRunID(context));

  return output;
};

const getRunID = async function(context) {
  const [owner, repo] = context.payload.repository.full_name.split('/');
  const branch = context.payload.pull_request.head.ref;

  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    const response = await context.octokit.request(
      "GET /repos/{owner}/{repo}/actions/runs",
      {
        owner,
        repo,
        branch: branch,
        per_page: 10
      }
    );

    const workflow_runs = response.data.workflow_runs;

    // Finde den ersten Run, der NICHT CodeQL ist
    const validRun = workflow_runs.find(run => !run.name.includes('CodeQL'));

    if (validRun) {
      return validRun.id;
    }

    attempts++;
    if (attempts < maxAttempts) {
      await sleep(2000);
    }
  }
};

export default async function pr_comment(context) {
  const config = (await context.config(CONFIG_NAME)) || {};
  if (!config.PullRequest) {
    return;
  }

  const action = context.payload.action;
  if (action === "opened") {
    if (!config.PullRequest.opened) {
      return;
    }

    const params = context.issue({ body: await replaceTemplateVariables(context, config.PullRequest.opened) });
    return context.octokit.rest.issues.createComment(params);
  } else if (action === "synchronize") {
    if (!config.PullRequest.synchronize) {
      return;
    }

    const params = context.issue({ body: await replaceTemplateVariables(context, config.PullRequest.synchronize) });
    return context.octokit.rest.issues.createComment(params);
  }

  return;
};
