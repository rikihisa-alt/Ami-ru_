import type { SupabaseClient } from "@supabase/supabase-js";

export const todoKeys = {
  all: (pairId: string) => ["todos", pairId] as const,
  active: (pairId: string) => ["todos", pairId, "active"] as const,
  today: (pairId: string) => ["todos", pairId, "today"] as const,
};

export async function getActiveTodos(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("todos")
    .select("*")
    .neq("status", "done")
    .order("due_date", { ascending: true, nullsFirst: false });
  if (error) throw error;
  return data;
}

export async function getTodayTodos(supabase: SupabaseClient) {
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("todos")
    .select("*")
    .neq("status", "done")
    .or(`due_date.eq.${today},due_date.lt.${today}`)
    .order("priority", { ascending: false });
  if (error) throw error;
  return data;
}

export async function addTodo(
  supabase: SupabaseClient,
  todo: {
    pair_id: string;
    title: string;
    due_date?: string;
    assignee_id?: string;
    priority?: number;
    repeat_rule?: string;
    created_by: string;
  }
) {
  const { data, error } = await supabase
    .from("todos")
    .insert(todo)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function toggleTodoStatus(
  supabase: SupabaseClient,
  todoId: string,
  status: string
) {
  const { error } = await supabase
    .from("todos")
    .update({ status })
    .eq("id", todoId);
  if (error) throw error;
}

export async function updateTodo(
  supabase: SupabaseClient,
  todoId: string,
  updates: {
    title?: string;
    due_date?: string | null;
    assignee_id?: string | null;
    status?: string;
    priority?: number;
    repeat_rule?: string | null;
  }
) {
  const { error } = await supabase
    .from("todos")
    .update(updates)
    .eq("id", todoId);
  if (error) throw error;
}

export async function deleteTodo(supabase: SupabaseClient, todoId: string) {
  const { error } = await supabase.from("todos").delete().eq("id", todoId);
  if (error) throw error;
}
