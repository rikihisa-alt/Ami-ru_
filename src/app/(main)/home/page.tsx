"use client";

import { useQuery } from "@tanstack/react-query";
import { useSupabase, useUser } from "@/providers/supabase-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Sparkles,
} from "lucide-react";
import Link from "next/link";

const expiryColors = {
  expired: "bg-red-50 text-red-400 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
  today: "bg-amber-50 text-amber-500 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
  soon: "bg-orange-50 text-orange-400 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800",
  ok: "bg-emerald-50 text-emerald-500 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800",
  none: "",
};

export default function HomePage() {
  const supabase = useSupabase();
  const { user, profile } = useUser();
  const pairId = profile?.pair_id;

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

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-pink-400" />
        <h1 className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-400 bg-clip-text text-transparent">
          {profile?.display_name || "ゲスト"}さん
        </h1>
      </div>

      <Link href="/calendar">
        <Card className="border-pink-100 bg-gradient-to-br from-white to-violet-50/50 transition-shadow hover:shadow-md dark:border-pink-900/30 dark:from-background dark:to-violet-950/20">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/40">
              <Calendar className="h-3.5 w-3.5 text-violet-500" />
            </div>
            <CardTitle className="text-sm font-medium">今日の予定</CardTitle>
          </CardHeader>
          <CardContent>
            {todayEvents?.length === 0 ? (
              <p className="text-sm text-muted-foreground">予定はありません</p>
            ) : (
              <ul className="space-y-1.5">
                {todayEvents?.map((event: { id: string; title: string; start_at: string; is_all_day: boolean }) => (
                  <li key={event.id} className="flex items-center gap-2 text-sm">
                    <Badge variant="secondary" className="bg-violet-50 text-violet-500 text-xs dark:bg-violet-900/30 dark:text-violet-300">
                      {event.is_all_day ? "終日" : formatDateTime(event.start_at).split(" ")[1]}
                    </Badge>
                    <span>{event.title}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </Link>

      {expiringItems && expiringItems.length > 0 && (
        <Link href="/pantry">
          <Card className="border-orange-100 bg-gradient-to-br from-white to-orange-50/30 transition-shadow hover:shadow-md dark:border-orange-900/30 dark:from-background dark:to-orange-950/20">
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/40">
                <Refrigerator className="h-3.5 w-3.5 text-orange-400" />
              </div>
              <CardTitle className="text-sm font-medium">期限が近い食材</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1.5">
                {expiringItems.map((item: { id: string; name: string; expiry_date: string }) => {
                  const status = getExpiryStatus(item.expiry_date);
                  return (
                    <li key={item.id} className="flex items-center justify-between text-sm">
                      <span>{item.name}</span>
                      <Badge variant="outline" className={cn("text-xs", expiryColors[status])}>
                        {getExpiryLabel(item.expiry_date)}
                      </Badge>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        </Link>
      )}

      <Link href="/board/todos">
        <Card className="border-emerald-100 bg-gradient-to-br from-white to-emerald-50/30 transition-shadow hover:shadow-md dark:border-emerald-900/30 dark:from-background dark:to-emerald-950/20">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
              <CheckSquare className="h-3.5 w-3.5 text-emerald-500" />
            </div>
            <CardTitle className="text-sm font-medium">今日のToDo</CardTitle>
          </CardHeader>
          <CardContent>
            {todayTodos?.length === 0 ? (
              <p className="text-sm text-muted-foreground">タスクはありません</p>
            ) : (
              <ul className="space-y-1.5">
                {todayTodos?.map((todo: { id: string; title: string }) => (
                  <li key={todo.id} className="flex items-center gap-2 text-sm">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    {todo.title}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </Link>

      <Link href="/money">
        <Card className="border-purple-100 bg-gradient-to-br from-white to-purple-50/30 transition-shadow hover:shadow-md dark:border-purple-900/30 dark:from-background dark:to-purple-950/20">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/40">
              <Wallet className="h-3.5 w-3.5 text-purple-500" />
            </div>
            <CardTitle className="text-sm font-medium">今月の精算</CardTitle>
          </CardHeader>
          <CardContent>
            {!settlement || settlement.amount === 0 ? (
              <p className="text-sm text-muted-foreground">精算なし</p>
            ) : (
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">{settlement.fromName}</span>
                <ArrowRight className="h-4 w-4 text-pink-400" />
                <span className="font-medium">{settlement.toName}</span>
                <span className="ml-auto font-bold text-pink-500">
                  {formatYen(settlement.amount)}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
