-- Drop notification_tokens table.
-- App uses local notifications (expo-notifications scheduleNotificationAsync) only.
-- No push tokens needed. Recreate if server-initiated push is added later.

drop table if exists public.notification_tokens;
