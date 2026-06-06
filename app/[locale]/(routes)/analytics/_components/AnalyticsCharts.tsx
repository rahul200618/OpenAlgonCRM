"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from "recharts";

const COLORS = ['#a855f7', '#2dd4bf', '#ec4899', '#facc15', '#6366f1'];

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function AnalyticsCharts({ data }: { data: any }) {
  if (!data) return null;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
      
      {/* KPI Cards */}
      <div className="col-span-full grid gap-4 md:grid-cols-3">
        <motion.div variants={itemVariants}>
          <Card className="glass-card bg-background/40 backdrop-blur-2xl border-white/10 dark:border-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Leads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">{data.totalLeads}</div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Card className="glass-card bg-background/40 backdrop-blur-2xl border-white/10 dark:border-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Conversion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">{data.conversionRate.toFixed(1)}%</div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Card className="glass-card bg-background/40 backdrop-blur-2xl border-white/10 dark:border-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Pipeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">{data.activeCount}</div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Funnel Chart */}
      <motion.div variants={itemVariants} className="col-span-4 h-full">
        <Card className="glass-card bg-background/40 backdrop-blur-2xl border-white/10 dark:border-white/10 h-full flex flex-col">
          <CardHeader>
            <CardTitle>Sales Funnel</CardTitle>
            <CardDescription>Leads distributed across pipeline stages.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.funnelData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
                <YAxis stroke="rgba(255,255,255,0.5)" />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                <Bar dataKey="value" fill="url(#colorUv)" radius={[4, 4, 0, 0]}>
                   {
                    data.funnelData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))
                   }
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Leads by Channel */}
      <motion.div variants={itemVariants} className="col-span-3 h-full">
        <Card className="glass-card bg-background/40 backdrop-blur-2xl border-white/10 dark:border-white/10 h-full flex flex-col">
          <CardHeader>
            <CardTitle>Lead Sources</CardTitle>
            <CardDescription>Where your prospects are coming from.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.channelChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {data.channelChartData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
