const CONFIG_NAME = "issues.yml";

const replaceTemplateVariables = async function(context, message) {
  let output = message;
  output = output.replace(
    /\$AUTHOR/g,
    context.payload.issue.user.login
  );
  output = output.replace(
    /\$REPO_FULL_NAME/g,
    context.payload.repository.full_name
  );

  return output;
};

export default async function issue(context) {
  const config = (await context.config(CONFIG_NAME)) || {};
  if (!config.Issues) {
    return;
  }

  const action = context.payload.action;
  const body = context.payload.issue.body;
  if (action === "opened" && !body.includes("<!-- Please don't delete this template or we'll close your issue -->")) {
    if (!config.Issues.opened) {
      return;
    }

    await context.octokit.issues.update(
      context.issue({
        state: 'closed'
    }))
    
    return context.octokit.issues.createComment(
      context.issue({
       body: await replaceTemplateVariables(context, config.Issues.opened)
      })
    );

  }

  return;
};
