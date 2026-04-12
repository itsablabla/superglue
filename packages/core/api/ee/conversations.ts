import { registerApiModule } from "../registry.js";
import { sendError, addTraceHeader, parsePaginationParams } from "../response-helpers.js";
import type { AuthenticatedFastifyRequest, RouteHandler } from "../types.js";

const MAX_CONVERSATIONS = 50;

const listConversationsHandler: RouteHandler = async (request, reply) => {
  const authReq = request as AuthenticatedFastifyRequest;
  const query = request.query as { page?: string; limit?: string };
  const { page, limit, offset } = parsePaginationParams(query);

  const { items, total } = await authReq.datastore.listConversations({
    orgId: authReq.authInfo.orgId,
    userId: authReq.authInfo.userId,
    limit,
    offset,
  });

  const data = items.map((conv) => ({
    ...conv,
    createdAt: conv.createdAt instanceof Date ? conv.createdAt.toISOString() : conv.createdAt,
    updatedAt: conv.updatedAt instanceof Date ? conv.updatedAt.toISOString() : conv.updatedAt,
  }));

  return addTraceHeader(reply, authReq.traceId)
    .code(200)
    .send({ data, page, limit, total, hasMore: offset + limit < total });
};

const getConversationHandler: RouteHandler = async (request, reply) => {
  const authReq = request as AuthenticatedFastifyRequest;
  const params = request.params as { id: string };

  const conversation = await authReq.datastore.getConversation({
    id: params.id,
    orgId: authReq.authInfo.orgId,
  });

  if (!conversation) {
    return sendError(reply, 404, "Conversation not found");
  }

  const data = {
    ...conversation,
    createdAt:
      conversation.createdAt instanceof Date
        ? conversation.createdAt.toISOString()
        : conversation.createdAt,
    updatedAt:
      conversation.updatedAt instanceof Date
        ? conversation.updatedAt.toISOString()
        : conversation.updatedAt,
  };

  return addTraceHeader(reply, authReq.traceId).code(200).send({ success: true, data });
};

const upsertConversationHandler: RouteHandler = async (request, reply) => {
  const authReq = request as AuthenticatedFastifyRequest;
  const params = request.params as { id: string };
  const body = request.body as {
    title?: string;
    summary?: string;
    messages?: any[];
    sessionId?: string | null;
    lastSummarizedMessageCount?: number;
  };

  if (!body || typeof body !== "object") {
    return sendError(reply, 400, "Request body must be a JSON object");
  }

  // Check conversation count limit for new conversations
  const existing = await authReq.datastore.getConversation({
    id: params.id,
    orgId: authReq.authInfo.orgId,
  });

  if (!existing) {
    const { total } = await authReq.datastore.listConversations({
      orgId: authReq.authInfo.orgId,
      userId: authReq.authInfo.userId,
      limit: 1,
      offset: 0,
    });

    if (total >= MAX_CONVERSATIONS) {
      return sendError(
        reply,
        409,
        `Maximum of ${MAX_CONVERSATIONS} conversations reached. Delete old conversations first.`,
      );
    }
  }

  const conversation = await authReq.datastore.upsertConversation({
    conversation: {
      id: params.id,
      title: body.title || "",
      summary: body.summary,
      messages: body.messages || [],
      sessionId: body.sessionId,
      lastSummarizedMessageCount: body.lastSummarizedMessageCount || 0,
      createdAt: existing?.createdAt || new Date(),
      updatedAt: new Date(),
    },
    orgId: authReq.authInfo.orgId,
    userId: authReq.authInfo.userId,
  });

  const data = {
    ...conversation,
    createdAt:
      conversation.createdAt instanceof Date
        ? conversation.createdAt.toISOString()
        : conversation.createdAt,
    updatedAt:
      conversation.updatedAt instanceof Date
        ? conversation.updatedAt.toISOString()
        : conversation.updatedAt,
  };

  return addTraceHeader(reply, authReq.traceId).code(200).send({ success: true, data });
};

const deleteConversationHandler: RouteHandler = async (request, reply) => {
  const authReq = request as AuthenticatedFastifyRequest;
  const params = request.params as { id: string };

  const deleted = await authReq.datastore.deleteConversation({
    id: params.id,
    orgId: authReq.authInfo.orgId,
  });

  if (!deleted) {
    return sendError(reply, 404, "Conversation not found");
  }

  return addTraceHeader(reply, authReq.traceId).code(200).send({ success: true });
};

registerApiModule({
  name: "conversations",
  routes: [
    {
      method: "GET",
      path: "/conversations",
      handler: listConversationsHandler,
      permissions: {
        type: "read",
        resource: "conversations",
        allowedBaseRoles: ["admin", "member"],
      },
    },
    {
      method: "GET",
      path: "/conversations/:id",
      handler: getConversationHandler,
      permissions: {
        type: "read",
        resource: "conversations",
        allowedBaseRoles: ["admin", "member"],
      },
    },
    {
      method: "PUT",
      path: "/conversations/:id",
      handler: upsertConversationHandler,
      permissions: {
        type: "write",
        resource: "conversations",
        allowedBaseRoles: ["admin", "member"],
      },
    },
    {
      method: "DELETE",
      path: "/conversations/:id",
      handler: deleteConversationHandler,
      permissions: {
        type: "delete",
        resource: "conversations",
        allowedBaseRoles: ["admin", "member"],
      },
    },
  ],
});
