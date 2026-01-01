Issue and PR comment bot for Hyperion-Project
=========================

A GitHub Actions-based bot that automates commenting on pull requests and issues, and triggers workflows via issue comments.

## Migration from Probot/Glitch.com

This bot has been migrated from a Probot application hosted on Glitch.com to a native GitHub Actions workflow. The bot now runs directly within GitHub's infrastructure.

## Features

### 1. Pull Request Comments
Automatically posts comments when:
- A pull request is opened
- A pull request is synchronized (updated)

### 2. Issue Template Enforcement
Automatically:
- Checks if new issues contain the required template marker
- Closes issues that don't use the template
- Posts an informative comment to guide users

### 3. Workflow Triggering
Allows authorized users (with write or admin permissions) to trigger workflows via issue comments:
- Comment format: `@Hyperion-Bot build APT @ <sha-or-ref>`
- Triggers the `apt.yml` workflow
- Adds a rocket reaction to the triggering comment

## Setup

### 1. Copy the Workflow File

Copy the workflow file from this repository to your target repository:
```bash
cp .github/workflows/bot.yml <your-repo>/.github/workflows/bot.yml
```

### 2. Configure Bot Behavior

Create configuration files in your repository's `.github/` directory:

#### PR Comments Configuration (`.github/pr_comment.yml`)
```yaml
PullRequest:
  opened: |
    Thank you @$AUTHOR for opening this pull request!
    
    Your PR will be reviewed soon. Check status: https://github.com/$REPO_FULL_NAME/actions/runs/$RUN_ID
  
  synchronize: |
    Thank you @$AUTHOR for updating this pull request!
    
    The automated checks will run again: https://github.com/$REPO_FULL_NAME/actions/runs/$RUN_ID
```

#### Issues Configuration (`.github/issues.yml`)
```yaml
Issues:
  opened: |
    Hello @$AUTHOR,
    
    Thank you for opening this issue. However, it appears that you did not use the issue template.
    
    Please create a new issue using the proper template.
```

### 3. Set Up Permissions

The workflow requires the following permissions (already configured in the workflow file):
- `contents: read`
- `issues: write`
- `pull-requests: write`

### 4. Optional: GitHub App Authentication

For the workflow dispatch feature (APT build trigger), you can optionally configure GitHub App authentication:

1. Create a GitHub App with appropriate permissions
2. Add the following secrets to your repository:
   - `APP_ID`: Your GitHub App ID
   - `PRIVATE_KEY`: Your GitHub App private key

If these are not provided, the workflow will use the default `GITHUB_TOKEN`.

## Template Variables

The bot supports the following template variables in configuration files:

- `$AUTHOR`: The username of the person who opened the PR/issue
- `$REPO_FULL_NAME`: The full name of the repository (e.g., `owner/repo`)
- `$RUN_ID`: The ID of the latest workflow run (PR comments only)

## Required Issue Template Marker

For issue template enforcement to work, your issue templates must include the following HTML comment:
```html
<!-- Please don't delete this template or we'll close your issue -->
```

Issues without this marker will be automatically closed with a comment.

## Usage Examples

### Triggering APT Build

Users with write or admin permissions can trigger the APT build workflow by commenting on any issue or pull request:

```
@Hyperion-Bot build APT @ master
```

or with a specific commit SHA:

```
@Hyperion-Bot build APT @ abc123def456
```

The bot will:
1. Verify the user has write or admin permissions
2. Extract the SHA/ref from the comment (defaults to the default branch if not specified)
3. Trigger the `apt.yml` workflow with the specified ref
4. Add a 🚀 reaction to the comment

## Migration Notes

### Changes from Probot Implementation

1. **No External Hosting**: The bot now runs as a GitHub Action, eliminating the need for external hosting on Glitch.com or similar platforms.

2. **Simplified Authentication**: Uses GitHub's built-in `GITHUB_TOKEN` by default, with optional GitHub App authentication for advanced scenarios.

3. **Direct Event Handling**: Responds directly to GitHub webhook events through GitHub Actions.

4. **Configuration Compatibility**: Configuration files (`pr_comment.yml` and `issues.yml`) remain compatible with the original format.

### Benefits

- ✅ No external infrastructure required
- ✅ Runs natively within GitHub
- ✅ Uses GitHub's built-in authentication
- ✅ Free for public repositories
- ✅ Easy to maintain and debug
- ✅ Version controlled with your code

## Development

The original Probot implementation is preserved in the repository for reference:
- `index.js`: Original Probot entry point
- `src/pr_comment.js`: PR comment handler
- `src/issues.js`: Issue handler
- `src/trigger.js`: Workflow trigger handler

## License

MIT