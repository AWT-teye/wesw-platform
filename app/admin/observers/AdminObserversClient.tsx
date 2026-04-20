"use client";

import { useMemo, useState, useTransition } from "react";
import {
  deleteObserverApplication,
  updateObserverStatus,
  type ObserverStatus,
} from "./actions";

export type Station = {
  id: string;
  district: string;
  station_name: string;
  address: string;
  max_observers: number;
  current_observer_count: number;
};

export type Application = {
  id: string;
  station_id: string;
  name: string;
  phone: string;
  district: string;
  status: ObserverStatus;
  created_at: string;
};

const DISTRICTS = ["전체", "장안구", "권선구", "팔달구", "영통구"] as const;
const STATUSES: { value: "all" | ObserverStatus; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "pending", label: "대기중" },
  { value: "confirmed", label: "확정" },
  { value: "cancelled", label: "취소" },
];

const STATUS_STYLE: Record<ObserverStatus, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-green-100 text-green-700",
  cancelled: "bg-gray-200 text-gray-500",
};
const STATUS_LABEL: Record<ObserverStatus, string> = {
  pending: "대기중",
  confirmed: "확정",
  cancelled: "취소",
};

export default function AdminObserversClient({
  stations,
  applications,
}: {
  stations: Station[];
  applications: Application[];
}) {
  const [districtTab, setDistrictTab] =
    useState<(typeof DISTRICTS)[number]>("전체");
  const [statusTab, setStatusTab] =
    useState<"all" | ObserverStatus>("all");
  const [pending, startTransition] = useTransition();

  const stationMap = useMemo(() => {
    const m = new Map<string, Station>();
    stations.forEach((s) => m.set(s.id, s));
    return m;
  }, [stations]);

  const filtered = useMemo(() => {
    return applications.filter((a) => {
      if (districtTab !== "전체" && a.district !== districtTab) return false;
      if (statusTab !== "all" && a.status !== statusTab) return false;
      return true;
    });
  }, [applications, districtTab, statusTab]);

  const stationsForTab = useMemo(() => {
    return districtTab === "전체"
      ? stations
      : stations.filter((s) => s.district === districtTab);
  }, [stations, districtTab]);

  function handleChange(id: string, next: ObserverStatus) {
    startTransition(async () => {
      await updateObserverStatus(id, next);
    });
  }

  function handleDelete(id: string) {
    if (!window.confirm("이 신청을 완전히 삭제하시겠습니까?")) return;
    startTransition(async () => {
      await deleteObserverApplication(id);
    });
  }

  return (
    <div>
      {/* 구 탭 */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-3">
        {DISTRICTS.map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => setDistrictTab(d)}
            className={`rounded-t-md px-4 py-2 text-sm font-bold ${
              districtTab === d
                ? "bg-[#FF6B00] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      {/* 투표소 신청현황 요약 카드 */}
      <section className="mt-5">
        <h2 className="mb-2 text-sm font-extrabold text-gray-700">
          투표소별 신청현황
        </h2>
        {stationsForTab.length === 0 ? (
          <p className="rounded border border-dashed border-gray-300 bg-white p-4 text-sm text-gray-500">
            투표소가 없습니다.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {stationsForTab.map((s) => {
              const full = s.current_observer_count >= s.max_observers;
              return (
                <div
                  key={s.id}
                  className={`rounded-lg border p-3 text-xs ${
                    full
                      ? "border-red-200 bg-red-50"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <p className="truncate font-bold text-gray-800">
                    {s.station_name}
                  </p>
                  <p className="mt-0.5 text-[11px] text-gray-500">
                    {s.district}
                  </p>
                  <p
                    className={`mt-1 text-sm font-extrabold ${
                      full ? "text-red-600" : "text-[#FF6B00]"
                    }`}
                  >
                    {s.current_observer_count} / {s.max_observers}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 상태 필터 */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-gray-600">상태 필터</span>
        {STATUSES.map((s) => (
          <button
            key={s.value}
            type="button"
            onClick={() => setStatusTab(s.value)}
            className={`rounded-full px-3 py-1 text-xs font-bold ${
              statusTab === s.value
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {s.label}
          </button>
        ))}
        <span className="ml-auto text-xs text-gray-500">
          {filtered.length}건
        </span>
      </div>

      {/* 신청자 목록 */}
      <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">성명</th>
              <th className="px-4 py-3">연락처</th>
              <th className="px-4 py-3">투표소</th>
              <th className="px-4 py-3 whitespace-nowrap">신청일</th>
              <th className="px-4 py-3">상태</th>
              <th className="px-4 py-3">관리</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-gray-500"
                >
                  해당 조건의 신청자가 없습니다.
                </td>
              </tr>
            )}
            {filtered.map((a) => {
              const st = stationMap.get(a.station_id);
              return (
                <tr
                  key={a.id}
                  className="border-t border-gray-100 align-top"
                >
                  <td className="px-4 py-3 font-semibold">{a.name}</td>
                  <td className="px-4 py-3 font-mono text-xs">{a.phone}</td>
                  <td className="px-4 py-3 text-xs">
                    <p className="font-semibold text-gray-800">
                      {st?.station_name ?? "(삭제된 투표소)"}
                    </p>
                    <p className="text-gray-500">
                      {a.district}
                      {st?.address && ` · ${st.address}`}
                    </p>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">
                    {new Date(a.created_at).toLocaleString("ko-KR")}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-[11px] font-bold ${STATUS_STYLE[a.status]}`}
                    >
                      {STATUS_LABEL[a.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {a.status !== "confirmed" && (
                        <button
                          type="button"
                          disabled={pending}
                          onClick={() => handleChange(a.id, "confirmed")}
                          className="rounded border border-green-300 px-2 py-1 text-xs text-green-700 hover:bg-green-50 disabled:opacity-50"
                        >
                          확정
                        </button>
                      )}
                      {a.status !== "pending" && (
                        <button
                          type="button"
                          disabled={pending}
                          onClick={() => handleChange(a.id, "pending")}
                          className="rounded border border-yellow-300 px-2 py-1 text-xs text-yellow-700 hover:bg-yellow-50 disabled:opacity-50"
                        >
                          대기
                        </button>
                      )}
                      {a.status !== "cancelled" && (
                        <button
                          type="button"
                          disabled={pending}
                          onClick={() => handleChange(a.id, "cancelled")}
                          className="rounded border border-gray-300 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                          취소
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => handleDelete(a.id)}
                        className="rounded border border-red-300 px-2 py-1 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
