"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

const COLORS = {
  protein: "#ff5722",
  carbs: "#0d6efd",
  fat: "#ffb020",
};

export function MacroDonutChart({
  proteinG,
  carbsG,
  fatG,
}: {
  proteinG: number;
  carbsG: number;
  fatG: number;
}) {
  const data = [
    { key: "protein", value: proteinG, color: COLORS.protein },
    { key: "carbs", value: carbsG, color: COLORS.carbs },
    { key: "fat", value: fatG, color: COLORS.fat },
  ].filter((d) => d.value > 0);

  return (
    <div className="h-24 w-24 shrink-0">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="key"
            innerRadius="68%"
            outerRadius="100%"
            paddingAngle={3}
            stroke="none"
            startAngle={90}
            endAngle={-270}
          >
            {data.map((d) => (
              <Cell key={d.key} fill={d.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
