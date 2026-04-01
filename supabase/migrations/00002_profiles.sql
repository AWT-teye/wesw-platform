-- ============================================
-- 00002_profiles.sql
-- 회원 프로필 테이블 + 자동 생성 트리거
-- ============================================

CREATE TABLE public.profiles (
  id                  uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email               text,
  nickname            text NOT NULL,
  avatar_url          text,
  provider            text NOT NULL,
  residential_area    text,
  role                text NOT NULL DEFAULT 'member'
                        CHECK (role IN ('member', 'admin')),
  onboarding_complete boolean DEFAULT false,
  is_active           boolean DEFAULT true,
  is_archived         boolean DEFAULT false,
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now()
);

COMMENT ON TABLE public.profiles IS '회원 프로필 (auth.users 확장)';
COMMENT ON COLUMN public.profiles.role IS 'member: 일반회원, admin: 관리자';
COMMENT ON COLUMN public.profiles.residential_area IS '거주지역 (권선구, 영통구, 장안구, 팔달구, 수원시외 등)';
COMMENT ON COLUMN public.profiles.onboarding_complete IS '최초 로그인 시 닉네임+거주지역 입력 완료 여부';

-- updated_at 트리거
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 소셜 로그인 시 자동 프로필 생성
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nickname, provider, onboarding_complete)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'full_name',
      split_part(NEW.email, '@', 1)
    ),
    COALESCE(NEW.raw_app_meta_data->>'provider', 'unknown'),
    false
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
