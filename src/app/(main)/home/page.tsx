"use client";

import { useQuery } from "@tanstack/react-query";
import { useSupabase, useUser } from "@/providers/supabase-provider";
import { getExpiryStatus, getExpiryLabel, formatDateTime } from "@/lib/utils/date";
import { formatYen } from "@/lib/utils/currency";
import { calculateSettlement } from "@/lib/utils/settlement";
import { cn } from "@/lib/utils";
import {
  Calendar,
  Package,
  CheckSquare,
  Wallet,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { EmotionSelector } from "@/components/emotion/emotion-selector";
import { ThanksButton } from "@/components/emotion/thanks-button";

/* ── 挨拶 ── */
type TimeSlot = "morning" | "afternoon" | "evening";

function getTimeSlot(): TimeSlot {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 11) return "morning";
  if (hour >= 11 && hour < 17) return "afternoon";
  return "evening";
}

const GREETINGS: Record<TimeSlot, string> = {
  morning: "おはよう",
  afternoon: "おつかれさま",
  evening: "おかえり",
};

/* ── 期限ステータスの色 ── */
const expiryDot: Record<string, string> = {
  expired: "bg-red-500",
  today: "bg-amber-500",
  soon: "bg-orange-400",
  ok: "bg-emerald-500",
  none: "bg-neutral-300",
};

