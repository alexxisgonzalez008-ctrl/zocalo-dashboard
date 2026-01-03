
import { recalculateSchedule, isWorkday } from "./scheduler";
import { Task } from "./types";

const mockTasks: Task[] = [
    {
        id: "1", category: "Test", name: "A",
        start: "2025-12-01", end: "2025-12-01", // Monday (1 day)
        days: 1, status: "pending", dependencies: []
    },
    {
        id: "2", category: "Test", name: "B",
        start: "2025-12-02", end: "2025-12-02", // Tuesday (1 day)
        days: 1, status: "pending", dependencies: ["1"]
    }
];

const rainDays = ["2025-12-02"]; // Tuesday is rain

console.log("--- Test: Rain on Dependent Task ---");
const result = recalculateSchedule(mockTasks, rainDays);
result.forEach(t => console.log(`${t.name}: ${t.start} -> ${t.end}`));
// Expect A: 2025-12-01 (Mon). B: 2025-12-03 (Wed) because Tue is rain.

console.log("\n--- Test: Weekend Skip ---");
const weekTasks: Task[] = [
    {
        id: "3", category: "Test", name: "Fri",
        start: "2025-12-05", end: "2025-12-05", // Friday
        days: 1, status: "pending", dependencies: []
    },
    {
        id: "4", category: "Test", name: "Sat-Sun-Mon",
        start: "2025-12-06", end: "2025-12-06", // Should move to Mon 8
        days: 1, status: "pending", dependencies: ["3"]
    }
];
const res2 = recalculateSchedule(weekTasks, []);
res2.forEach(t => console.log(`${t.name}: ${t.start} -> ${t.end}`));
// Expect Fri: 12-05. Sat-Sun-Mon: 12-08 (Mon).
