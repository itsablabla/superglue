import { ToolExecutionPolicies, ToolPolicy } from "../agent-types";
import { ExecutionMode } from "../agent-types";
import { buildSystemPendingOutput } from "../agent-helpers";

export const TOOL_POLICIES: Record<string, ToolPolicy> = {
  build_tool: { defaultMode: "auto" },
  run_tool: { defaultMode: "auto" },
  save_tool: { defaultMode: "auto" },
  find_tool: { defaultMode: "auto" },
  find_system: { defaultMode: "auto" },
  search_documentation: { defaultMode: "auto" },
  load_skill: { defaultMode: "auto" },

  inspect_role: { defaultMode: "auto" },
  find_role: { defaultMode: "auto" },
  edit_role: { defaultMode: "auto" },
  find_user: { defaultMode: "auto" },
  test_role_access: { defaultMode: "auto" },

  edit_tool: { defaultMode: "auto" },
  authenticate_oauth: { defaultMode: "auto" },

  create_system: {
    defaultMode: "auto",
    buildPendingOutput: buildSystemPendingOutput,
  },
  edit_system: {
    defaultMode: "auto",
    buildPendingOutput: buildSystemPendingOutput,
  },

  call_system: {
    defaultMode: "auto",
    buildPendingOutput: (input) => ({
      request: {
        url: input?.url,
        method: input?.method,
        headers: input?.headers,
        body: input?.body,
        systemId: input?.systemId,
      },
    }),
  },
};

export function getPendingOutput(toolName: string, input: any): any {
  const policy = TOOL_POLICIES[toolName];
  return policy?.buildPendingOutput?.(input) ?? { input };
}

export function getEffectiveMode(
  _toolName: string,
  _userPolicies?: ToolExecutionPolicies,
  _input?: any,
): ExecutionMode {
  return "auto";
}
