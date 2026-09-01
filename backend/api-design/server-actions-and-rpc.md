# ⚡ Next.js Server Actions vs REST APIs vs PostgreSQL RPCs

**Topic:** API Architecture, Schema Validation, Idempotency & Mutation Patterns  
**Reference Implementations:** ARENEX, AI CV Builder  
**Author:** Khalid Abdullah  

---

## 📌 Architectural Comparison

| Dimension | Next.js Server Actions | REST API Endpoints (`/api/*`) | PostgreSQL RPC Functions |
| :--- | :--- | :--- | :--- |
| **Execution Context** | Node.js / Edge Runtime | Node.js / Edge Route Handler | Database Engine (PL/pgSQL) |
| **Type Safety** | End-to-End TypeScript | Manual OpenAPI / Contract | SQL Schema Definitions |
| **Network Overhead** | Single POST payload | Standard HTTP verbs | Internal DB Socket Call |
| **Best Use Case** | Form mutations, wizard steps, UI state updates | Webhooks, public third-party integrations | Atomic transactions, complex mathematical multi-table locks |

---

## 🛠️ 1. Idempotent Server Action Pattern with Zod

In ARENEX, tournament registrations use Server Actions with strict Zod validation:

```typescript
// app/actions/tournament-registration.ts
"use server";

import { z } from "zod";
import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const RegisterSchema = z.object({
  tournamentId: z.string().uuid(),
  gameAccountId: z.string().uuid(),
  paymentMethod: z.enum(["bKash", "Nagad", "Rocket"]),
  transactionId: z.string().min(6).max(50),
  senderNumber: z.string().regex(/^01[3-9]\d{8}$/, "Invalid Bangladeshi mobile number"),
});

export async function submitTournamentRegistration(formData: FormData) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const validated = RegisterSchema.parse({
    tournamentId: formData.get("tournamentId"),
    gameAccountId: formData.get("gameAccountId"),
    paymentMethod: formData.get("paymentMethod"),
    transactionId: formData.get("transactionId"),
    senderNumber: formData.get("senderNumber"),
  });

  // Call atomic PostgreSQL RPC to handle slot capacity and payment record insertion
  const { data, error } = await supabase.rpc("register_player_with_payment", {
    p_user_id: user.id,
    p_tournament_id: validated.tournamentId,
    p_game_account_id: validated.gameAccountId,
    p_payment_method: validated.paymentMethod,
    p_transaction_id: validated.transactionId,
    p_sender_number: validated.senderNumber,
  });

  if (error) throw new Error(error.message);

  revalidatePath(`/tournaments/${validated.tournamentId}`);
  return { success: true, registrationId: data.registration_id };
}
```
