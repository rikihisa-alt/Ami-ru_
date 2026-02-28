"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BulletinView from "./bulletin/page";
import TodosView from "./todos/page";
import PlacesView from "./places/page";

export default function BoardPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">ボード</h1>
      <Tabs defaultValue="bulletin">
        <TabsList className="w-full">
          <TabsTrigger value="bulletin" className="flex-1">
            掲示板
          </TabsTrigger>
          <TabsTrigger value="todos" className="flex-1">
            ToDo
          </TabsTrigger>
          <TabsTrigger value="places" className="flex-1">
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
