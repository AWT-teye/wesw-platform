-- ============================================
-- 00008_triggers.sql
-- 자동화 트리거 (투표 동기화, 댓글 수, 자동노출, 알림)
-- ============================================

-- ======== 1. 게시글 투표 수 동기화 ========
CREATE OR REPLACE FUNCTION public.sync_post_vote_counts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_id uuid;
BEGIN
  target_id := COALESCE(NEW.post_id, OLD.post_id);
  UPDATE posts SET
    like_count = (SELECT count(*) FROM post_votes WHERE post_id = target_id AND vote_type = 'like'),
    dislike_count = (SELECT count(*) FROM post_votes WHERE post_id = target_id AND vote_type = 'dislike')
  WHERE id = target_id;
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER trg_sync_post_votes
  AFTER INSERT OR UPDATE OR DELETE ON public.post_votes
  FOR EACH ROW EXECUTE FUNCTION public.sync_post_vote_counts();

-- ======== 2. 공약 투표 수 동기화 ========
CREATE OR REPLACE FUNCTION public.sync_policy_vote_counts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_id uuid;
BEGIN
  target_id := COALESCE(NEW.policy_id, OLD.policy_id);
  UPDATE policies SET
    like_count = (SELECT count(*) FROM policy_votes WHERE policy_id = target_id AND vote_type = 'like'),
    dislike_count = (SELECT count(*) FROM policy_votes WHERE policy_id = target_id AND vote_type = 'dislike')
  WHERE id = target_id;
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER trg_sync_policy_votes
  AFTER INSERT OR UPDATE OR DELETE ON public.policy_votes
  FOR EACH ROW EXECUTE FUNCTION public.sync_policy_vote_counts();

-- ======== 3. 댓글 수 동기화 ========
CREATE OR REPLACE FUNCTION public.sync_comment_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_id uuid;
BEGIN
  target_id := COALESCE(NEW.post_id, OLD.post_id);
  UPDATE posts SET
    comment_count = (SELECT count(*) FROM comments WHERE post_id = target_id AND is_active = true)
  WHERE id = target_id;
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER trg_sync_comment_count
  AFTER INSERT OR UPDATE OR DELETE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.sync_comment_count();

-- ======== 4. 상언격쟁 자동 노출 (추천 10회 이상) ========
CREATE OR REPLACE FUNCTION public.auto_feature_sangeon()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.like_count >= 10 AND OLD.like_count < 10 THEN
    IF EXISTS (
      SELECT 1 FROM boards WHERE id = NEW.board_id AND board_type = 'sangeon'
    ) THEN
      NEW.is_featured := true;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_auto_feature_sangeon
  BEFORE UPDATE OF like_count ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.auto_feature_sangeon();

-- ======== 5. 댓글 알림 생성 ========
CREATE OR REPLACE FUNCTION public.notify_on_comment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_post_author_id uuid;
  v_post_title text;
  v_parent_author_id uuid;
BEGIN
  SELECT author_id, title INTO v_post_author_id, v_post_title
    FROM posts WHERE id = NEW.post_id;

  -- 새 댓글 → 게시글 작성자에게 알림
  IF NEW.parent_id IS NULL AND NEW.author_id != v_post_author_id THEN
    INSERT INTO notifications (user_id, type, title, body, link_url, related_post_id, related_comment_id)
    VALUES (
      v_post_author_id,
      'comment_on_post',
      '새 댓글이 달렸습니다',
      '"' || left(v_post_title, 30) || '"에 새 댓글이 달렸습니다',
      '/community/post/' || NEW.post_id,
      NEW.post_id,
      NEW.id
    );
  END IF;

  -- 대댓글 → 부모 댓글 작성자에게 알림
  IF NEW.parent_id IS NOT NULL THEN
    SELECT author_id INTO v_parent_author_id
      FROM comments WHERE id = NEW.parent_id;
    IF v_parent_author_id IS NOT NULL AND NEW.author_id != v_parent_author_id THEN
      INSERT INTO notifications (user_id, type, title, body, link_url, related_post_id, related_comment_id)
      VALUES (
        v_parent_author_id,
        'reply_to_comment',
        '대댓글이 달렸습니다',
        '내 댓글에 답글이 달렸습니다',
        '/community/post/' || NEW.post_id || '#comment-' || NEW.id,
        NEW.post_id,
        NEW.id
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_on_comment
  AFTER INSERT ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_comment();

-- ======== 6. 개혁만인소 상태 변경 알림 ========
CREATE OR REPLACE FUNCTION public.notify_on_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO notifications (user_id, type, title, body, link_url, related_post_id)
    VALUES (
      NEW.author_id,
      'status_changed',
      '민원 상태가 변경되었습니다',
      '상태: ' || COALESCE(OLD.status, '없음') || ' → ' || NEW.status,
      '/community/post/' || NEW.id,
      NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_on_status_change
  BEFORE UPDATE OF status ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_status_change();

-- ======== 7. 상언격쟁 자동노출 시 알림 ========
CREATE OR REPLACE FUNCTION public.notify_on_featured()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.is_featured = true AND OLD.is_featured = false THEN
    INSERT INTO notifications (user_id, type, title, body, link_url, related_post_id)
    VALUES (
      NEW.author_id,
      'post_featured',
      '게시글이 상언격쟁에 노출되었습니다',
      '"' || left(NEW.title, 30) || '" 게시글이 추천 10회를 달성하여 상언격쟁에 자동 노출되었습니다',
      '/community/post/' || NEW.id,
      NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_on_featured
  AFTER UPDATE OF is_featured ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_featured();
