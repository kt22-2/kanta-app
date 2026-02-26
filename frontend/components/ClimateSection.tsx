"use client";

import useSWR from "swr";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { CloudRain } from "lucide-react";
import { getClimateInfo } from "@/lib/api";

const MONTH_LABELS = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];

interface Props {
  code: string;
}

export default function ClimateSection({ code }: Props) {
  const { data, isLoading } = useSWR(
    ["climate", code],
    () => getClimateInfo(code),
    { revalidateOnFocus: false }
  );

  if (isLoading) {
    return (
      <div className="rounded-xl glass-card p-5 animate-pulse">
        <div className="h-4 w-24 bg-background rounded mb-4" />
        <div className="h-48 bg-background rounded" />
      </div>
    );
  }

  if (!data || !data.available || data.monthly.length === 0) {
    return (
      <div className="rounded-xl glass-card p-5">
        <div className="flex items-center gap-2 mb-2">
          <CloudRain className="h-4 w-4 text-accent" />
          <span className="text-xs font-semibold text-muted uppercase tracking-wide">気候</span>
        </div>
        <p className="text-sm text-muted">気候データを取得できませんでした</p>
      </div>
    );
  }

  const chartData = data.monthly.map((m) => ({
    month: MONTH_LABELS[m.month - 1],
    "最高気温": m.temp_max !== null ? Math.round(m.temp_max * 10) / 10 : null,
    "最低気温": m.temp_min !== null ? Math.round(m.temp_min * 10) / 10 : null,
    "降水量": m.precipitation !== null ? Math.round(m.precipitation) : null,
  }));

  const tooltipStyle = {
    backgroundColor: "#1C2D3E",
    border: "1px solid #C8A96E",
    borderRadius: "8px",
    color: "#F5F5F0",
    fontSize: "12px",
  };

  return (
    <div className="rounded-xl glass-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <CloudRain className="h-4 w-4 text-accent" />
        <span className="text-xs font-semibold text-muted uppercase tracking-wide">月別気候（2023年）</span>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#263545" />
          <XAxis
            dataKey="month"
            tick={{ fill: "#8899AA", fontSize: 10 }}
            tickLine={false}
            axisLine={{ stroke: "#263545" }}
          />
          <YAxis
            yAxisId="temp"
            tick={{ fill: "#8899AA", fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            unit="°"
          />
          <YAxis
            yAxisId="precip"
            orientation="right"
            tick={{ fill: "#8899AA", fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            unit="mm"
          />
          <Tooltip
            contentStyle={tooltipStyle}
            labelStyle={{ color: "#C8A96E", fontWeight: "bold" }}
            cursor={{ fill: "rgba(200,169,110,0.06)" }}
          />
          <Legend
            wrapperStyle={{ fontSize: "11px", color: "#8899AA", paddingTop: "8px" }}
          />
          <Bar
            yAxisId="precip"
            dataKey="降水量"
            fill="#3B82F6"
            opacity={0.6}
            radius={[2, 2, 0, 0]}
          />
          <Line
            yAxisId="temp"
            type="monotone"
            dataKey="最高気温"
            stroke="#C8A96E"
            strokeWidth={2}
            dot={{ fill: "#C8A96E", r: 3 }}
            activeDot={{ r: 5 }}
          />
          <Line
            yAxisId="temp"
            type="monotone"
            dataKey="最低気温"
            stroke="#64B5F6"
            strokeWidth={2}
            dot={{ fill: "#64B5F6", r: 3 }}
            activeDot={{ r: 5 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
