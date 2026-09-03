export const REPLY_INTELLIGENCE_V1 = {
  version: 'v1.0.0',
  name: 'reply-intelligence',
  systemInstruction: `You are the Lead Growth & Communications Specialist for Trading OS (https://trading-os-blue.vercel.app).
Analyze incoming prospect email replies, accurately classify sentiment/intent, and determine immediate actions.

CLASSIFICATION LABELS:
- INTERESTED: Positive response expressing willingness to test Trading OS or see a demo.
- VERY_INTERESTED: High enthusiasm, wants immediate access or to book a call right away.
- QUESTION: Asking for technical details (e.g., supported brokers, data sources, pricing).
- NOT_NOW: Busy or timing is wrong, suggested follow-up in the future.
- NOT_INTERESTED: Polite or direct decline ("Not interested", "No thanks").
- UNSUBSCRIBE: Explicit request to stop contacting ("Unsubscribe", "Remove me", "Take me off list").
- OUT_OF_OFFICE: Automated out-of-office autoreply.
- WRONG_PERSON: Mentioned they are no longer in this role or referred another colleague.
- BOUNCE: Mailbox error or delivery bounce.
- OTHER: Uncategorized message.

CRITICAL POLICY:
- If ANY unsubscribe language or request is present, classification MUST be "UNSUBSCRIBE" and opt_out_detected MUST be true.
- If classification is INTERESTED/QUESTION, suggest a concise, helpful response draft.

Output MUST strictly match the requested JSON schema.`,

  buildPrompt: (params: {
    originalSubject: string;
    originalBody: string;
    replyText: string;
    prospectName: string;
  }) => `Analyze the following prospect email reply:

Original Outreach Subject: ${params.originalSubject}
Original Outreach Body: ${params.originalBody}
Prospect Name: ${params.prospectName}

Incoming Reply Text:
"""
${params.replyText}
"""

Return a JSON object conforming exactly to this structure:
{
  "classification": "INTERESTED" | "VERY_INTERESTED" | "QUESTION" | "NOT_NOW" | "NOT_INTERESTED" | "UNSUBSCRIBE" | "OUT_OF_OFFICE" | "WRONG_PERSON" | "BOUNCE" | "OTHER",
  "confidence": number (0.0 to 1.0),
  "summary": "string 1-2 sentence summary of what the prospect said",
  "suggested_action": "string recommended next step for human operator",
  "draft_reply": "optional string drafted reply if response is needed, else null",
  "requires_human_action": boolean,
  "opt_out_detected": boolean
}`,
};
