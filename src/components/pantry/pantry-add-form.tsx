"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { useAddPantryItem } from "@/lib/hooks/use-pantry";
import { PANTRY_CATEGORIES } from "@/lib/utils/categories";
import { toast } from "sonner";
import { Plus } from "lucide-react";

export function PantryAddForm() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [category, setCategory] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [memo, setMemo] = useState("");

  const addItem = useAddPantryItem();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await addItem.mutateAsync({
        name: name.trim(),
        quantity: quantity || undefined,
        category: category || undefined,
        expiry_date: expiryDate || undefined,
        memo: memo || undefined,
      });
      toast.success(`${name}を追加しました`);
      resetForm();
      setOpen(false);
    } catch {
      toast.error("追加に失敗しました");
    }
  };

  const resetForm = () => {
    setName("");
    setQuantity("");
    setCategory("");
    setExpiryDate("");
    setMemo("");
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          size="icon"
          className="fixed bottom-20 right-4 z-40 h-14 w-14 rounded-full bg-gradient-to-br from-pink-400 to-purple-400 shadow-lg shadow-pink-200/50 hover:from-pink-500 hover:to-purple-500 dark:shadow-pink-900/30"
        >
          <Plus className="h-6 w-6 text-white" />
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="mx-auto max-w-md rounded-t-3xl border-t-pink-100 dark:border-t-pink-900/30">
        <SheetHeader>
          <SheetTitle className="text-pink-600 dark:text-pink-400">食材を追加</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">食材名 *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: 牛乳"
              autoFocus
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="quantity">数量</Label>
              <Input
                id="quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="例: 1本"
              />
            </div>
            <div className="space-y-2">
              <Label>カテゴリ</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="選択" />
                </SelectTrigger>
                <SelectContent>
                  {PANTRY_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiryDate">賞味/消費期限</Label>
            <Input
              id="expiryDate"
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="memo">メモ</Label>
            <Input
              id="memo"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="メモ"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500"
            disabled={addItem.isPending}
          >
            {addItem.isPending ? "追加中..." : "追加する"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
