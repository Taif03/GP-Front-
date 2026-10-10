/*
# Enable Realtime on reports table

## Changes
- Adds the `reports` table to the Supabase Realtime publication (`supabase_realtime`).
- This enables the frontend to subscribe to INSERT/UPDATE/DELETE events
  on the `reports` table via WebSocket, so new AI camera detections and
  manual status changes propagate instantly to all connected dashboards.

## Notes
- `ALTER PUBLICATION ... ADD TABLE` is idempotent — re-running won't error.
- RLS policies still apply to realtime subscriptions, so only rows the
  anon role can SELECT are broadcast.
*/

ALTER PUBLICATION supabase_realtime ADD TABLE reports;
