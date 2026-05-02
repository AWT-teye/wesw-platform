"use client";

import { useMemo, useState, useTransition } from "react";
import { saveHeroSettings, type HeroSettingsInput } from "./actions";
import { uploadHeroImage } from "./uploadClient";

export default function HeroForm({ initial }: { initial: HeroSettingsInput }) {
  const [form, setForm] = useState<HeroSettingsInput>(initial);
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState("");

  function up<K extends keyof HeroSettingsInput>(k: K, v: HeroSettingsInput[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setMsg("");
    try {
      const url = await uploadHeroImage(file);
      up("background_image_url", url);
      if (!form.use_image_background) up("use_image_background", true);
    } catch (err) {
      setMsg(`업로드 실패: ${(err as Error).message}`);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    startTransition(async () => {
      const r = await saveHeroSettings(form);
      setMsg("error" in r && r.error ? `오류: ${r.error}` : "저장되었습니다.");
    });
  }

  const overlayRgba = useMemo(() => {
    const hex = (form.overlay_color || "#000000").replace("#", "");
    const r = parseInt(hex.slice(0, 2), 16) || 0;
    const g = parseInt(hex.slice(2, 4), 16) || 0;
    const b = parseInt(hex.slice(4, 6), 16) || 0;
    return `rgba(${r}, ${g}, ${b}, ${form.overlay_opacity})`;
  }, [form.overlay_color, form.overlay_opacity]);

  const showImage = form.use_image_background && !!form.background_image_url;

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      {/* 섹션 1: 미리보기 */}
      <Section title="미리보기" desc="실제 메인페이지와 동일한 비율(16:9) 미리보기.">
        <div className="mx-auto w-full max-w-3xl">
          <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-[#0a0a0a]">
            {showImage ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={form.background_image_url}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0" style={{ backgroundColor: overlayRgba }} />
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/40 to-transparent" />
              </>
            ) : (
              <div className="absolute inset-0">
                <div className="absolute -top-20 -right-20 h-48 w-48 rounded-full bg-[#FF6B00]/10 blur-3xl" />
                <div className="absolute -bottom-10 -left-10 h-36 w-36 rounded-full bg-[#FF6B00]/5 blur-3xl" />
              </div>
            )}
            <div className="relative flex h-full flex-col items-center justify-center px-4 text-center">
              {form.badge_text && (
                <p className="text-xs font-semibold uppercase tracking-widest text-[#FF6B00]">
                  {form.badge_text}
                </p>
              )}
              <h2 className="mt-2 text-2xl font-extrabold leading-tight text-white md:text-4xl">
                {form.headline_main}
                {form.headline_accent && (
                  <>
                    <br />
                    <span className="text-[#FF6B00]">{form.headline_accent}</span>
                  </>
                )}
              </h2>
              {form.subline && (
                <p className="mt-3 text-sm text-gray-200 md:text-base">{form.subline}</p>
              )}
              <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                {form.cta_primary_text && (
                  <span className="rounded-md bg-[#FF6B00] px-4 py-2 text-xs font-bold text-white md:text-sm">
                    {form.cta_primary_text}
                  </span>
                )}
                {form.cta_secondary_text && (
                  <span className="rounded-md border-2 border-[#FF6B00] bg-black/20 px-4 py-2 text-xs font-bold text-[#FF6B00] md:text-sm">
                    {form.cta_secondary_text}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* 섹션 2: 배경 이미지 */}
      <Section title="배경 이미지">
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input
            type="checkbox"
            checked={form.use_image_background}
            onChange={(e) => up("use_image_background", e.target.checked)}
          />
          이미지 배경 사용
          <span className="ml-2 text-xs font-normal text-gray-500">
            (꺼두면 기본 검정 배경으로 표시됩니다)
          </span>
        </label>

        <div className="mt-4 flex items-start gap-4">
          <div className="aspect-video w-40 shrink-0 overflow-hidden rounded border border-gray-200 bg-gray-50">
            {form.background_image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={form.background_image_url}
                alt="대문 배경"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[10px] text-gray-400">
                없음
              </div>
            )}
          </div>
          <div className="flex-1 space-y-2">
            <input
              type="file"
              accept="image/*"
              onChange={onFile}
              disabled={uploading}
              className="block text-xs"
            />
            <input
              type="url"
              value={form.background_image_url}
              onChange={(e) => up("background_image_url", e.target.value)}
              placeholder="또는 이미지 URL 직접 입력"
              className={inputCls}
            />
            <div className="flex items-center justify-between gap-2">
              {uploading && <p className="text-xs text-gray-500">업로드 중...</p>}
              {form.background_image_url && (
                <button
                  type="button"
                  onClick={() => up("background_image_url", "")}
                  className="rounded border border-red-300 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                >
                  이미지 제거
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs leading-relaxed text-blue-900">
          <p className="font-bold">📷 업로드 가이드</p>
          <ul className="mt-1 list-disc space-y-0.5 pl-4">
            <li>권장 해상도: <b>1920×1080 (16:9)</b></li>
            <li>파일 크기: <b>500KB 이하</b> 권장 (LCP 성능 영향)</li>
            <li>형식: <b>WebP 권장</b> (JPG/PNG 도 가능)</li>
            <li>가로형 인물·풍경 사진이 적합하며, 텍스트 가독성을 위해 너무 화려한 이미지는 피해주세요.</li>
          </ul>
        </div>
      </Section>

      {/* 섹션 3: 오버레이 */}
      <Section title="오버레이 설정" desc="이미지 위에 덮이는 색상 레이어. 텍스트 가독성을 높입니다.">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm font-semibold">
            오버레이 색상
            <div className="mt-1 flex items-center gap-2">
              <input
                type="color"
                value={form.overlay_color}
                onChange={(e) => up("overlay_color", e.target.value)}
                className="h-9 w-12 cursor-pointer rounded border border-gray-300"
              />
              <input
                type="text"
                value={form.overlay_color}
                onChange={(e) => up("overlay_color", e.target.value)}
                className={inputCls}
                placeholder="#000000"
              />
            </div>
          </label>
          <label className="block text-sm font-semibold">
            오버레이 투명도 ({form.overlay_opacity.toFixed(2)})
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={form.overlay_opacity}
              onChange={(e) => up("overlay_opacity", Number(e.target.value))}
              className="mt-2 w-full"
            />
            <p className="mt-1 text-xs font-normal text-gray-500">
              가독성을 위해 <b>0.3~0.7</b> 사이를 권장합니다.
            </p>
          </label>
        </div>
      </Section>

      {/* 섹션 4: 텍스트 */}
      <Section title="텍스트 설정">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="배지 텍스트 (badge)">
            <input
              value={form.badge_text}
              onChange={(e) => up("badge_text", e.target.value)}
              className={inputCls}
              placeholder="WE SUWON"
            />
          </Field>
          <Field label="서브 라인 (subline)">
            <input
              value={form.subline}
              onChange={(e) => up("subline", e.target.value)}
              className={inputCls}
              placeholder="정희윤이 만드는 수원 9.0"
            />
          </Field>
          <Field label="헤드라인 메인 (흰색)">
            <input
              value={form.headline_main}
              onChange={(e) => up("headline_main", e.target.value)}
              className={inputCls}
              placeholder="모든 가능성을,"
            />
          </Field>
          <Field label="헤드라인 강조 (오렌지 #FF6B00)">
            <input
              value={form.headline_accent}
              onChange={(e) => up("headline_accent", e.target.value)}
              className={inputCls}
              placeholder="모두에게"
            />
          </Field>
        </div>
      </Section>

      {/* 섹션 5: CTA */}
      <Section title="CTA 버튼 설정">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2 rounded-lg border border-gray-200 p-4">
            <p className="text-sm font-bold">1차 버튼 (오렌지)</p>
            <Field label="텍스트">
              <input
                value={form.cta_primary_text}
                onChange={(e) => up("cta_primary_text", e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="링크 URL">
              <input
                value={form.cta_primary_url}
                onChange={(e) => up("cta_primary_url", e.target.value)}
                className={inputCls}
                placeholder="/we/pledges"
              />
            </Field>
          </div>
          <div className="space-y-2 rounded-lg border border-gray-200 p-4">
            <p className="text-sm font-bold">2차 버튼 (테두리)</p>
            <Field label="텍스트">
              <input
                value={form.cta_secondary_text}
                onChange={(e) => up("cta_secondary_text", e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="링크 URL">
              <input
                value={form.cta_secondary_url}
                onChange={(e) => up("cta_secondary_url", e.target.value)}
                className={inputCls}
                placeholder="/we/supporters 또는 https://..."
              />
            </Field>
          </div>
        </div>
      </Section>

      {msg && (
        <p className="rounded border border-gray-200 bg-gray-50 p-2 text-xs">{msg}</p>
      )}

      <div className="sticky bottom-4 z-10 flex justify-end">
        <button
          type="submit"
          disabled={pending || uploading}
          className="rounded-md bg-[#FF6B00] px-6 py-3 text-sm font-bold text-white shadow-lg hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "저장 중..." : "저장"}
        </button>
      </div>
    </form>
  );
}

const inputCls =
  "mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#FF6B00] focus:outline-none";

function Section({
  title,
  desc,
  children,
}: {
  title: string;
  desc?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6">
      <h2 className="text-lg font-extrabold">{title}</h2>
      {desc && <p className="mt-1 text-xs text-gray-500">{desc}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm font-semibold">
      {label}
      {children}
    </label>
  );
}
