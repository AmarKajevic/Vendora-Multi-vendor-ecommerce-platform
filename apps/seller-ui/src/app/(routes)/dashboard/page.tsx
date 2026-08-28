"use client"

import React from "react";
import { motion } from "framer-motion";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Package,
  DollarSign,
  Users,
  ShoppingCart,
  Bell,
  PlusCircle,
  MoreHorizontal,
} from "lucide-react";

// ---------- STATIČKI PODACI ----------

const kpiData = [
  {
    title: "Total Revenue",
    value: "$45,231.89",
    change: "+20.1%",
    trend: "up",
    icon: DollarSign,
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
  },
  {
    title: "Orders",
    value: "1,234",
    change: "+12.5%",
    trend: "up",
    icon: ShoppingCart,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
  },
  {
    title: "Products",
    value: "56",
    change: "+3",
    trend: "up",
    icon: Package,
    color: "text-purple-400",
    bg: "bg-purple-400/10",
  },
  {
    title: "Active Customers",
    value: "789",
    change: "-2.1%",
    trend: "down",
    icon: Users,
    color: "text-rose-400",
    bg: "bg-rose-400/10",
  },
];

// Prodaja po zemljama – koordinate su sada eksplicitno `[number, number]`
const salesByCountry: Array<{
  country: string;
  sales: number;
  coordinates: [number, number];
}> = [
  { country: "US", sales: 120, coordinates: [-100, 40] },
  { country: "DE", sales: 85, coordinates: [10, 51] },
  { country: "GB", sales: 70, coordinates: [-3, 55] },
  { country: "FR", sales: 55, coordinates: [2, 47] },
  { country: "IT", sales: 40, coordinates: [12, 42] },
  { country: "ES", sales: 35, coordinates: [-4, 40] },
  { country: "CN", sales: 30, coordinates: [105, 35] },
  { country: "JP", sales: 25, coordinates: [138, 36] },
  { country: "AU", sales: 20, coordinates: [134, -25] },
  { country: "BR", sales: 15, coordinates: [-55, -15] },
];

const dailyRevenue = [
  { day: "Mon", revenue: 1200 },
  { day: "Tue", revenue: 900 },
  { day: "Wed", revenue: 1600 },
  { day: "Thu", revenue: 1400 },
  { day: "Fri", revenue: 2100 },
  { day: "Sat", revenue: 1800 },
  { day: "Sun", revenue: 1300 },
];

const monthlyRevenue = [
  { month: "Jan", revenue: 2800 },
  { month: "Feb", revenue: 3200 },
  { month: "Mar", revenue: 4000 },
  { month: "Apr", revenue: 3800 },
  { month: "May", revenue: 5100 },
  { month: "Jun", revenue: 4900 },
  { month: "Jul", revenue: 6200 },
  { month: "Aug", revenue: 5800 },
  { month: "Sep", revenue: 4500 },
  { month: "Oct", revenue: 4700 },
  { month: "Nov", revenue: 5300 },
  { month: "Dec", revenue: 6000 },
];

const recentOrders = [
  {
    id: "#12345",
    customer: "Marko Nikolić",
    date: "2026-08-25",
    total: "$127.50",
    status: "Delivered",
    items: 3,
  },
  {
    id: "#12346",
    customer: "Ana Jovanović",
    date: "2026-08-24",
    total: "$89.00",
    status: "Processing",
    items: 2,
  },
  {
    id: "#12347",
    customer: "Petar Petrović",
    date: "2026-08-24",
    total: "$210.30",
    status: "Cancelled",
    items: 5,
  },
  {
    id: "#12348",
    customer: "Jelena Stojanović",
    date: "2026-08-23",
    total: "$56.20",
    status: "Delivered",
    items: 1,
  },
  {
    id: "#12349",
    customer: "Milan Ristić",
    date: "2026-08-23",
    total: "$340.00",
    status: "Processing",
    items: 4,
  },
  {
    id: "#12350",
    customer: "Sofija Kovačević",
    date: "2026-08-22",
    total: "$95.75",
    status: "Delivered",
    items: 2,
  },
];

