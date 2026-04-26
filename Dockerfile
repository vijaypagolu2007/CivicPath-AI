# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Explicitly set the variables for the build process
# Using the values from your .env.local to ensure they are baked in
ENV NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyA6C0SRmFwVr3nUXhQZixRBVFukzutpjE0
ENV NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=civic-education-assistant.firebaseapp.com
ENV NEXT_PUBLIC_FIREBASE_PROJECT_ID=civic-education-assistant
ENV NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=civic-education-assistant.firebasestorage.app
ENV NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=423696837845
ENV NEXT_PUBLIC_FIREBASE_APP_ID=1:423696837845:web:d22da67e69999f3004865c
ENV NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-07JXTBY33R
ENV NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyBUHg6uvr6zQgi9GcKU59JQTfUAGYLhN6k

RUN npm run build

# Stage 2: Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy standalone build and static files
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 8080

# Next.js standalone server
CMD ["node", "server.js"]
