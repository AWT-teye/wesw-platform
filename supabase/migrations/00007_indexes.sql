-- ============================================
-- 00007_indexes.sql
-- 성능 최적화 인덱스
-- ============================================

-- profiles
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_residential_area ON public.profiles(residential_area);

-- posts (가장 많은 쿼리 대상)
CREATE INDEX idx_posts_board_id ON public.posts(board_id);
CREATE INDEX idx_posts_author_id ON public.posts(author_id);
CREATE INDEX idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX idx_posts_like_count ON public.posts(like_count DESC);
CREATE INDEX idx_posts_board_active ON public.posts(board_id, created_at DESC)
  WHERE is_active = true AND is_blinded = false AND is_archived = false;
CREATE INDEX idx_posts_featured ON public.posts(board_id)
  WHERE is_featured = true;
CREATE INDEX idx_posts_pinned ON public.posts(board_id, is_pinned DESC, created_at DESC);

-- post_votes
CREATE INDEX idx_post_votes_post_id ON public.post_votes(post_id);

-- comments
CREATE INDEX idx_comments_post_id ON public.comments(post_id);
CREATE INDEX idx_comments_parent_id ON public.comments(parent_id);
CREATE INDEX idx_comments_author_id ON public.comments(author_id);

-- policy_votes
CREATE INDEX idx_policy_votes_policy_id ON public.policy_votes(policy_id);

-- policies
CREATE INDEX idx_policies_candidate_id ON public.policies(candidate_id);
CREATE INDEX idx_policies_parent_id ON public.policies(parent_id);
CREATE INDEX idx_policies_level ON public.policies(level);

-- campaign_schedules
CREATE INDEX idx_schedules_date ON public.campaign_schedules(event_date);
CREATE INDEX idx_schedules_candidate ON public.campaign_schedules(candidate_id);

-- notifications
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_unread ON public.notifications(user_id)
  WHERE is_read = false;

-- candidate_quotes
CREATE INDEX idx_quotes_date ON public.candidate_quotes(quote_date DESC);

-- news_links & videos (대시보드 위젯)
CREATE INDEX idx_news_active ON public.news_links(display_order)
  WHERE is_active = true;
CREATE INDEX idx_videos_active ON public.videos(display_order)
  WHERE is_active = true;

-- announcements
CREATE INDEX idx_announcements_category ON public.announcements(category, is_pinned DESC, created_at DESC);

-- supporter_tasks
CREATE INDEX idx_supporter_tasks_date ON public.supporter_tasks(task_date);

-- hero_slides
CREATE INDEX idx_hero_slides_order ON public.hero_slides(display_order)
  WHERE is_active = true;

-- banner_pins
CREATE INDEX idx_banner_pins_location ON public.banner_pins(latitude, longitude);

-- site_settings
CREATE INDEX idx_site_settings_key ON public.site_settings(key);
