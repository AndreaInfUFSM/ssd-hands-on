# SDD Hands-on

Experiments with three Spec-Driven Development approaches applied to the same small web app idea: **Challenge of the Day**, a simple app for daily programming challenges.

The repository keeps the initial requirements, setup scripts, documentation notes, and generated files produced while trying different SDD workflows.

## Experiments

| Folder | Method | Goal |
|---|---|---|
| `examples/01-speckit` | Spec Kit | Generate the app through the Spec Kit workflow |
| `examples/02-openspec` | OpenSpec | Generate the app using OpenSpec with OpenCode |
| `examples/03-bmad-quick` | BMAD Quick | Generate the app using the quicker BMAD development flow |

The shared requirement file is in:

```text
examples/shared/requirements/challenge-of-the-day-app.md
```

## Repository structure

```text
.
├── devcontainer.json
├── scripts/
│   ├── check-env.sh
│   └── init-speckit-project.sh
└── examples/
    ├── 01-speckit/
    ├── 02-openspec/
    ├── 03-bmad-quick/
    ├── shared/requirements/
    ├── README-speckit.md
    ├── README-openspec.md
    └── README-bmad.md
```

## Running in Codespaces

This repository includes a development container configuration, so it can be opened directly in GitHub Codespaces.



## Checking the environment

Run:

```bash
./scripts/check-env.sh
```

The script checks the main tools used in the hands-on and prints installation hints when something is missing.

## Notes

This repository is exploratory. The goal is not to present a polished final app, but to compare how different SDD tools structure requirements, planning, generated artifacts, and implementation attempts.