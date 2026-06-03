#!/usr/bin/env bash
set -euo pipefail

# scripts/init-speckit.sh
#
# Initializes GitHub Spec Kit in the current repository.
#
# Usage:
#   ./scripts/init-speckit.sh
#   ./scripts/init-speckit.sh --integration copilot
#   ./scripts/init-speckit.sh --integration claude
#   ./scripts/init-speckit.sh --force

INTEGRATION="copilot"
FORCE="false"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --integration)
      INTEGRATION="${2:-}"
      shift 2
      ;;
    --force)
      FORCE="true"
      shift
      ;;
    -h|--help)
      cat <<EOF
Usage:
  ./scripts/init-speckit.sh [options]

Options:
  --integration NAME   Spec Kit agent integration. Default: copilot
                       Examples: copilot, claude, gemini
  --force              Re-run initialization even if .specify already exists
  -h, --help           Show this help message
EOF
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      echo "Run ./scripts/init-speckit.sh --help"
      exit 1
      ;;
  esac
done

if [[ -z "$INTEGRATION" ]]; then
  echo "Error: --integration requires a value."
  exit 1
fi

echo "Checking repository..."

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Error: this script should be run inside a Git repository."
  echo "Codespaces usually opens inside the repo root. Humanity occasionally wins."
  exit 1
fi

REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"

echo "Repository root: $REPO_ROOT"

if [[ -d ".specify" && "$FORCE" != "true" ]]; then
  echo "Spec Kit already appears to be initialized: .specify/ exists."
  echo "Use --force to run initialization again."
  exit 0
fi

echo "Checking uv..."

if ! command -v uv >/dev/null 2>&1; then
  echo "uv is not installed or not in PATH."
  echo "Install uv in the devcontainer first, for example in postCreateCommand:"
  echo "  curl -LsSf https://astral.sh/uv/install.sh | sh"
  exit 1
fi

echo "Initializing Spec Kit..."
echo "Integration: $INTEGRATION"
echo "Script type: sh"

uvx --from git+https://github.com/github/spec-kit.git \
  specify init . \
  --integration "$INTEGRATION" \
  --script sh \
  --ignore-agent-tools

echo
echo "Spec Kit initialized."
echo
echo "Expected generated items include:"
echo "  .specify/"
echo "  specs/"
echo "  agent-specific command or instruction files"
echo
echo "Next suggested workflow:"
echo "  1. Open the AI assistant/chat for the selected integration."
echo "  2. Start with /speckit.constitution"
echo "  3. Then use /speckit.specify"
echo "  4. Then /speckit.plan"
echo "  5. Then /speckit.tasks"
echo
echo "Do not jump straight to code. That is how software becomes archaeology."