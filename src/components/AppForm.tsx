"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { actions, getActionProps, isInputError } from "astro:actions"
import { useState } from "react"

export function AppForm() {
  const [fieldErrors, setFieldErrors] = useState({
    repo: null,
    branch: null,
    directory: null,
  })

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    console.log(formData)
    const { data, error } = await actions.app.safe(formData)
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
      <Input {...getActionProps(actions.app)} />
      <Label className={fieldErrors.repo && "text-destructive"} htmlFor="repo">
        GitHub Repository
      </Label>
      <Input
        name="repo"
        type="text"
        id="repo"
        required
        pattern="^https:\/\/github\.com\/[^\/]+\/[^\/]+$"
        title="URL must follow the format 'https://github.com/username/repository'"
      />
      <p className="text-sm text-muted-foreground">
        The GitHub repository containing the Cloudflare Worker you want to
        deploy
      </p>
      {fieldErrors.repo && (
        <p className="text-sm font-medium text-destructive">
          {fieldErrors.repo}
        </p>
      )}
      <Label
        htmlFor="repo"
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
