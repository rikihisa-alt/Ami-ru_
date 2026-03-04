"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BulletinView from "./bulletin/page";
import TodosView from "./todos/page";
import PlacesView from "./places/page";
import { LayoutGrid } from "lucide-react";

export default function BoardPage() {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2.5 motion-safe:animate-prism-fade-up">
        <LayoutGrid className="h-5 w-5 text-rose-400" />
        <h1 className="text-xl font-bold tracking-tight text-foreground">ボード</h1>
      </div>
      <Tabs defaultValue="bulletin">
        <TabsList className="w-full rounded-xl">
          <TabsTrigger value="bulletin" className="flex-1 rounded-lg">
            掲示板
          </TabsTrigger>
          <TabsTrigger value="todos" className="flex-1 rounded-lg">
            ToDo
          </TabsTrigger>
          <TabsTrigger value="places" className="flex-1 rounded-lg">
            行きたい
          </TabsTrigger>
        </TabsList>
        <TabsContent value="bulletin">
          <BulletinView />
        </TabsContent>
        <TabsContent value="todos">
          <TodosView />
        </TabsContent>
        <TabsContent value="places">
          <PlacesView />
        </TabsContent>
      </Tabs>
    </div>
  );
}
