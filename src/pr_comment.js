const CONFIG_NAME = 'pr_comment.yml'

// Non-blocking sleep function
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const replaceTemplateVariables = async function (context, message) {
  let output = message
  output = output.replace(/\$AUTHOR/g, context.payload.pull_request.user.login)
  output = output.replace(
    /\$REPO_FULL_NAME/g,
    context.payload.repository.full_name
  )
  output = output.replace(/\$RUN_ID/g, await getRunID(context))

  return output
}

const getRunID = async function (context) {
  const [owner, repo] = context.payload.repository.full_name.split('/')
  const headSha = context.payload.pull_request.head.sha

  // Retry up to 5 times with 5 second waits between attempts
  const maxAttempts = 5
  const waitTimeMs = 5000

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // Wait before querying to give GitHub time to register the workflow run
    await sleep(waitTimeMs)

    const response = await context.octokit.request(
      'GET /repos/{owner}/{repo}/actions/runs',
      {
        owner,
        repo,
        head_sha: headSha,
        per_page: 10
      }
    )

    const workflowRuns = response.data.workflow_runs

    const validRun = workflowRuns.find(run => !run.name.includes('CodeQL'))

    if (validRun) {
      return validRun.id
    }
  }

  // Return undefined if no valid run found after all attempts
  return undefined
}

export default async function pr_comment (context) {
  const config = (await context.config(CONFIG_NAME)) || {}
  if (!config.PullRequest) {
    return
  }

  const action = context.payload.action
  if (action === 'opened') {
    if (!config.PullRequest.opened) {
      return
    }

    const params = context.issue({ body: await replaceTemplateVariables(context, config.PullRequest.opened) })
    return context.octokit.rest.issues.createComment(params)
  } else if (action === 'synchronize') {
    if (!config.PullRequest.synchronize) {
      return
    }

    const params = context.issue({ body: await replaceTemplateVariables(context, config.PullRequest.synchronize) })
    return context.octokit.rest.issues.createComment(params)
  }
};
