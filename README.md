## Getting Started

This backend project uses **TypeScript 7** and targets **Node.js 26**. Follow these steps to set up your local development environment.

### Prerequisites

Make sure you have [Node.js](https://nodejs.org) installed (Version 26+ recommended).

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/VladyslavTupikin/typescript-backend-practice.git
   cd typescript-backend-practice
   ```

2. **Install all dependencies:**
   This command installs all runtime dependencies and crucial developer utilities (including TypeScript compiler engines, Node 26 configuration matrices, and type environment definitions) cleanly into your workspace:
   ```bash
   npm install
   ```

### Development & Building

- **Build the project:** Compiles your TypeScript files into flat, optimized JavaScript inside the `dist/` directory.

  ```bash
  npm run build
  ```

- **Start the application** Runs the compiled production code using .env file otherwise with default parameters.

  ```bash
  npm start
  ```

- **Start the application with arguments** Where `server ip/port` - address and port for the backend, `client ip/port` - address and port used by CORS for client connection. If one or more parameters skipped and `.env` file was not provided, default values will be used.

  ```bash
  npm start -- --server_ip "192.168.1.1" --server_port "5000" client_ip "192.168.1.2" --client_port "3000"
  ```

- **Watch mode (Optional):** Automatically recompiles your files every time you hit save.
  ```bash
  npx tsc --watch
  ```
