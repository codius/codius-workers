"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  actions,
  getActionProps,
  isInputError,
  ActionError,
  ActionInputError,
} from "astro:actions"
import { useState } from "react"

type FieldErrors = ActionInputError<{
  branch: string
  repoUrl: string
  directory?: string | undefined
}>["fields"]

export function AppForm() {
  // TODO: useActionState
  const [error, setError] = useState<ActionError | null>(null)

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const { error } = await actions.deployApp.safe(formData)
    if (error) {
      if (isInputError(error)) {
        setFieldErrors(error.fields)
      } else {
        console.error(error)
        setError(error)
      }
    } else {
      window.location.reload()
    }
  }

  return (
    <form method="POST" onSubmit={onSubmit}>
      <Input {...getActionProps(actions.deployApp)} />
      <Label
        className={fieldErrors.repoUrl ? "text-destructive" : undefined}
        htmlFor="repoUrl"
      >
        GitHub Repository
      </Label>
      <Input
        name="repoUrl"
        type="text"
        id="repoUrl"
        required
        pattern="^https:\/\/github\.com\/[^\/]+\/[^\/]+$"
        title="URL must follow the format 'https://github.com/username/repository'"
      />
      <p className="text-sm text-muted-foreground">
        The GitHub repository containing the Cloudflare Worker you want to
        deploy
      </p>
      {fieldErrors.repoUrl && (
        <p className="text-sm font-medium text-destructive">
          {fieldErrors.repoUrl}
        </p>
      )}
      <Label
        htmlFor="branch"
        className={fieldErrors.branch ? "text-destructive" : undefined}
      >
        Branch
      </Label>
      <Input
        type="text"
        id="branch"
        name="branch"
        defaultValue="main"
        required
      />
      <p className="text-sm text-muted-foreground">
        The GitHub repository branch you want to deploy
      </p>
      {fieldErrors.branch && (
        <p className="text-sm font-medium text-destructive">
          {fieldErrors.branch}
        </p>
      )}
      <Label
        htmlFor="directory"
        className={fieldErrors.directory ? "text-destructive" : undefined}
      >
        Directory
      </Label>
      <Input type="text" id="directory" name="directory" />
      <p className="text-sm text-muted-foreground">
        The directory within the repository where the worker is located
        (optional)
      </p>
      {fieldErrors.directory && (
        <p className="text-sm font-medium text-destructive">
          {fieldErrors.directory}
        </p>
      )}
      <Button type="submit">Deploy App</Button>
      {error?.message && (
        <p className="text-sm font-medium text-destructive">{error.message}</p>
      )}
    </form>
  )
}
