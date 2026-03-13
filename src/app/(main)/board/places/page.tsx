"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase, useUser } from "@/providers/supabase-provider";
import { placeKeys, getPlaces, addPlace, updatePlace, deletePlace } from "@/lib/queries/places";
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
import { PLACE_TAGS } from "@/lib/utils/categories";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Plus, MapPin, ExternalLink, Trash2 } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";

const statusLabels: Record<string, string> = {
  want_to_go: "行きたい",
  candidate: "候補",
  visited: "行った",
};

const statusColors: Record<string, string> = {
  want_to_go: "bg-violet-50 text-violet-500 border-violet-200 dark:bg-violet-950/40 dark:text-violet-300",
  candidate: "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300",
  visited: "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300",
};

export default function PlacesView() {
  const supabase = useSupabase();
  const { user, profile } = useUser();
  const queryClient = useQueryClient();
  const pairId = profile?.pair_id;
  const queryKey = placeKeys.all(pairId ?? "");

  useRealtimeSubscription("places", queryKey, pairId);

  const { data: places } = useQuery({
    queryKey,
    queryFn: () => getPlaces(supabase),
    enabled: !!pairId,
  });

  const addMutation = useMutation({
    mutationFn: (place: {
      name: string;
      url?: string;
      area?: string;
      tags?: string[];
      memo?: string;
    }) => {
      if (!pairId || !user) throw new Error("ペアに参加してください");
      return addPlace(supabase, { ...place, pair_id: pairId, created_by: user.id });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ placeId, updates }: { placeId: string; updates: { status?: string } }) =>
      updatePlace(supabase, placeId, updates),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const deleteMutation = useMutation({
    mutationFn: (placeId: string) => deletePlace(supabase, placeId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const [formOpen, setFormOpen] = useState(false);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [area, setArea] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [memo, setMemo] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const filteredPlaces = places?.filter(
    (p: { status: string }) => statusFilter === "all" || p.status === statusFilter
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await addMutation.mutateAsync({
        name: name.trim(),
        url: url || undefined,
        area: area || undefined,
        tags: tags.length > 0 ? tags : undefined,
        memo: memo || undefined,
      });
      toast.success("スポットを追加しました");
      setName("");
      setUrl("");
      setArea("");
      setTags([]);
      setMemo("");
      setFormOpen(false);
    } catch {
      // silent in demo mode
    }
  };

  const toggleTag = (tag: string) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="mt-4 space-y-3">
      <div className="flex gap-2">
        {["all", "want_to_go", "candidate", "visited"].map((s) => (
          <Button
            key={s}
            variant={statusFilter === s ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(s)}
          >
            {s === "all" ? "すべて" : statusLabels[s]}
          </Button>
        ))}
      </div>

      {!filteredPlaces?.length ? (
        <EmptyState
          icon={MapPin}
          title="行きたい場所を保存しよう"
          description="デートの候補をストック"
          action={{ label: "スポットを追加", onClick: () => setFormOpen(true) }}
        />
      ) : (
        filteredPlaces?.map(
          (place: {
            id: string;
            name: string;
            url: string | null;
            area: string | null;
            tags: string[];
            memo: string | null;
            status: string;
          }) => (
            <Card key={place.id} className="p-3">
              <div className="flex items-start gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{place.name}</span>
                    <Badge
                      variant="outline"
                      className={`text-xs ${statusColors[place.status]}`}
                    >
                      {statusLabels[place.status]}
                    </Badge>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {place.tags?.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {PLACE_TAGS.find((t) => t.value === tag)?.label ?? tag}
                      </Badge>
                    ))}
                    {place.area && (
                      <span className="text-xs text-muted-foreground">
                        {place.area}
                      </span>
                    )}
                  </div>
                  {place.memo && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {place.memo}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 gap-1">
                  {place.url && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                      asChild
                    >
                      <a
                        href={place.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  )}
                  <Select
                    value={place.status}
                    onValueChange={(status) =>
                      updateMutation.mutate({
                        placeId: place.id,
                        updates: { status },
                      })
                    }
                  >
                    <SelectTrigger className="h-7 w-auto border-0 px-1 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="want_to_go">行きたい</SelectItem>
                      <SelectItem value="candidate">候補</SelectItem>
                      <SelectItem value="visited">行った</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => setDeleteTarget(place.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </Card>
          )
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
            <SheetTitle>スポットを追加</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="placeName">場所名 *</Label>
              <Input
                id="placeName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例: 渋谷のカフェ"
                autoFocus
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="placeUrl">URL</Label>
              <Input
                id="placeUrl"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Google Map URL等"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="placeArea">エリア</Label>
              <Input
                id="placeArea"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="例: 渋谷"
              />
            </div>
            <div className="space-y-2">
              <Label>タグ</Label>
              <div className="flex flex-wrap gap-2">
                {PLACE_TAGS.map((tag) => (
                  <Badge
                    key={tag.value}
                    variant={tags.includes(tag.value) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleTag(tag.value)}
                  >
                    {tag.label}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="placeMemo">メモ</Label>
              <Input
                id="placeMemo"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="メモ"
              />
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
        title="このスポットを削除しますか？"
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
