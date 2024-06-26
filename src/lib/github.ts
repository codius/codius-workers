import { Octokit } from "octokit"

export type CommitOptions = {
  owner: string
  repo: string
  branch: string
}
export const getCommit = async ({ owner, repo, branch }: CommitOptions) => {
  const octokit = new Octokit()
  const { data } = await octokit.rest.repos.getBranch({
    owner,
    repo,
    branch,
  })
  return data.commit
}

export type WorkflowOptions = {
  appId: string
  owner: string
  repo: string
  commitHash: string
  directory?: string
}

export const triggerWorkflow = async (
  auth: string,
  { appId, owner, repo, commitHash, directory }: WorkflowOptions,
) => {
  // https://docs.github.com/en/rest/actions/workflows?apiVersion=2022-11-28#create-a-workflow-dispatch-event
  const octokit = new Octokit({
    auth,
  })
  await octokit.rest.actions.createWorkflowDispatch({
    workflow_id: "deploy-worker.yml",
    owner: "codius",
    repo: "codius-astro",
    // TODO: main
    ref: "github-action",
    inputs: {
      appId,
      repo: `${owner}/${repo}`,
      commit: commitHash,
      directory,
    },
  })
}