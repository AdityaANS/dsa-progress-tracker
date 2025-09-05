
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";

export default function DSAProgressTracker() {
  const [totalTarget, setTotalTarget] = useState(200);
  const [totalSolved, setTotalSolved] = useState(0);
  const [topics, setTopics] = useState([
    { name: "Arrays", target: 25, solved: 0 },
    { name: "Strings", target: 20, solved: 0 },
    { name: "Hashing", target: 15, solved: 0 },
    { name: "Linked Lists", target: 15, solved: 0 },
    { name: "Stacks & Queues", target: 15, solved: 0 },
    { name: "Trees", target: 20, solved: 0 },
    { name: "Graphs", target: 20, solved: 0 },
    { name: "Dynamic Programming", target: 30, solved: 0 },
  ]);

  const addSolved = (index) => {
    const updatedTopics = [...topics];
    if (updatedTopics[index].solved < updatedTopics[index].target) {
      updatedTopics[index].solved += 1;
      setTopics(updatedTopics);
      setTotalSolved(totalSolved + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-4">DSA Progress Tracker</h1>
      <Card className="mb-6 p-4">
        <CardContent>
          <h2 className="text-xl font-semibold mb-2">Overall Progress</h2>
          <Progress value={(totalSolved / totalTarget) * 100} className="mb-2" />
          <p>{totalSolved} / {totalTarget} problems solved</p>
        </CardContent>
      </Card>

      <h2 className="text-2xl font-semibold mb-4">Topics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {topics.map((topic, index) => (
          <Card key={index} className="p-4">
            <CardContent>
              <h3 className="text-lg font-semibold mb-2">{topic.name}</h3>
              <Progress value={(topic.solved / topic.target) * 100} className="mb-2" />
              <p>{topic.solved} / {topic.target} solved</p>
              <Button
                className="mt-2"
                onClick={() => addSolved(index)}
                disabled={topic.solved >= topic.target}
              >
                +1 Solved
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
