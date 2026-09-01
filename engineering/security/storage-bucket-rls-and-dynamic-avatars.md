# 🖼️ Storage Bucket RLS & Dynamic Profile-Linked Avatars

**Topic:** Secure Asset Uploads, Bucket Access Policies, and Preventing Stock Avatar Placeholders  
**Reference Implementations:** ARENEX, AI CV Builder  
**Author:** Khalid Abdullah  

---

## 📌 The Engineering Challenge

In user-driven platforms, user avatar and receipt uploads present distinct security and integrity vectors:
1. **Malicious Overwrites:** User A overwriting User B's profile image if storage paths are not strictly scoped.
2. **Unauthenticated Public Write Access:** Allowing anonymous actors to upload unbounded files and exhaust cloud storage quotas.
3. **Mismatched Leaderboard Identity:** Hardcoding stock placeholder images or unverified avatars into leaderboard tables instead of querying dynamic relational profile URLs.

---

## 🛡️ 1. Supabase Storage RLS Configuration

```sql
-- 1. Create Public Read, Authenticated Write Bucket for Avatars
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Storage RLS Policy: Anyone can view avatars
CREATE POLICY "Public Read Access on Avatars" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'avatars');

-- 3. Storage RLS Policy: Users can only upload to avatars/{user_id}/*
CREATE POLICY "Users can upload own avatar" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'avatars' AND 
  auth.role() = 'authenticated' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 4. Storage RLS Policy: Users can only update or delete their own avatar
CREATE POLICY "Users can update own avatar" 
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);
```

---

## ⚡ 2. Dynamic Relational Joins for Leaderboards

To guarantee that leaderboard and tournament rankings dynamically reflect the real player profile and avatar:

```typescript
// Fetching Live Leaderboard with Relational Profile Joins
export async function getTournamentLeaderboard(tournamentId: string) {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("leaderboard_entries")
    .select(`
      rank,
      kills,
      placement_points,
      total_points,
      prize_won,
      profile:profiles (
        id,
        username,
        full_name,
        avatar_url
      ),
      game_account:game_accounts (
        in_game_name,
        in_game_uid
      )
    `)
    .eq("tournament_id", tournamentId)
    .order("rank", { ascending: true });

  if (error) throw new Error(error.message);
  return data;
}
```