export default function HomePage() {
  const supabase = useSupabase();
  const { user, profile } = useUser();
  const pairId = profile?.pair_id;
  const timeSlot = getTimeSlot();

  const { data: todayEvents } = useQuery({
    queryKey: ["home", "events", pairId],
    queryFn: async () => {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();
      const { data } = await supabase
        .from("calendar_events")
        .select("*")
        .gte("start_at", startOfDay)
        .lt("start_at", endOfDay)
        .order("start_at");
      return data ?? [];
    },
    enabled: !!pairId,
  });

  const { data: expiringItems } = useQuery({
    queryKey: ["home", "expiring", pairId],
    queryFn: async () => {
      const threeDaysLater = new Date();
      threeDaysLater.setDate(threeDaysLater.getDate() + 3);
      const { data } = await supabase
        .from("pantry_items")
        .select("*")
        .eq("status", "active")
        .not("expiry_date", "is", null)
        .lte("expiry_date", threeDaysLater.toISOString().split("T")[0])
        .order("expiry_date");
      return data ?? [];
    },
    enabled: !!pairId,
  });

  const { data: todayTodos } = useQuery({
    queryKey: ["home", "todos", pairId],
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      const { data } = await supabase
        .from("todos")
        .select("*")
        .neq("status", "done")
        .or(`due_date.eq.${today},due_date.lt.${today}`)
        .order("priority", { ascending: false });
      return data ?? [];
    },
    enabled: !!pairId,
  });

  const { data: settlement } = useQuery({
    queryKey: ["home", "settlement", pairId],
    queryFn: async () => {
      const now = new Date();
      const startDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
      const endMonth = now.getMonth() === 11 ? 1 : now.getMonth() + 2;
      const endYear = now.getMonth() === 11 ? now.getFullYear() + 1 : now.getFullYear();
      const endDate = `${endYear}-${String(endMonth).padStart(2, "0")}-01`;

      const { data: expenses } = await supabase
        .from("expenses")
        .select("*")
        .gte("date", startDate)
        .lt("date", endDate);

      if (!expenses?.length || !user) return null;

      const { data: partner } = await supabase
        .from("profiles")
        .select("id, display_name")
        .eq("pair_id", pairId ?? "")
        .neq("id", user.id)
        .single();

      if (!partner) return null;

      const result = calculateSettlement(expenses, user.id, partner.id);
      return {
        ...result,
        fromName: result.fromUser === user.id ? profile?.display_name : partner.display_name,
        toName: result.toUser === user.id ? profile?.display_name : partner.display_name,
      };
    },
    enabled: !!pairId && !!user,
  });

  return (
    <div className="motion-safe:animate-page-in">
      {/* Greeting — simple text */}
      <h1 className="text-[22px] font-bold tracking-tight text-foreground">
        {profile?.display_name || "ゲスト"}さん、{GREETINGS[timeSlot]}
      </h1>

      {/* Emotion */}
      <div className="mt-4 space-y-2">
        <EmotionSelector />
        <ThanksButton />
      </div>

      {/* ── Sections: 1col mobile / 2col desktop ── */}
      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* ── 今日の予定 ── */}
        <HomeSection title="今日の予定" icon={Calendar} href="/calendar">
          {todayEvents?.length === 0 ? (
            <p className="px-4 py-3 text-[14px] text-muted-foreground">予定はありません</p>
          ) : (
            <ul>
              {todayEvents?.map((event: { id: string; title: string; start_at: string; is_all_day: boolean }) => (
                <li key={event.id} className="flex items-center gap-3 px-4 py-2.5">
                  <span className="min-w-[42px] text-[13px] text-muted-foreground">
                    {event.is_all_day ? "終日" : formatDateTime(event.start_at).split(" ")[1]}
                  </span>
                  <span className="text-[15px] text-foreground">{event.title}</span>
                </li>
              ))}
            </ul>
          )}
        </HomeSection>

        {/* ── 今日のToDo ── */}
        <HomeSection title="今日のToDo" icon={CheckSquare} href="/board/todos">
          {todayTodos?.length === 0 ? (
            <p className="px-4 py-3 text-[14px] text-muted-foreground">タスクはありません</p>
          ) : (
            <ul>
              {todayTodos?.map((todo: { id: string; title: string }) => (
                <li key={todo.id} className="flex items-center gap-3 px-4 py-2.5">
                  <div className="h-[18px] w-[18px] rounded-full border-[1.5px] border-border flex-shrink-0" />
                  <span className="text-[15px] text-foreground">{todo.title}</span>
                </li>
              ))}
            </ul>
          )}
        </HomeSection>

        {/* ── 期限が近い食材 ── */}
        {expiringItems && expiringItems.length > 0 && (
          <HomeSection title="期限が近いストック" icon={Package} href="/pantry">
            <ul>
              {expiringItems.map((item: { id: string; name: string; expiry_date: string }) => {
                const status = getExpiryStatus(item.expiry_date);
                return (
                  <li key={item.id} className="flex items-center justify-between px-4 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className={cn("h-2 w-2 rounded-full", expiryDot[status])} />
                      <span className="text-[15px] text-foreground">{item.name}</span>
                    </div>
                    <span className={cn(
                      "text-[13px]",
                      status === "expired" ? "text-red-500" :
                      status === "today" ? "text-amber-600" :
                      "text-muted-foreground"
                    )}>
                      {getExpiryLabel(item.expiry_date)}
                    </span>
                  </li>
                );
              })}
            </ul>
          </HomeSection>
        )}

        {/* ── 今月の精算 ── */}
        <HomeSection title="今月の精算" icon={Wallet} href="/money">
          {!settlement || settlement.amount === 0 ? (
            <p className="px-4 py-3 text-[14px] text-muted-foreground">精算なし</p>
          ) : (
            <div className="flex items-center gap-2 px-4 py-3">
              <span className="text-[15px] font-medium text-foreground">{settlement.fromName}</span>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-[15px] font-medium text-foreground">{settlement.toName}</span>
              <span className="ml-auto text-[15px] font-semibold text-primary">
                {formatYen(settlement.amount)}
              </span>
            </div>
          )}
        </HomeSection>
      </div>
    </div>
  );
}

/* ── Section component ── */
function HomeSection({
  title,
  icon: Icon,
  href,
  children,
}: {
  title: string;
  icon: typeof Calendar;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <Link
        href={href}
        className="flex items-center justify-between px-1 pb-2"
      >
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">
            {title}
          </h2>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
      </Link>
      <div className="rounded-xl border border-border bg-card">
        {children}
      </div>
    </section>
  );
}
