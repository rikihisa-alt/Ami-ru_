"use client";

import { useQuery } from "@tanstack/react-query";
import { useSupabase, useUser } from "@/providers/supabase-provider";
import { Badge } from "@/components/ui/badge";
import { PrismCard } from "@/components/ui/prism-card";
import { getExpiryStatus, getExpiryLabel, formatDateTime } from "@/lib/utils/date";
import { formatYen } from "@/lib/utils/currency";
import { calculateSettlement } from "@/lib/utils/settlement";
import { cn } from "@/lib/utils";
import {
  Calendar,
  Refrigerator,
  CheckSquare,
  Wallet,
  ArrowRight,
  Sun,
  Cloud,
  Moon,
} from "lucide-react";
import Link from "next/link";
import { EmotionSelector } from "@/components/emotion/emotion-selector";
import { ThanksButton } from "@/components/emotion/thanks-button";

type TimeSlot = "morning" | "afternoon" | "evening";

function getTimeSlot(): TimeSlot {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 11) return "morning";
  if (hour >= 11 && hour < 17) return "afternoon";
  return "evening";
}

const GREETINGS: Record<TimeSlot, { text: string; icon: typeof Sun }> = {
  morning: { text: "おはよう", icon: Sun },
  afternoon: { text: "おつかれさま", icon: Cloud },
  evening: { text: "おかえり", icon: Moon },
};

const expiryColors = {
  expired: "bg-red-50 text-red-500 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800",
  today: "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
  soon: "bg-orange-50 text-orange-500 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800",
  ok: "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
  none: "",
};

function SectionIcon({ icon: Icon, color }: { icon: typeof Calendar; color: string }) {
  return (
    <div className={cn("flex h-8 w-8 items-center justify-center rounded-xl", color)}>
      <Icon className="h-4 w-4" />
    </div>
  );
}

export default function HomePage() {
  const supabase = useSupabase();
  const { user, profile } = useUser();
  const pairId = profile?.pair_id;
  const timeSlot = getTimeSlot();
  const greeting = GREETINGS[timeSlot];
  const GreetingIcon = greeting.icon;

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
        .eq("pair_id", pairId!)
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

  const EventsCard = (idx: number) => (
    <Link href="/calendar" key="events">
      <PrismCard hoverable animationIndex={idx}>
        <div className="flex items-center gap-2.5 pb-2">
          <SectionIcon icon={Calendar} color="bg-violet-100/80 text-violet-500 dark:bg-violet-900/30" />
          <p className="text-sm font-semibold">今日の予定</p>
        </div>
        {todayEvents?.length === 0 ? (
          <p className="text-sm text-muted-foreground">予定はありません</p>
        ) : (
          <ul className="space-y-1.5">
            {todayEvents?.map((event: { id: string; title: string; start_at: string; is_all_day: boolean }) => (
              <li key={event.id} className="flex items-center gap-2 text-sm">
                <Badge variant="secondary" className="rounded-full text-xs">
                  {event.is_all_day ? "終日" : formatDateTime(event.start_at).split(" ")[1]}
                </Badge>
                <span>{event.title}</span>
              </li>
            ))}
          </ul>
        )}
      </PrismCard>
    </Link>
  );

  const ExpiringCard = (idx: number) =>
    expiringItems && expiringItems.length > 0 ? (
      <Link href="/pantry" key="expiring">
        <PrismCard hoverable animationIndex={idx}>
          <div className="flex items-center gap-2.5 pb-2">
            <SectionIcon icon={Refrigerator} color="bg-orange-100/80 text-orange-500 dark:bg-orange-900/30" />
            <p className="text-sm font-semibold">期限が近い食材</p>
          </div>
          <ul className="space-y-1.5">
            {expiringItems.map((item: { id: string; name: string; expiry_date: string }) => {
              const status = getExpiryStatus(item.expiry_date);
              return (
                <li key={item.id} className="flex items-center justify-between text-sm">
                  <span>{item.name}</span>
                  <Badge variant="outline" className={cn("rounded-full text-xs", expiryColors[status])}>
                    {getExpiryLabel(item.expiry_date)}
                  </Badge>
                </li>
              );
            })}
          </ul>
        </PrismCard>
      </Link>
    ) : null;

  const TodosCard = (idx: number) => (
    <Link href="/board/todos" key="todos">
      <PrismCard hoverable animationIndex={idx}>
        <div className="flex items-center gap-2.5 pb-2">
          <SectionIcon icon={CheckSquare} color="bg-teal-100/80 text-teal-500 dark:bg-teal-900/30" />
          <p className="text-sm font-semibold">今日のToDo</p>
        </div>
        {todayTodos?.length === 0 ? (
          <p className="text-sm text-muted-foreground">タスクはありません</p>
        ) : (
          <ul className="space-y-1.5">
            {todayTodos?.map((todo: { id: string; title: string }) => (
              <li key={todo.id} className="flex items-center gap-2 text-sm">
                <div className="h-1.5 w-1.5 rounded-full bg-teal-400" />
                {todo.title}
              </li>
            ))}
          </ul>
        )}
      </PrismCard>
    </Link>
  );

  const SettlementCard = (idx: number) => (
    <Link href="/money" key="settlement">
      <PrismCard hoverable animationIndex={idx}>
        <div className="flex items-center gap-2.5 pb-2">
          <SectionIcon icon={Wallet} color="bg-sky-100/80 text-sky-500 dark:bg-sky-900/30" />
          <p className="text-sm font-semibold">今月の精算</p>
        </div>
        {!settlement || settlement.amount === 0 ? (
          <p className="text-sm text-muted-foreground">精算なし</p>
        ) : (
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium">{settlement.fromName}</span>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{settlement.toName}</span>
            <span className="ml-auto font-bold text-primary">
              {formatYen(settlement.amount)}
            </span>
          </div>
        )}
      </PrismCard>
    </Link>
  );

  const cardFactories = (() => {
    switch (timeSlot) {
      case "morning":
        return [EventsCard, ExpiringCard, TodosCard, SettlementCard];
      case "afternoon":
        return [TodosCard, ExpiringCard, SettlementCard, EventsCard];
      case "evening":
        return [SettlementCard, EventsCard, TodosCard, ExpiringCard];
    }
  })();

  let idx = 0;
  const orderedCards = cardFactories
    .map((factory) => {
      const card = factory(idx);
      if (card) idx++;
      return card;
    })
    .filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="flex items-center gap-2.5 motion-safe:animate-prism-fade-up">
        <GreetingIcon className="h-5 w-5 text-amber-400" />
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          {profile?.display_name || "ゲスト"}さん、{greeting.text}
        </h1>
      </div>

      {/* Emotion module */}
      <div className="space-y-3">
        <EmotionSelector />
        <ThanksButton />
      </div>

      {/* Info cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {orderedCards}
      </div>
    </div>
  );
}
