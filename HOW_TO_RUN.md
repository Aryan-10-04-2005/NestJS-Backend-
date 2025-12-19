# How to Run the Project

Here is a step-by-step guide to running the Multi-tenant Issue Management API.

## Prerequisites
- **Node.js** and **npm** must be installed (you already have these).
- A terminal (Command Prompt, PowerShell, or VS Code Terminal).

## Step 1: Install Dependencies
If you haven't already, install the necessary libraries:
```bash
npm install
```

## Step 2: Start the Backend Server
This command starts the NestJS application. It will listen for requests on port `3000`.
```bash
npm run start
```
> **Note**: You will see logs like `[Nest] ... Nest application successfully started`. Keep this terminal **OPEN**. The server needs to be running to accept requests.

## Step 3: Run the Verification Script
Open a **NEW** terminal window (keep the server running in the first one).
Run the verification script to see the "Tale of Two Companies":
```bash
node verify.js
```
You should see the story unfold with "PASS" messages.

## Step 4: (Optional) Manual Testing
You can also use tools like `curl` or **Postman** to send requests manually.
Remember to set the required headers:
- `x-org-id`: e.g., "org-a"
- `x-user-id`: e.g., "user-1"
- `x-user-role`: "ADMIN" or "MEMBER"

### Example: Create an Issue
```bash
curl -X POST http://localhost:3000/issues \
  -H "Content-Type: application/json" \
  -H "x-org-id: org-a" \
  -H "x-user-id: alice" \
  -H "x-user-role: ADMIN" \
  -d "{\"title\": \"My First Issue\", \"description\": \"Hello World\"}"
```
