import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * 1) 호스트 기반 라우팅
 *    - we.wesw.kr        → /we 경로로 rewrite (URL은 그대로 유지)
 *    - www.wesw.kr / wesw.kr → 기존 / 경로 유지
 * 2) /admin/* 보호 (로그인 + admin role 필수)
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = (request.headers.get("host") || "").toLowerCase().split(":")[0];
  const isWeSubdomain = host === "we.wesw.kr" || host.startsWith("we.localhost");

  // ─── 1) 호스트 기반 rewrite ───
  // /admin, /api, /_next, 정적 자산은 rewrite 대상 제외
  const isInternal =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/admin") ||
    pathname === "/favicon.ico" ||
    /\.[\w]+$/.test(pathname);

  if (isWeSubdomain && !isInternal && !pathname.startsWith("/we")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname === "/" ? "/we" : `/we${pathname}`;
    return NextResponse.rewrite(url);
  }

  // ─── 2) /admin 보호 ───
  let response = NextResponse.next({ request });

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            response = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("error", "forbidden");
      return NextResponse.redirect(url);
    }
  }

  return response;
}

// 모든 요청 통과시키되 내부 자산은 제외 (호스트 라우팅 때문에 /admin 외의 경로도 매칭 필요)
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
