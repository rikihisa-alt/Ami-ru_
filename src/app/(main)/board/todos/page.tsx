"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase, useUser } from "@/providers/supabase-provider";
import { todoKeys, getActiveTodos, addTodo, toggleTodoStatus, deleteTodo } from "@/lib/queries/todos";
import { useRealtimeSubscription } from "@/lib/hooks/use-realtime";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils/date";
import { cn } from "@/lib/utils";
import { Plus, Check, Trash2, CheckSquare, User } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";

export default function TodosView() {
  const supabase = useSupabase();
  const { user, profile } = useUser();
  const queryClient = useQueryClient();
  const pairId = profile?.pair_id;
  const queryKey = todoKeys.active(pairId ?? "");

  useRealtimeSubscription("todos", queryKey, pairId);

  const { data: todos } = useQuery({
    queryKey,
    queryFn: () => getActiveTodos(supabase),
    enabled: !!pairId,
  });

  const [partner, setPartner] = useState<{ id: string; display_name: string } | null>(null);

  useEffect(() => {
    if (!profile?.pair_id || !user) return;
    supabase
      .from("profiles")
      .select("id, display_name")
      .eq("pair_id", profile.pair_id)
      .neq("id", user.id)
      .single()
      .then(({ data }) => setPartner(data));
  }, [profile?.pair_id, user, supabase]);

  const addMutation = useMutation({
    mutationFn: (todo: { title: string; due_date?: string; assignee_id?: string; priority?: number }) =>
      addTodo(supabase, { ...todo, pair_id: pairId!, created_by: user!.id }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ todoId, status }: { todoId: string; status: string }) =>
      toggleTodoStatus(supabase, todoId, status),
    onMutate: async ({ todoId }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData(queryKey);
      queryClient.setQueryData(queryKey, (old: { id: string }[] | undefined) =>
        old?.filter((t) => t.id !== todoId)
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(queryKey, context?.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  const deleteMutation = useMutation({
    mutationFn: (todoId: string) => deleteTodo(supabase, todoId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const [formOpen, setFormOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      await addMutation.mutateAsync({
        title: title.trim(),
        due_date: dueDate || undefined,
        assignee_id: assigneeId || undefined,
      });
      toast.success("タスクを追加しました");
      setTitle("");
      setDueDate("");
      setAssigneeId("");
      setFormOpen(false);
    } catch {
      // silent in demo mode
    }
  };

  const today = new Date().toISOString().split("T")[0];
  const filteredTodos = todos?.filter((todo: { due_date: string | null; assignee_id: string | null }) => {
    if (filter === "today") return todo.due_date && todo.due_date <= today;
    if (filter === "mine") return todo.assignee_id === user?.id;
    if (filter === "partner") return todo.assignee_id === partner?.id;
    return true;
  });

  return (
    <div className="mt-4 space-y-3">
      <div className="flex gap-2">
        {["all", "today", "mine", "partner"].map((f) => (
          <Button
            key={f}
            variant={filter === f ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(f)}
          >
            {f === "all" ? "すべて" : f === "today" ? "今日" : f === "mine" ? "自分" : "相手"}
          </Button>
        ))}
      </div>

      {!filteredTodos?.length ? (
        <EmptyState
          icon={CheckSquare}
          title="ふたりのやることを管理しよう"
          description="忘れがちな家事もリスト化"
          action={{ label: "タスクを追加", onClick: () => setFormOpen(true) }}
        />
      ) : (
        filteredTodos?.map(
          (todo: {
            id: string;
            title: string;
            due_date: string | null;
            assignee_id: string | null;
            status: string;
            priority: number;
          }) => {
            const isOverdue = todo.due_date && todo.due_date < today;
            return (
              <Card key={todo.id} className="flex items-center gap-3 p-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 rounded-full border-2 border-border hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950"
                  onClick={() =>
                    toggleMutation.mutate({ todoId: todo.id, status: "done" })
                  }
                >
                  <Check className="h-4 w-4 opacity-0 hover:opacity-100" />
                </Button>
                <div className="min-w-0 flex-1">
                  <span className="text-sm font-medium">{todo.title}</span>
                  <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                    {todo.due_date && (
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs",
                          isOverdue
                            ? "bg-red-50 text-red-500 border-red-200 dark:bg-red-950/40 dark:text-red-300"
                            : "bg-violet-50 text-violet-500 border-violet-200 dark:bg-violet-950/40 dark:text-violet-300"
                        )}
                      >
                        {formatDate(todo.due_date)}
                      </Badge>
                    )}
                    {todo.assignee_id && (
                      <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                        <User className="h-3 w-3" />
                        {todo.assignee_id === user?.id
                          ? profile?.display_name
                          : partner?.display_name}
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => setDeleteTarget(todo.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </Card>
            );
          }
        )
      )}

      <Sheet open={formOpen} onOpenChange={setFormOpen}>
        <SheetTrigger asChild>
          <Button
            size="icon"
            className="fixed bottom-20 right-4 z-40 h-14 w-14 rounded-full shadow-lg lg:bottom-8"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="mx-auto max-w-lg rounded-t-2xl">
          <SheetHeader>
            <SheetTitle>タスクを追加</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="todoTitle">タイトル *</Label>
              <Input
                id="todoTitle"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例: ゴミ出し"
                autoFocus
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="todoDueDate">期限</Label>
                <Input
                  id="todoDueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>担当</Label>
                <Select value={assigneeId} onValueChange={setAssigneeId}>
                  <SelectTrigger>
                    <SelectValue placeholder="未定" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">未定</SelectItem>
                    <SelectItem value={user?.id ?? ""}>
                      {profile?.display_name || "自分"}
                    </SelectItem>
                    {partner && (
                      <SelectItem value={partner.id}>
                        {partner.display_name}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={addMutation.isPending}>
              {addMutation.isPending ? "追加中..." : "追加する"}
            </Button>
          </form>
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="このタスクを削除しますか？"
        onConfirm={() => {
          if (deleteTarget) {
            deleteMutation.mutate(deleteTarget);
            toast.success("削除しました");
          }
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
