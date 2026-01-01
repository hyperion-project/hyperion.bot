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
  // wait 8 seconds before we request the workflows from GitHub
  //sleep(8000);

  const [owner, repo] = context.payload.repository.full_name.split('/');
  const workflow_runs = (await context.octokit.request("Get /repos/{owner}/{repo}/actions/runs", {
    owner,
    repo,
  })).data.workflow_runs;

  return workflow_runs[0].id;
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
    return context.octokit.issues.createComment(params);
  } else if (action === "synchronize") {
    if (!config.PullRequest.synchronize) {
      return;
    }

    const params = context.issue({ body: await replaceTemplateVariables(context, config.PullRequest.synchronize) });
    return context.octokit.issues.createComment(params);
  }

  return;
};
