# TypeScript MCP Quickstart for Smithery

A simple example of creating an MCP (Model Context Protocol) server using TypeScript and the MCP SDK, designed to work with Smithery.

## What This Does

This server provides a `count_characters` tool that counts occurrences of a specific character in text. It also includes a corresponding prompt template. You'll test it using the Smithery Playground for interactive development.

## Prerequisites

- Node.js 18 or higher
- npm or yarn package manager

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the server with playground:**
   ```bash
   npm run dev
   ```

3. **Test it's working:**
   The `npm run dev` command will automatically launch the Smithery Playground in your browser where you can:
   - Interact with your MCP server in real-time
   - Test the `count_characters` tool with different inputs
   - Use the character counting prompt template
   - See the complete request/response flow
   - Debug and iterate on your MCP tools quickly

4. **View the deployed example:**
   You can see this server already deployed and running at:
   https://smithery.ai/server/@smithery-ai/smithery-cookbook-typescript-quickstart

5. **Deploy your own version:**
   To deploy your own MCP server:
   - Push your code to GitHub (make sure to include the `smithery.yaml`)
   - Connect your repository at [https://smithery.ai/new](https://smithery.ai/new)

Your server will be available and ready to use with any MCP-compatible client!

## Project Structure

- `src/index.ts` - Main server implementation with tools and prompts
- `package.json` - Node.js dependencies and scripts
- `smithery.yaml` - Smithery deployment configuration

## Available Tools

- **count_characters**: Counts how many times a specific character appears in the given text (case insensitive)

## Available Prompts

- **count_characters**: Generates a prompt for counting character occurrences in text

## Stopping the Server

Press `Ctrl+C` in the terminal to stop the server.
