---
name: skill_generator
description: A meta-skill that helps create new skills for the agent. Use this when you want to automate a complex task or create a specialized instruction set.
---

# Skill Generator

This skill is designed to help you create new skills. A skill is a set of instructions, scripts, and resources that extend the agent's capabilities for specialized tasks.

## 1. Define the Skill

First, you need to define the following properties for your new skill:

-   **Name**: A short, descriptive name (e.g., `git_commit_standard`, `deploy_vercel`, `code_review_checklist`). Use underscores for spaces.
-   **Description**: A brief summary of what the skill does. This is used by the agent to decide when to use it.
-   **Instructions**: The detailed step-by-step guide or rules the agent must follow when executing this skill.

## 2. Create the Structure

The standard structure for a skill is:

```
.agent/skills/<skill_name>/
├── SKILL.md          (Required: Main instruction file with YAML frontmatter)
├── scripts/          (Optional: Helper scripts)
├── examples/         (Optional: Reference implementations)
└── resources/        (Optional: Additional assets)
```

## 3. Generate the SKILL.md

Create the `SKILL.md` file inside the skill folder. It **MUST** start with YAML frontmatter:

```markdown
---
name: <skill_name>
description: <skill_description>
---

# <Skill Title>

<Detailed instructions here...>
```

## 4. Usage Example

To create a new skill called `example_skill`:

1.  **Create Directory**: `mkdir -p .agent/skills/example_skill`
2.  **Create File**: `touch .agent/skills/example_skill/SKILL.md`
3.  **Add Content**: Write the YAML frontmatter and instructions into `SKILL.md`.

## 5. Automation Prompts

When using this `skill_generator` skill, you can ask the agent to:

> "Create a new skill called 'database_migration' that explains how to run Prisma migrations safely in production."

The agent will then:
1.  Create the folder `.agent/skills/database_migration`.
2.  Write a `SKILL.md` file with the best practices for Prisma migrations tailored to your project.
