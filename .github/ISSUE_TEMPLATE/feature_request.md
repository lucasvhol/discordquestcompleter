name: Feature Request
description: Suggest an improvement to the Discord Quest Automation script
labels: ["enhancement"]

body:
  - type: markdown
    attributes:
      value: |
        Thanks for suggesting a feature! Please describe your idea clearly.

  - type: textarea
    id: feature_description
    attributes:
      label: Feature Description
      placeholder: Describe the feature you'd like to see
      description: What would you like to add or improve?
    validations:
      required: true

  - type: textarea
    id: use_case
    attributes:
      label: Use Case
      placeholder: Why would this feature be useful?
      description: Explain the motivation behind this request
    validations:
      required: true

  - type: textarea
    id: implementation
    attributes:
      label: Proposed Implementation
      placeholder: How could this be implemented?
      description: |
        Optional: Share any ideas on how this could be implemented
        (code examples, pseudo-code, etc.)

  - type: textarea
    id: alternatives
    attributes:
      label: Alternative Solutions
      placeholder: Are there any workarounds or alternatives?
      description: Have you considered other approaches?
