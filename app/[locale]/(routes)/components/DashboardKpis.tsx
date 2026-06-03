"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, TrendingUp, Users, Target, CheckCircle2, Clock } from "lucide-react";

interface LeadAnalytics {
  totalLeads: number;
  activeCount: number;
  convertedCount: number;
  lostCount: number;
  conversionRate: number;
  channelChartData: { name: string; value: number }[];
  leaderboard: { name: string; avatar: string; leads: number }[];
  funnelData: { name: string; value: number }[];
  avgResponseTimeHours: number;
}

interface DashboardKpisProps {
  data: LeadAnalytics;
}

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export function DashboardKpis({ data }: DashboardKpisProps) {
  return (
    <div className="space-y-6 mt-6">
      <h2 className="text-xl font-bold tracking-tight">Lead Performance Analytics</h2>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Inbound Leads
            </CardTitle>
            <div className="p-2 rounded-md bg-indigo-50 dark:bg-indigo-950/50">
              <TrendingUp className="h-4 w-4 text-indigo-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.totalLeads}</div>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span>{data.avgResponseTimeHours}h avg. response time</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Active Pipeline
            </CardTitle>
            <div className="p-2 rounded-md bg-amber-50 dark:bg-amber-950/50">
              <Target className="h-4 w-4 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-500">{data.activeCount}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Assigned & in execution stage
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Converted Leads
            </CardTitle>
            <div className="p-2 rounded-md bg-emerald-50 dark:bg-emerald-950/50">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-500">{data.convertedCount}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Leads successfully won
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Conversion Rate
            </CardTitle>
            <div className="p-2 rounded-md bg-violet-50 dark:bg-violet-950/50">
              <ArrowUpRight className="h-4 w-4 text-violet-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-violet-500">{data.conversionRate}%</div>
            <div className="w-full bg-secondary h-1.5 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-violet-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(data.conversionRate, 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visual Analytics row */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Leads by Source Chart */}
        <Card className="lg:col-span-1 flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-base font-bold">Leads by Channel</CardTitle>
            <CardDescription>Distribution of inbound lead sources</CardDescription>
          </CardHeader>
          <CardContent className="h-56 flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.channelChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.channelChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            {/* Donut Chart Legend */}
            <div className="absolute flex flex-col gap-1 items-start text-xs bottom-1 left-2">
              {data.channelChartData.map((d, index) => (
                <div key={d.name} className="flex items-center gap-1.5">
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-muted-foreground">{d.name} ({d.value})</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Lead Funnel Chart */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base font-bold">Lead Funnel Stage</CardTitle>
            <CardDescription>Number of active leads in each status</CardDescription>
          </CardHeader>
          <CardContent className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.funnelData}>
                <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sales Executives Leaderboard */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base font-bold">Sales Leaderboard</CardTitle>
            <CardDescription>Top executives by assigned lead load</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.leaderboard.map((exec, idx) => (
                <div key={exec.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="font-semibold text-sm text-muted-foreground w-4">
                      #{idx + 1}
                    </div>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={exec.avatar} />
                      <AvatarFallback className="bg-primary/10 text-xs">
                        {exec.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-xs font-semibold leading-none">{exec.name}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">Sales Executive</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {exec.leads} leads
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
