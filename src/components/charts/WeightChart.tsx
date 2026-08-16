"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type Point = { date: string; weight: number };

export function WeightChart({ data }: { data: Point[] }) {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <XAxis
            dataKey="date"
            tickFormatter={(v: string) => v.slice(5)}
            tick={{ fontSize: 11, fill: "#8b95a1" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={["dataMin - 2", "dataMax + 2"]}
            tickFormatter={(v: number) => v.toFixed(1)}
            tick={{ fontSize: 11, fill: "#8b95a1" }}
            axisLine={false}
            tickLine={false}
            width={44}
          />
          <Tooltip
            contentStyle={{
              background: "#f4f6f8",
              border: "none",
              borderRadius: 12,
              boxShadow: "6px 6px 14px #d7dbdd, -6px -6px 14px #ffffff",
              fontSize: 13,
            }}
            labelStyle={{ color: "#141a21", fontWeight: 700 }}
          />
          <Line
            type="monotone"
            dataKey="weight"
            stroke="#ff5722"
            strokeWidth={3}
            dot={{ r: 3, fill: "#ff5722", strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
