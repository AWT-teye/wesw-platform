"use client";

import { useMemo, useState, useTransition } from "react";
import { applyObserver } from "./actions";

export type Station = {
  id: string;
  district: string;
  station_name: string;
  address: string;
  max_observers: number;
  current_observer_count: number;
};

const DISTRICTS = ["장안구", "권선구", "팔달구", "영통구"] as const;

export default function ObserversClient({
  stations,
}: {
  stations: Station[];
}) {
  const [activeDistrict, setActiveDistrict] =
    useState<(typeof DISTRICTS)[number]>("장안구");
  const [modalStation, setModalStation] = useState<Station | null>(null);

  const filtered = useMemo(
    () => stations.filter((s) => s.district === activeDistrict),
    [stations, activeDistrict]
  );

  return (
    <>
      {/* 구 선택 탭 */}
      <div
        role="tablist"
        aria-label="구 선택"
        className="flex flex-wrap gap-2 border-b border-gray-200 pb-3"
      >
        {DISTRICTS.map((d) => (
          <button
            key={d}
            role="tab"
            aria-selected={activeDistrict === d}
            onClick={() => setActiveDistrict(d)}
            className={`rounded-t-md px-4 py-2 text-sm font-bold transition-colors ${
              activeDistrict === d
                ? "bg-[#FF6B00] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      {/* 투표소 목록 */}
      <div className="mt-5 overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">투표소명</th>
              <th className="px-4 py-3">주소</th>
              <th className="px-4 py-3 text-center whitespace-nowrap">
                신청현황
              </th>
              <th className="px-4 py-3 text-right">신청</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-10 text-center text-gray-500"
                >
                  해당 구의 투표소가 등록되어 있지 않습니다.
                </td>
              </tr>
            )}
            {filtered.map((s) => {
              const full =
                s.current_observer_count >= s.max_observers;
              return (
                <tr key={s.id} className="border-t border-gray-100 align-top">
                  <td className="px-4 py-3 font-semibold">
                    {s.station_name}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{s.address}</td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-bold ${
                        full
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {s.current_observer_count} / {s.max_observers}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      disabled={full}
                      onClick={() => setModalStation(s)}
                      className={`rounded px-3 py-1.5 text-xs font-bold transition-colors ${
                        full
                          ? "cursor-not-allowed bg-gray-200 text-gray-500"
                          : "bg-[#FF6B00] text-white hover:opacity-90"
                      }`}
                    >
                      {full ? "마감" : "신청하기"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {modalStation && (
        <ApplyModal
          station={modalStation}
          onClose={() => setModalStation(null)}
        />
      )}
    </>
  );
}

function ApplyModal({
  station,
  onClose,
}: {
  station: Station;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [agree, setAgree] = useState(false);
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ type: "ok" | "error"; text: string } | null>(
    null
  );
  const [done, setDone] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (!name.trim()) {
      setMsg({ type: "error", text: "성명을 입력해 주세요." });
      return;
    }
    if (!phone.trim()) {
      setMsg({ type: "error", text: "연락처를 입력해 주세요." });
      return;
    }
    if (!agree) {
      setMsg({ type: "error", text: "개인정보 수집 동의가 필요합니다." });
      return;
    }

    startTransition(async () => {
      const r = await applyObserver({
        station_id: station.id,
        name: name.trim(),
        phone: phone.trim(),
        district: station.district,
        agree,
      });
      if ("error" in r && r.error) {
        setMsg({ type: "error", text: r.error });
      } else {
        setDone(true);
      }
    });
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="참관인 신청"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        className="absolute inset-0 bg-black/60"
      />

      <div className="relative w-full max-w-md rounded-xl bg-white p-5 shadow-2xl md:p-6">
        {done ? (
          <div className="text-center">
            <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl text-green-600">
              ✓
            </div>
            <h2 className="text-lg font-extrabold">신청이 접수되었습니다</h2>
            <p className="mt-2 text-sm text-gray-600">
              담당자가 유선으로 연락드립니다.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-5 w-full rounded-md bg-[#FF6B00] px-5 py-3 text-sm font-bold text-white hover:opacity-90"
            >
              확인
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit}>
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-[#FF6B00]">
                  {station.district} · 참관인 신청
                </p>
                <h2 className="mt-1 text-base font-extrabold md:text-lg">
                  {station.station_name}
                </h2>
                <p className="mt-0.5 text-xs text-gray-500">
                  {station.address}
                </p>
              </div>
              <button
                type="button"
                aria-label="닫기"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            <label className="block text-sm font-semibold" htmlFor="obs-name">
              성명
            </label>
            <input
              id="obs-name"
              type="text"
              value={name}
              maxLength={50}
              onChange={(e) => setName(e.target.value)}
              placeholder="홍길동"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#FF6B00] focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/30"
            />

            <label
              className="mt-4 block text-sm font-semibold"
              htmlFor="obs-phone"
            >
              연락처
            </label>
            <input
              id="obs-phone"
              type="tel"
              inputMode="tel"
              value={phone}
              maxLength={30}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="010-0000-0000"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#FF6B00] focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/30"
            />

            <label className="mt-4 flex items-start gap-2 rounded-md border border-gray-200 bg-gray-50 p-3 text-xs text-gray-700">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-[#FF6B00]"
              />
              <span>
                <strong className="font-bold">개인정보 수집 동의 (필수)</strong>
                <br />
                수집항목: 성명, 연락처, 참관 희망 투표소 / 이용목적: 참관인
                배정 및 연락 / 보유기간: 선거 종료 후 3개월
              </span>
            </label>

            {msg && (
              <p
                className={`mt-3 rounded border p-2 text-xs ${
                  msg.type === "ok"
                    ? "border-green-300 bg-green-50 text-green-700"
                    : "border-red-300 bg-red-50 text-red-700"
                }`}
              >
                {msg.text}
              </p>
            )}

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-md border border-gray-300 px-5 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={pending || !agree || !name.trim() || !phone.trim()}
                className="flex-1 rounded-md bg-[#FF6B00] px-5 py-3 text-sm font-bold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {pending ? "제출 중..." : "제출"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
