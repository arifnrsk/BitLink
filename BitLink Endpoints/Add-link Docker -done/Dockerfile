# Use the official Node.js 18 image.
# https://hub.docker.com/_/node
FROM node:18

# Create and change to the app directory.
WORKDIR /usr/src/app

# Copy application dependency manifests to the container image.
# Copying this first prevents re-running npm install on every code change.
COPY package*.json ./

# Install production dependencies.
RUN npm install --only=production

# Copy the firebase service account json file to the container image.
COPY bitlink-project-firebase-adminsdk-j7592-3e135fe490.json .

# Copy local code to the container image.
COPY . ./

# Expose port 8080
EXPOSE 8080

# Start the web service on port 8080.
CMD [ "node", "add_link.js" ]