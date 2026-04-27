FROM node:20-alpine

# Install pnpm and dotenvx
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN npm install -g @dotenvx/dotenvx

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source files
COPY . .

# Signal handling for graceful shutdown
STOPSIGNAL SIGINT

# Run with dotenvx to decrypt environment variables
CMD ["dotenvx", "run", "--env-file=.env.local", "--", "pnpm", "start"]
