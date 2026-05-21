# Second Brain

Second Brain is a flexible archive of notes, links features, and ideas for personal use.

## Architecture & Technologies

This application is built with modern, high-performance web and systems programming technologies to ensure a blazing-fast, secure desktop experience:

- **Frontend:** React + TypeScript
- **Styling:** TailwindCSS-v4
- **Backend/Desktop Integration:** Rust + Tauri
- **Tooling:** Vite

## How to contribute:

### Prerequisites

Ensure you have the following installed before proceeding:
- Node.js - v22.12.0
- Rust - v1.95.0
- Tauri - v2

### Installation & Local Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/{REPO_LINK}/SecondBrain.git
   cd secondBrain
   ```

2. **Branching Strategy:**
   When contributing or making changes, create a new branch specific to the issue, bug, or feature you are working on.
   ```bash
   # Example: Creating a new branch for a feature
   git checkout -b feature/dark-mode-toggle

   # Example: Creating a new branch for a bug fix
   git checkout -b fix/note-save-error
   ```

3. **Install dependencies:**
   ```bash
   npm install (inside root directory)
   ```

4. **Build the project:**
   Compile the frontend assets.
   ```bash
   npm run build (inside root directory)
   ```

5. **Run the application in development mode:**
   This command starts the Vite development server and opens the Tauri desktop window.
   ```bash
   npm run tauri dev (inside root directory)
   ```

This project is built for personal use.
