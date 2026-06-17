FROM node:24-alpine

# Install dotenvx and enable corepack (pnpm version comes from packageManager in package.json)
RUN corepack enable
RUN npm install -g @dotenvx/dotenvx

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source files
COPY . .

# Signal handling for graceful shutdown
STOPSIGNAL SIGINT

# Run with dotenvx to decrypt environment variables
CMD ["dotenvx", "run", "--env-file=.env.local", "--", "pnpm", "start"]
