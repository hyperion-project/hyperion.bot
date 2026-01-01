# Testing the GitHub Actions Bot

## Overview

The GitHub Actions bot can be tested in several ways:

## 1. Manual Testing in a Test Repository

The best way to test the bot is to deploy it to a test repository:

1. Copy `.github/workflows/bot.yml` to your test repository
2. Create configuration files:
   - `.github/pr_comment.yml` (use `.github/pr_comment.yml.example` as a template)
   - `.github/issues.yml` (use `.github/issues.yml.example` as a template)

3. Test each scenario:

### Test Pull Request Comments

1. Open a new pull request
   - Expected: Bot should post a comment using the `PullRequest.opened` template
2. Push a new commit to the pull request
   - Expected: Bot should post a comment using the `PullRequest.synchronize` template

### Test Issue Template Enforcement

1. Create an issue without the template marker
   - Expected: Issue should be closed and commented with the `Issues.opened` message
2. Create an issue with the marker `<!-- Please don't delete this template or we'll close your issue -->`
   - Expected: Issue should remain open, no bot action

### Test Workflow Trigger

1. As a user with write/admin permissions, comment on any issue or PR:
   ```
   @Hyperion-Bot build APT @ master
   ```
   - Expected: Bot should add a rocket reaction and trigger the `apt.yml` workflow

2. As a user without write permissions, try the same command
   - Expected: No reaction, no workflow triggered

3. Test with a specific SHA:
   ```
   @Hyperion-Bot build APT @ abc123def456
   ```
   - Expected: Workflow triggered with the specified SHA

## 2. Local Syntax Validation

You can validate the YAML syntax locally:

```bash
# Install yamllint if not already installed
pip install yamllint

# Validate the workflow file
yamllint .github/workflows/bot.yml

# Validate configuration examples
yamllint .github/pr_comment.yml.example
yamllint .github/issues.yml.example
```

## 3. GitHub Actions Validation

GitHub will automatically validate the workflow syntax when you push it. Check the "Actions" tab for any workflow errors.

## 4. Debugging

If the workflow is not working as expected:

1. Check the workflow run logs in the Actions tab
2. Look for console.log output in the "Run bot" step
3. Verify that configuration files exist in `.github/` directory
4. Ensure the bot has the required permissions

## Common Issues

### Bot doesn't comment on PRs
- Check that `.github/pr_comment.yml` exists and is valid YAML
- Verify the `PullRequest.opened` or `PullRequest.synchronize` sections exist
- Check workflow run logs for errors

### Bot doesn't close invalid issues
- Check that `.github/issues.yml` exists and is valid YAML
- Verify the `Issues.opened` section exists
- Ensure the issue template includes the required HTML comment marker

### Workflow dispatch doesn't trigger
- Verify the user has write or admin permissions
- Check that `apt.yml` workflow exists in the repository
- Ensure the comment format is correct: `@Hyperion-Bot build APT @ <ref>`
- Check for GitHub App authentication if using APP_ID/PRIVATE_KEY

## Template Variables Testing

Test that template variables are replaced correctly:

- `$AUTHOR` should be replaced with the username
- `$REPO_FULL_NAME` should be replaced with `owner/repo`
- `$RUN_ID` should be replaced with a workflow run ID (for PR comments)

## Security Considerations

When testing the workflow trigger feature:
- Verify that only users with write/admin permissions can trigger workflows
- Test that the bot properly validates user permissions before triggering
- Ensure non-User accounts (bots) cannot trigger workflows
