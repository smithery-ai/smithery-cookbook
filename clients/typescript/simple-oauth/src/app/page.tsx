"use client";

import { useState } from "react";
// OAuth client operations moved to API routes

interface SchemaProperty {
  type?: string;
  description?: string;
  default?: unknown;
}

interface Tool {
  name: string;
  description?: string;
  inputSchema?: {
    type: "object";
    properties?: Record<string, SchemaProperty>;
    required?: string[];
  };
}

export default function Home() {
  const [serverUrl, setServerUrl] = useState(
    "https://server.smithery.ai/exa/mcp"
  );
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [tools, setTools] = useState<Tool[]>([]);
  const [selectedTool, setSelectedTool] = useState("");
  const [toolArgs, setToolArgs] = useState("{}");
  const [toolResult, setToolResult] = useState<object | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jsonError, setJsonError] = useState<string | null>(null);

  const generateDefaultArgs = (tool: Tool): string => {
    if (!tool.inputSchema?.properties) {
      return "{}";
    }

    const defaultArgs: Record<string, unknown> = {};

    Object.entries(tool.inputSchema.properties).forEach(([key, schema]) => {
      switch (schema.type) {
        case "string":
          defaultArgs[key] = schema.default || "";
          break;
        case "number":
        case "integer":
          defaultArgs[key] = schema.default || 0;
          break;
        case "boolean":
          defaultArgs[key] = schema.default || false;
          break;
        case "array":
          defaultArgs[key] = schema.default || [];
          break;
        case "object":
          defaultArgs[key] = schema.default || {};
          break;
        default:
          defaultArgs[key] = schema.default || null;
      }
    });

    return JSON.stringify(defaultArgs, null, 2);
  };

  const handleToolSelect = (toolName: string) => {
    setSelectedTool(toolName);
    setJsonError(null);

    if (toolName) {
      const tool = tools.find((t) => t.name === toolName);
      if (tool) {
        setToolArgs(generateDefaultArgs(tool));
      }
    } else {
      setToolArgs("{}");
    }
  };

  const handleArgsChange = (value: string) => {
    setToolArgs(value);

    // Validate JSON syntax
    try {
      if (value.trim()) {
        JSON.parse(value);
      }
      setJsonError(null);
    } catch (e) {
      setJsonError(e instanceof Error ? e.message : "Invalid JSON");
    }
  };

  const getCallbackUrl = () => {
    return `${window.location.origin}/api/mcp/auth/callback`;
  };

  const handleConnect = async () => {
    if (!serverUrl) return;

    setLoading(true);
    setError(null);
    setJsonError(null);

    try {
      const response = await fetch("/api/mcp/auth/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serverUrl, callbackUrl: getCallbackUrl() }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.requiresAuth && data.authUrl && data.sessionId) {
          setSessionId(data.sessionId);
          // Open authorization URL in a popup
          const popup = window.open(
            data.authUrl,
            "oauth-popup",
            "width=600,height=700,scrollbars=yes,resizable=yes"
          );

          // Listen for messages from the popup
          const messageHandler = async (event: MessageEvent) => {
            if (event.origin !== window.location.origin) return;

            if (event.data.type === "oauth-success") {
              popup?.close();

              try {
                const finishResponse = await fetch("/api/mcp/auth/finish", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    authCode: event.data.code,
                    sessionId: data.sessionId,
                  }),
                });

                if (finishResponse.ok) {
                  setIsConnected(true);
                  await loadTools(data.sessionId);
                } else {
                  const errorData = await finishResponse.json();
                  setError(
                    `Failed to complete authentication: ${errorData.error}`
                  );
                }
              } catch (err) {
                setError(`Failed to complete authentication: ${err}`);
              }

              window.removeEventListener("message", messageHandler);
            } else if (event.data.type === "oauth-error") {
              popup?.close();
              setError(`OAuth failed: ${event.data.error}`);
              window.removeEventListener("message", messageHandler);
            }
          };

          window.addEventListener("message", messageHandler);
        } else {
          setError(data.error || "Connection failed");
        }
      } else {
        setSessionId(data.sessionId);
        setIsConnected(true);
        await loadTools(data.sessionId);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(`Connection failed: ${err.message}`);
      } else {
        setError(`Connection failed: ${err}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadTools = async (currentSessionId?: string) => {
    const sid = currentSessionId || sessionId;
    if (!sid) return;

    try {
      const response = await fetch(`/api/mcp/tool/list?sessionId=${sid}`);
      const data = await response.json();

      if (response.ok) {
        setTools(data.tools || []);
      } else {
        setError(`Failed to load tools: ${data.error}`);
      }
    } catch (err) {
      setError(`Failed to load tools: ${err}`);
    }
  };

  const handleCallTool = async () => {
    if (!selectedTool) return;

    setLoading(true);
    setError(null);
    setToolResult(null);

    try {
      let args = {};
      if (toolArgs.trim()) {
        args = JSON.parse(toolArgs);
      }

      const response = await fetch("/api/mcp/tool/call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolName: selectedTool,
          toolArgs: args,
          sessionId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setToolResult(data.result);
      } else {
        setError(`Tool call failed: ${data.error}`);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(`Tool call failed: ${err.message}`);
      } else {
        setError(`Tool call failed: ${err}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      if (sessionId) {
        await fetch("/api/mcp/auth/disconnect", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });
      }
    } catch {
      // Ignore disconnect errors
    }

    setSessionId(null);
    setIsConnected(false);
    setTools([]);
    setSelectedTool("");
    setToolResult(null);
    setJsonError(null);
  };

  return (
    <div className="font-sans min-h-screen p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">MCP OAuth Client</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {!isConnected ? (
        <div className="space-y-4">
          <div>
            <label
              htmlFor="serverUrl"
              className="block text-sm font-medium mb-2"
            >
              MCP Server URL:
            </label>
            <input
              id="serverUrl"
              type="text"
              value={serverUrl}
              onChange={(e) => setServerUrl(e.target.value)}
              placeholder="http://localhost:3000/mcp"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={handleConnect}
            disabled={!serverUrl || loading}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Connecting..." : "Connect"}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="text-green-600 font-medium">
              ✅ Connected to {serverUrl}
            </div>
            <button
              onClick={handleDisconnect}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              Disconnect
            </button>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Call Tool</h2>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="toolSelect"
                  className="block text-sm font-medium mb-2"
                >
                  Select Tool:
                </label>
                <select
                  id="toolSelect"
                  value={selectedTool}
                  onChange={(e) => handleToolSelect(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a tool...</option>
                  {tools.map((tool, index) => (
                    <option key={index} value={tool.name}>
                      {tool.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedTool &&
                (() => {
                  const tool = tools.find((t) => t.name === selectedTool);
                  return tool?.inputSchema?.properties ? (
                    <div className="bg-blue-50 p-3 rounded-md">
                      <h4 className="text-sm font-medium text-blue-800 mb-2">
                        Expected Parameters:
                      </h4>
                      <div className="space-y-1">
                        {Object.entries(tool.inputSchema.properties).map(
                          ([key, schema]) => (
                            <div key={key} className="text-sm">
                              <span className="font-medium text-blue-700">
                                {key}
                              </span>
                              {tool.inputSchema?.required?.includes(key) && (
                                <span className="text-red-500 ml-1">*</span>
                              )}
                              <span className="text-gray-600 ml-2">
                                ({schema.type || "any"})
                              </span>
                              {schema.description && (
                                <div className="text-gray-500 ml-4 text-xs">
                                  {schema.description}
                                </div>
                              )}
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  ) : null;
                })()}

              <div>
                <label
                  htmlFor="toolArgs"
                  className="block text-sm font-medium mb-2"
                >
                  Arguments (JSON):
                </label>
                <textarea
                  id="toolArgs"
                  value={toolArgs}
                  onChange={(e) => handleArgsChange(e.target.value)}
                  placeholder="{}"
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    jsonError
                      ? "border-red-300 focus:ring-red-500"
                      : "border-gray-300 focus:ring-blue-500"
                  }`}
                />
                {jsonError && (
                  <div className="mt-1 text-sm text-red-600">{jsonError}</div>
                )}
              </div>

              <button
                onClick={handleCallTool}
                disabled={!selectedTool || loading || !!jsonError}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Calling..." : "Call Tool"}
              </button>
            </div>
          </div>

          {toolResult && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Tool Result</h2>
              <div className="bg-gray-900 p-4 rounded-md">
                <pre className="whitespace-pre-wrap text-sm">
                  {JSON.stringify(toolResult, null, 2)}
                </pre>
              </div>
            </div>
          )}

          <div>
            <h2 className="text-xl font-semibold mb-4">Available Tools</h2>
            {tools.length > 0 ? (
              <div className="space-y-2">
                {tools.map((tool, index) => (
                  <div
                    key={index}
                    className="p-3 border border-gray-200 rounded-md"
                  >
                    <div className="font-medium">{tool.name}</div>
                    {tool.description && (
                      <div className="text-sm text-gray-600 mt-1">
                        {tool.description}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500">No tools available</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
