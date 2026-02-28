"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BulletinView from "./bulletin/page";
import TodosView from "./todos/page";
import PlacesView from "./places/page";
import { LayoutGrid } from "lucide-react";

export default function BoardPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <LayoutGrid className="h-5 w-5 text-pink-400" />
        <h1 className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-400 bg-clip-text text-transparent">ボード</h1>
      </div>
      <Tabs defaultValue="bulletin">
        <TabsList className="w-full bg-pink-50/50 dark:bg-pink-950/20">
          <TabsTrigger value="bulletin" className="flex-1 data-[state=active]:bg-white data-[state=active]:text-pink-500 dark:data-[state=active]:bg-background">
            掲示板
          </TabsTrigger>
          <TabsTrigger value="todos" className="flex-1 data-[state=active]:bg-white data-[state=active]:text-pink-500 dark:data-[state=active]:bg-background">
            ToDo
          </TabsTrigger>
          <TabsTrigger value="places" className="flex-1 data-[state=active]:bg-white data-[state=active]:text-pink-500 dark:data-[state=active]:bg-background">
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
