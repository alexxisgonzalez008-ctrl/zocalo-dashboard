import { z } from "zod";

export const CopilotRoleSchema = z.enum(["system", "user", "assistant"]);
export type CopilotRole = z.infer<typeof CopilotRoleSchema>;

export const CopilotMessageSchema = z.object({
    role: CopilotRoleSchema,
    content: z.string(),
    createdAt: z.string().optional(),
});
export type CopilotMessage = z.infer<typeof CopilotMessageSchema>;

export const ToolCallSchema = z.object({
    name: z.string(),
    arguments: z.record(z.any()),
});
export type ToolCall = z.infer<typeof ToolCallSchema>;

export const LLMResponseSchema = z.object({
    assistantText: z.string().optional(),
    toolCall: ToolCallSchema.optional(),
    confidence: z.number().optional(),
});
export type LLMResponse = z.infer<typeof LLMResponseSchema>;

export const ProposalStatusSchema = z.enum(["pending", "confirmed", "cancelled", "failed"]);
export type ProposalStatus = z.infer<typeof ProposalStatusSchema>;

export const SearchDailyLogsSchema = z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    query: z.string().optional(),
});

export const ChatInputSchema = z.object({
    projectId: z.string().optional(),
    message: z.string().min(1),
    photoIds: z.array(z.string()).optional(),
    mode: z.enum(["default", "field"]).optional(),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;
