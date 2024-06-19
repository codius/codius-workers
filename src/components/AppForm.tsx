"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { actions, getActionProps, isInputError } from "astro:actions"
import { useState } from "react"

export function AppForm() {
  const [fieldErrors, setFieldErrors] = useState({
    repoUrl: null,
    branch: null,
    directory: null,
  })

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    console.log(formData)
    const { data, error } = await actions.deployApp.safe(formData)
    if (error) {
      if (isInputError(error)) {
        setFieldErrors(error.fields)
      } else {
        console.error(error)
      }
    } else {
      console.log(data)
    }
  }

  return (
    <form method="POST" onSubmit={onSubmit}>
      <Input {...getActionProps(actions.deployApp)} />
      <Label
        className={fieldErrors.repoUrl && "text-destructive"}
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
        className={fieldErrors.branch && "text-destructive"}
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
      <Button type="submit">Deploy App</Button>
    </form>
  )
}