const topProducts = [
  { name: "Samsung Galaxy S22", sales: 124, revenue: "$18,600", stock: 45 },
  { name: "Apple AirPods Pro", sales: 98, revenue: "$14,700", stock: 32 },
  { name: "Sony WH-1000XM5", sales: 76, revenue: "$11,400", stock: 18 },
  { name: "Logitech MX Master 3", sales: 52, revenue: "$5,200", stock: 9 },
  { name: "Dyson V15", sales: 41, revenue: "$8,200", stock: 12 },
];

const activities = [
  { id: 1, text: "New order #12351 from Nikola Tesla", time: "5 min ago" },
  { id: 2, text: "Product 'Sony WH-1000XM5' is running low on stock", time: "1 hr ago" },
  { id: 3, text: "Customer Ana J. left a 5★ review", time: "2 hrs ago" },
  { id: 4, text: "Delivery for #12345 confirmed", time: "4 hrs ago" },
];

// ---------- KOMPONENTA ----------

const Page = () => {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.4 },
    }),
  };

  return (
    <div className="min-h-screen bg-[#0f1117] text-gray-200 p-6 lg:p-8 font-sans">
      {/* Gornja traka */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Welcome back, 👋
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Here’s a quick overview of your business
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="relative p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors">
            <Bell size={20} className="text-gray-300" />
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center font-bold text-white">
              3
            </span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition-colors">
            <PlusCircle size={16} />
            Add Product
          </button>
          <button className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors">
            <MoreHorizontal size={20} className="text-gray-300" />
          </button>
        </div>
      </div>

      {/* 1. KPI kartice */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {kpiData.map((item, idx) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={idx}
              custom={idx}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
              className="bg-[#1a1d27] rounded-2xl p-6 border border-[#2a2d3a] shadow-xl hover:shadow-2xl hover:border-blue-500/30 transition-all duration-300"
            >
              <div className="flex items-start justify-between">
                <div className={`p-3 rounded-xl ${item.bg}`}>
                  <Icon className={`w-6 h-6 ${item.color}`} />
                </div>
                <span
                  className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                    item.trend === "up"
                      ? "text-emerald-400 bg-emerald-400/10"
                      : "text-rose-400 bg-rose-400/10"
                  }`}
                >
                  {item.trend === "up" ? (
                    <TrendingUp size={12} />
                  ) : (
                    <TrendingDown size={12} />
                  )}
                  {item.change}
                </span>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-white">{item.value}</p>
                <p className="text-sm text-gray-400">{item.title}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 2. Mapa + linijski grafikon */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        {/* Mapa */}
        <div className="xl:col-span-2 bg-[#1a1d27] rounded-2xl p-6 border border-[#2a2d3a]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">
              🌍 Sales by Country
            </h2>
            <span className="text-xs text-gray-400">Last 30 days</span>
          </div>
          <div className="w-full h-[300px]">
            <ComposableMap
              projectionConfig={{ scale: 200, center: [0, 20] }}
              className="w-full h-full"
            >
              <Geographies geography="https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json">
                {({ geographies }) =>
                  geographies.map((geo) => (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill="#2a2d3a"
                      stroke="#3a3f4e"
                      strokeWidth={0.5}
                    />
                  ))
                }
              </Geographies>
              {salesByCountry.map(({ country, sales, coordinates }) => (
                <Marker key={country} coordinates={coordinates}>
                  <circle
                    r={Math.sqrt(sales) * 2.2}
                    fill="#60a5fa"
                    stroke="#1a1d27"
                    strokeWidth={2}
                    className="transition-all hover:fill-blue-300 cursor-pointer"
                  />
                  <text
                    textAnchor="middle"
                    y={-14}
                    style={{
                      fill: "#e5e7eb",
                      fontSize: "10px",
                      fontWeight: "bold",
                      textShadow: "0 1px 4px rgba(0,0,0,0.8)",
                    }}
                  >
                    {country} ({sales})
                  </text>
                </Marker>
              ))}
            </ComposableMap>
          </div>
        </div>

        {/* Linijski grafikon */}
        <div className="bg-[#1a1d27] rounded-2xl p-6 border border-[#2a2d3a]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">📈 Daily Revenue</h2>
            <span className="text-xs text-gray-400">This week</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={dailyRevenue}>
              <XAxis
                dataKey="day"
                stroke="#4b5563"
                tick={{ fill: "#9ca3af", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                stroke="#4b5563"
                tick={{ fill: "#9ca3af", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => `$${val}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "none",
                  borderRadius: "8px",
                  color: "#fff",
                }}
                labelStyle={{ color: "#9ca3af" }}
                formatter={(value) =>
                  value !== undefined ? `$${value}` : ""
                }
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#60a5fa"
                strokeWidth={3}
                dot={{ fill: "#60a5fa", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-400">
              Weekly total:{" "}
              <span className="text-white font-bold">
                $
                {dailyRevenue
                  .reduce((sum, d) => sum + d.revenue, 0)
                  .toLocaleString()}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* 3. Stubičasti grafikon (celom širinom) */}
      <div className="bg-[#1a1d27] rounded-2xl p-6 border border-[#2a2d3a] mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">
            📊 Monthly Revenue (2026)
          </h2>
          <span className="text-xs text-gray-400">Year‑to‑date</span>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={monthlyRevenue}>
            <XAxis
              dataKey="month"
              stroke="#4b5563"
              tick={{ fill: "#9ca3af", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              stroke="#4b5563"
              tick={{ fill: "#9ca3af", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(val) => `$${val}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1f2937",
                border: "none",
                borderRadius: "8px",
                color: "#fff",
              }}
              labelStyle={{ color: "#9ca3af" }}
              formatter={(value) =>
                value !== undefined ? `$${value}` : ""
              }
            />
            <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
              {monthlyRevenue.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    entry.revenue > 5000
                      ? "#34d399"
                      : entry.revenue > 4000
                      ? "#60a5fa"
                      : "#a78bfa"
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 4. Tabela + aktivnosti + top proizvodi */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-2 bg-[#1a1d27] rounded-2xl p-6 border border-[#2a2d3a]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">
              📋 Recent Orders
            </h2>
            <button className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
              View All
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-[#2a2d3a]">
                  <th className="pb-3 font-medium">ID</th>
                  <th className="pb-3 font-medium">Customer</th>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Total</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order, idx) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="border-b border-[#2a2d3a] hover:bg-[#252a36] transition-colors"
                  >
                    <td className="py-3 font-mono text-blue-400 text-xs">
                      {order.id}
                    </td>
                    <td className="py-3">{order.customer}</td>
                    <td className="py-3 text-gray-400 text-xs">{order.date}</td>
                    <td className="py-3 font-medium">{order.total}</td>
                    <td className="py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          order.status === "Delivered"
                            ? "bg-emerald-400/20 text-emerald-300"
                            : order.status === "Processing"
                            ? "bg-yellow-400/20 text-yellow-300"
                            : "bg-rose-400/20 text-rose-300"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-[#1a1d27] rounded-2xl p-6 border border-[#2a2d3a]">
          <h2 className="text-lg font-semibold text-white mb-4">
            🔔 Activity Feed
          </h2>
          <ul className="space-y-4">
            {activities.map((act) => (
              <li key={act.id} className="border-b border-[#2a2d3a] pb-3 last:border-0">
                <p className="text-sm text-gray-200">{act.text}</p>
                <span className="text-xs text-gray-500">{act.time}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-[#1a1d27] rounded-2xl p-6 border border-[#2a2d3a]">
          <h2 className="text-lg font-semibold text-white mb-4">
            🏆 Top Products
          </h2>
          <ul className="space-y-4">
            {topProducts.map((product, idx) => (
              <li key={idx} className="border-b border-[#2a2d3a] pb-3 last:border-0">
                <p className="text-sm font-medium text-white truncate">
                  {product.name}
                </p>
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>📦 {product.sales} sold</span>
                  <span>💰 {product.revenue}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full ${
                      product.stock < 10
                        ? "bg-rose-400/20 text-rose-300"
                        : "bg-emerald-400/20 text-emerald-300"
                    }`}
                  >
                    {product.stock} in stock
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Page;