import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/ui/header";
import { useState } from "react";

import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Ban, UserRound } from "lucide-react";

export default function InstructorConsultations() {
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const cards = [
    {
      id: 1,
      title: "Chapter 1 Revisions",
      author: "Nick Xylan Melloria",
      time: "17:00",
      date: "10/03/2024",
      sectionC: "T106",
      subjectC: "IT137",
    },
    {
      id: 2,
      title: "Grade Consultation",
      author: "Fern Aila Asinero",
      time: "17:15",
      date: "10/03/2024",
      sectionC: "T106",
      subjectC: "IT137",
    },
  ];
  return (
    <section className="space-y-5">
      <div>
        <Tabs defaultValue="Upcoming" className="space-y-5">
          <div className="flex justify-between">
            <Header>Instructor Consultations</Header>
            <TabsList className="self-end">
              <TabsTrigger
                className="cursor-pointer data-[state=active]:text-custom-primary data-[state=active]:border-b-custom-primary border-2 data-[state=active]:bg-custom-secondary rounded-none data-[state=active]:shadow-none data-[state=active]:text-shadow-none"
                value="Upcoming"
              >
                Upcoming
              </TabsTrigger>
              <TabsTrigger
                className="cursor-pointer data-[state=active]:text-custom-primary data-[state=active]:border-b-custom-primary border-2 data-[state=active]:bg-custom-secondary rounded-none data-[state=active]:shadow-none data-[state=active]:text-shadow-none"
                value="Requests"
              >
                Requests
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent
            className="flex justify-start flex-row gap-3"
            value="Upcoming"
          >
            <div className="flex flex-col gap-3">
              {cards.map((card) => (
                <Card
                  key={card.id}
                  className={`w-fit cursor-pointer hover:shadow-md transition
                    ${
                      selectedCard === card.id
                        ? "border-l-5 border-l-custom-primary"
                        : "border border-transparent"
                    }`}
                  onClick={() => setSelectedCard(card.id)}
                >
                  <CardContent className="flex items-center gap-20">
                    <div className="flex items-center gap-3">
                      <UserRound className="w-8 h-8" />
                      <ItemContent>
                        <ItemTitle>{card.title}</ItemTitle>
                        <ItemDescription>{card.author}</ItemDescription>
                      </ItemContent>
                    </div>
                    <div>
                      <ItemTitle>{card.time}</ItemTitle>
                      <ItemDescription>{card.date}</ItemDescription>
                    </div>

                    <div className="flex gap-2">
                      <Item variant="outline">{card.sectionC}</Item>
                      <Item variant="outline">{card.subjectC}</Item>
                    </div>

                    <div className="flex items-center gap-4">
                      <Button
                        size="icon-sm"
                        className="rounded-full"
                        variant={"outline"}
                        aria-label="Invite"
                      >
                        <Ban />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div>
              {selectedCard && (
                <Card className="w-fit">
                  <CardContent>
                    <h1>Consultation Details</h1>
                    <h2 className="text-lg font-semibold">
                      {cards.find((c) => c.id === selectedCard)?.title}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Details about this submission...
                    </p>
                    <Button
                      className="mt-3"
                      onClick={() => setSelectedCard(null)}
                    >
                      Close
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="Requests">Requests</TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
