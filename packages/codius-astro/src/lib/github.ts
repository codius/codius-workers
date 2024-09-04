import { Octokit } from "@octokit/rest"

export type CommitOptions = {
  owner: string
  repo: string
  ref: string
}
export const getCommit = async ({ owner, repo, ref }: CommitOptions) => {
  const octokit = new Octokit()
  const { data } = await octokit.rest.repos.getCommit({
    owner,
    repo,
    ref,
  })
  return data
}

export const getDefaultBranch = async ({
  owner,
  repo,
}: {
  owner: string
  repo: string
}) => {
  const octokit = new Octokit()
  const { data } = await octokit.rest.repos.get({
    owner,
    repo,
  })
  return data.default_branch
}

export type WorkflowOptions = {
  appId: string
  owner: string
  repo: string
  commitHash: string
  gitRef: string
  directory?: string
  dispatchNamespace: string
}

export const triggerWorkflow = async (
  auth: string,
  {
    appId,
    owner,
    repo,
    commitHash,
    gitRef,
    directory,
    dispatchNamespace,
  }: WorkflowOptions,
) => {
  // https://docs.github.com/en/rest/actions/workflows?apiVersion=2022-11-28#create-a-workflow-dispatch-event
  const octokit = new Octokit({
    auth,
  })
  await octokit.rest.actions.createWorkflowDispatch({
    workflow_id: "deploy-worker.yml",
    owner: "codius",
    repo: "codius-astro",
    ref: "main",
    inputs: {
      appId,
      repo: `${owner}/${repo}`,
      commit: commitHash,
      ref: gitRef,
      directory,
      dispatchNamespace,
    },
  })
}
