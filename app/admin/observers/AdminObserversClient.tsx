"use client";

import { useMemo, useState, useTransition } from "react";
import {
  createStation,
  deleteObserverApplication,
  deleteStation,
  updateObserverStatus,
  updateStation,
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
  residence: string | null;
  is_party_member: boolean;
  status: ObserverStatus;
  created_at: string;
};

// 구 탭 — 가나다순: 권선구, 영통구, 장안구, 팔달구 (+ 전체)
const DISTRICTS = ["전체", "권선구", "영통구", "장안구", "팔달구"] as const;

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

function formatResidence(r: string | null): string {
  if (!r) return "-";
  switch (r) {
    case "수원시권선구":
      return "수원시 권선구";
    case "수원시영통구":
      return "수원시 영통구";
    case "수원시장안구":
      return "수원시 장안구";
    case "수원시팔달구":
      return "수원시 팔달구";
    case "수원외":
      return "수원 외";
    default:
      return r;
  }
}

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

  function handleStatusChange(id: string, next: ObserverStatus) {
    startTransition(async () => {
      await updateObserverStatus(id, next);
    });
  }

  function handleDeleteApp(id: string) {
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

      {/* 투표소 관리 섹션 */}
      <section className="mt-5">
        <div className="mb-2 flex items-baseline justify-between">
          <h2 className="text-sm font-extrabold text-gray-700">
            투표소 관리 {districtTab !== "전체" && `(${districtTab})`}
          </h2>
          <span className="text-xs text-gray-500">
            {stationsForTab.length}곳
          </span>
        </div>

        {districtTab !== "전체" && (
          <AddStationForm district={districtTab} pending={pending} />
        )}

        {stationsForTab.length === 0 ? (
          <p className="rounded border border-dashed border-gray-300 bg-white p-4 text-sm text-gray-500">
            투표소가 없습니다.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {stationsForTab.map((s) => (
              <StationRow
                key={s.id}
                station={s}
                editable={districtTab !== "전체"}
                pending={pending}
              />
            ))}
          </ul>
        )}
      </section>

      {/* 상태 필터 */}
      <div className="mt-8 flex flex-wrap items-center gap-2">
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
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-3 py-3">성명</th>
              <th className="px-3 py-3">연락처</th>
              <th className="px-3 py-3">거주지</th>
              <th className="px-3 py-3 text-center">당원여부</th>
              <th className="px-3 py-3">투표소</th>
              <th className="px-3 py-3 whitespace-nowrap">신청일</th>
              <th className="px-3 py-3">상태</th>
              <th className="px-3 py-3">관리</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={8}
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
                  <td className="px-3 py-3 font-semibold">{a.name}</td>
                  <td className="px-3 py-3 font-mono text-xs">{a.phone}</td>
                  <td className="px-3 py-3 text-xs text-gray-700">
                    {formatResidence(a.residence)}
                  </td>
                  <td className="px-3 py-3 text-center">
                    {a.is_party_member ? (
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-bold text-green-700">
                        당원
                      </span>
                    ) : (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-bold text-gray-500">
                        비당원
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-xs">
                    <p className="font-semibold text-gray-800">
                      {st?.station_name ?? "(삭제된 투표소)"}
                    </p>
                    <p className="text-gray-500">
                      {a.district}
                      {st?.address && ` · ${st.address}`}
                    </p>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-xs text-gray-500">
                    {new Date(a.created_at).toLocaleString("ko-KR")}
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-[11px] font-bold ${STATUS_STYLE[a.status]}`}
                    >
                      {STATUS_LABEL[a.status]}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-1">
                      {a.status !== "confirmed" && (
                        <button
                          type="button"
                          disabled={pending}
                          onClick={() => handleStatusChange(a.id, "confirmed")}
                          className="rounded border border-green-300 px-2 py-1 text-xs text-green-700 hover:bg-green-50 disabled:opacity-50"
                        >
                          확정
                        </button>
                      )}
                      {a.status !== "pending" && (
                        <button
                          type="button"
                          disabled={pending}
                          onClick={() => handleStatusChange(a.id, "pending")}
                          className="rounded border border-yellow-300 px-2 py-1 text-xs text-yellow-700 hover:bg-yellow-50 disabled:opacity-50"
                        >
                          대기
                        </button>
                      )}
                      {a.status !== "cancelled" && (
                        <button
                          type="button"
                          disabled={pending}
                          onClick={() => handleStatusChange(a.id, "cancelled")}
                          className="rounded border border-gray-300 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                          취소
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => handleDeleteApp(a.id)}
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

// ───── 투표소 추가 폼 ─────
function AddStationForm({
  district,
  pending,
}: {
  district: string;
  pending: boolean;
}) {
  const [stationName, setStationName] = useState("");
  const [address, setAddress] = useState("");
  const [, startTransition] = useTransition();
  const [msg, setMsg] = useState<string>("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    if (!stationName.trim()) {
      setMsg("투표소명을 입력해 주세요.");
      return;
    }
    startTransition(async () => {
      const r = await createStation({
        district,
        station_name: stationName,
        address,
      });
      if ("error" in r && r.error) {
        setMsg(r.error);
      } else {
        setStationName("");
        setAddress("");
        setMsg("추가되었습니다.");
      }
    });
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mb-3 flex flex-wrap items-end gap-2 rounded-lg border border-gray-200 bg-white p-3"
    >
      <div className="grow min-w-[180px]">
        <label className="block text-xs font-semibold text-gray-600">
          투표소명
        </label>
        <input
          type="text"
          value={stationName}
          onChange={(e) => setStationName(e.target.value)}
          placeholder="예: 권선구청 제1투표소"
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
      </div>
      <div className="grow min-w-[220px]">
        <label className="block text-xs font-semibold text-gray-600">
          주소
        </label>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="경기도 수원시 ..."
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-[#FF6B00] px-4 py-2 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50"
      >
        추가
      </button>
      {msg && (
        <p className="w-full text-xs text-gray-600">{msg}</p>
      )}
    </form>
  );
}

// ───── 투표소 행 (인라인 편집 + 삭제) ─────
function StationRow({
  station,
  editable,
  pending,
}: {
  station: Station;
  editable: boolean;
  pending: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(station.station_name);
  const [address, setAddress] = useState(station.address);
  const [, startTransition] = useTransition();
  const [msg, setMsg] = useState("");
  const full = station.current_observer_count >= station.max_observers;

  function handleSave() {
    setMsg("");
    startTransition(async () => {
      const r = await updateStation(station.id, {
        station_name: name,
        address,
      });
      if ("error" in r && r.error) {
        setMsg(r.error);
      } else {
        setEditing(false);
      }
    });
  }

  function handleCancel() {
    setName(station.station_name);
    setAddress(station.address);
    setEditing(false);
    setMsg("");
  }

  function handleDelete() {
    if (station.current_observer_count > 0) {
      if (
        !window.confirm(
          `현재 ${station.current_observer_count}명의 신청자가 있는 투표소입니다. 그래도 삭제를 시도하시겠습니까?`
        )
      ) {
        return;
      }
    } else if (
      !window.confirm(`'${station.station_name}' 투표소를 삭제하시겠습니까?`)
    ) {
      return;
    }
    setMsg("");
    startTransition(async () => {
      const r = await deleteStation(station.id);
      if ("error" in r && r.error) {
        setMsg(r.error);
      }
    });
  }

  return (
    <li
      className={`rounded-lg border p-3 ${
        full ? "border-red-200 bg-red-50" : "border-gray-200 bg-white"
      }`}
    >
      {editing ? (
        <div className="flex flex-wrap items-end gap-2">
          <div className="grow min-w-[180px]">
            <label className="block text-[11px] font-semibold text-gray-500">
              투표소명
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-0.5 w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
            />
          </div>
          <div className="grow min-w-[220px]">
            <label className="block text-[11px] font-semibold text-gray-500">
              주소
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="mt-0.5 w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
            />
          </div>
          <button
            type="button"
            onClick={handleSave}
            disabled={pending}
            className="rounded-md bg-[#FF6B00] px-3 py-1.5 text-xs font-bold text-white hover:opacity-90 disabled:opacity-50"
          >
            저장
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-100"
          >
            취소
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <div className="grow min-w-0">
            <p className="truncate font-bold text-gray-800">
              {station.station_name}
              <span className="ml-2 text-[11px] font-normal text-gray-500">
                {station.district}
              </span>
            </p>
            <p className="truncate text-xs text-gray-500">
              {station.address || "(주소 없음)"}
            </p>
          </div>
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
              full
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {station.current_observer_count} / {station.max_observers}
          </span>
          {editable && (
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="rounded border border-gray-300 px-2 py-1 text-xs text-gray-700 hover:bg-gray-100"
              >
                수정
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={pending}
                className="rounded border border-red-300 px-2 py-1 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                삭제
              </button>
            </div>
          )}
        </div>
      )}
      {msg && (
        <p className="mt-2 rounded border border-red-300 bg-red-50 p-2 text-xs text-red-700">
          {msg}
        </p>
      )}
    </li>
  );
}
