name: Bug Report
description: Report a bug in the Discord Quest Automation script
labels: ["bug"]

body:
  - type: markdown
    attributes:
      value: |
        Thanks for reporting a bug! Please provide as much detail as possible.

  - type: input
    id: discord_client
    attributes:
      label: Discord Client
      placeholder: "e.g., Web, Desktop, Mobile"
      description: Which Discord client are you using?
    validations:
      required: true

  - type: textarea
    id: issue_description
    attributes:
      label: Issue Description
      placeholder: Describe what went wrong
      description: A clear description of the bug
    validations:
      required: true

  - type: textarea
    id: steps_to_reproduce
    attributes:
      label: Steps to Reproduce
      placeholder: |
        1. Open DevTools
        2. Paste script
        3. Run main()
        4. ...
      description: Steps to reproduce the behavior
    validations:
      required: true

  - type: textarea
    id: error_message
    attributes:
      label: Error Message
      placeholder: Paste any console errors here
      description: Include the exact error from the browser console
      render: javascript

  - type: textarea
    id: expected_behavior
    attributes:
      label: Expected Behavior
      placeholder: What should happen instead?
    validations:
      required: true

  - type: textarea
    id: additional_info
    attributes:
      label: Additional Information
      placeholder: Any other relevant information
