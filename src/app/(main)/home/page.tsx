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
} from "lucide-react";
import Link from "next/link";

const expiryColors = {
  expired: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  today: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  soon: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  ok: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  none: "",
};

export default function HomePage() {
  const supabase = useSupabase();
  const { user, profile } = useUser();
  const pairId = profile?.pair_id;

  // Today's events
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

  // Expiring pantry items
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

  // Today's todos
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

  // This month's settlement
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

      // Get partner
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
      <h1 className="text-xl font-bold">
        こんにちは、{profile?.display_name || "ゲスト"}さん
      </h1>

      {/* Today's Events */}
      <Link href="/calendar">
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <Calendar className="h-4 w-4 text-blue-500" />
            <CardTitle className="text-sm font-medium">今日の予定</CardTitle>
          </CardHeader>
          <CardContent>
            {todayEvents?.length === 0 ? (
              <p className="text-sm text-muted-foreground">予定はありません</p>
            ) : (
              <ul className="space-y-1">
                {todayEvents?.map((event: { id: string; title: string; start_at: string; is_all_day: boolean }) => (
                  <li key={event.id} className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">
                      {event.is_all_day ? "終日" : formatDateTime(event.start_at).split(" ")[1]}
                    </span>
                    <span>{event.title}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </Link>

      {/* Expiring Items */}
      {expiringItems && expiringItems.length > 0 && (
        <Link href="/pantry">
          <Card className="border-orange-200 dark:border-orange-800">
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
              <Refrigerator className="h-4 w-4 text-orange-500" />
              <CardTitle className="text-sm font-medium">
                期限が近い食材
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1">
                {expiringItems.map((item: { id: string; name: string; expiry_date: string }) => {
                  const status = getExpiryStatus(item.expiry_date);
                  return (
                    <li key={item.id} className="flex items-center justify-between text-sm">
                      <span>{item.name}</span>
                      <Badge
                        variant="secondary"
                        className={cn("text-xs", expiryColors[status])}
                      >
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

      {/* Today's Todos */}
      <Link href="/board/todos">
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <CheckSquare className="h-4 w-4 text-green-500" />
            <CardTitle className="text-sm font-medium">今日のToDo</CardTitle>
          </CardHeader>
          <CardContent>
            {todayTodos?.length === 0 ? (
              <p className="text-sm text-muted-foreground">タスクはありません</p>
            ) : (
              <ul className="space-y-1">
                {todayTodos?.map((todo: { id: string; title: string }) => (
                  <li key={todo.id} className="text-sm">
                    {todo.title}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </Link>

      {/* Settlement */}
      <Link href="/money">
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <Wallet className="h-4 w-4 text-purple-500" />
            <CardTitle className="text-sm font-medium">今月の精算</CardTitle>
          </CardHeader>
          <CardContent>
            {!settlement || settlement.amount === 0 ? (
              <p className="text-sm text-muted-foreground">精算なし</p>
            ) : (
              <div className="flex items-center gap-2 text-sm">
                <span>{settlement.fromName}</span>
                <ArrowRight className="h-4 w-4" />
                <span>{settlement.toName}</span>
                <span className="ml-auto font-bold">
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
