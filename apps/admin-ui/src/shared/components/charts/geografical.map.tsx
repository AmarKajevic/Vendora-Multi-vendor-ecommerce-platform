"use client"

import { useMemo, useState } from "react";
import { ClientOnly } from "@tanstack/react-router";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import worldTopology from "./data/countries.json"

type Market = {
  id: string;
  name: string;
  country: string;
  coordinates: [number, number];
  revenue: number;
  customers: number;
};

const markets: Market[] = [
  { id: "nyc", name: "New York", country: "United States", coordinates: [-74.0, 40.7], revenue: 128400, customers: 1842 },
  { id: "sfo", name: "San Francisco", country: "United States", coordinates: [-122.4, 37.8], revenue: 96200, customers: 1310 },
  { id: "mex", name: "Mexico City", country: "Mexico", coordinates: [-99.1, 19.4], revenue: 41800, customers: 720 },
  { id: "sao", name: "São Paulo", country: "Brazil", coordinates: [-46.6, -23.5], revenue: 57300, customers: 964 },
  { id: "lon", name: "London", country: "United Kingdom", coordinates: [-0.13, 51.5], revenue: 112700, customers: 1580 },
  { id: "ber", name: "Berlin", country: "Germany", coordinates: [13.4, 52.5], revenue: 78900, customers: 1104 },
  { id: "bel", name: "Belgrade", country: "Serbia", coordinates: [20.5, 44.8], revenue: 26400, customers: 431 },
  { id: "dxb", name: "Dubai", country: "UAE", coordinates: [55.3, 25.2], revenue: 64100, customers: 612 },
  { id: "lag", name: "Lagos", country: "Nigeria", coordinates: [3.4, 6.5], revenue: 22800, customers: 388 },
  { id: "bom", name: "Mumbai", country: "India", coordinates: [72.9, 19.1], revenue: 71500, customers: 2140 },
  { id: "sin", name: "Singapore", country: "Singapore", coordinates: [103.8, 1.35], revenue: 58600, customers: 702 },
  { id: "tyo", name: "Tokyo", country: "Japan", coordinates: [139.7, 35.7], revenue: 103300, customers: 1476 },
  { id: "syd", name: "Sydney", country: "Australia", coordinates: [151.2, -33.9], revenue: 47900, customers: 655 },
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function GeographicMap() {
  const [activeId, setActiveId] = useState<string | null>(null);

  const { maxRevenue, total, topMarkets } = useMemo(() => {
    const max = Math.max(...markets.map((m) => m.revenue));
    const sum = markets.reduce((acc, m) => acc + m.revenue, 0);
    const top = [...markets].sort((a, b) => b.revenue - a.revenue).slice(0, 5);
    return { maxRevenue: max, total: sum, topMarkets: top };
  }, []);

  const active = markets.find((m) => m.id === activeId) ?? null;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="text-base">Revenue by Region</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            {markets.length} active markets · {formatCurrency(total)} total
          </p>
        </div>
        <div className="hidden items-center gap-2 sm:flex">
          <span className="text-xs text-muted-foreground">Low</span>
          <div className="h-2 w-24 rounded-full bg-gradient-to-r from-chart-2/40 to-chart-1" />
          <span className="text-xs text-muted-foreground">High</span>
        </div>
      </CardHeader>

      <CardContent className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
        <div className="relative overflow-hidden rounded-xl border border-border bg-muted/20">
          <ClientOnly fallback={<div className="aspect-[2/1] w-full animate-pulse bg-muted/40" />}>
          <ComposableMap
            projection="geoEqualEarth"
            projectionConfig={{ scale: 165, center: [10, 12] }}
            width={800}
            height={400}
            style={{ width: "100%", height: "auto" }}
            aria-label="World map showing revenue by market"
          >
            <Geographies geography={worldTopology as never}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="var(--muted)"
                    stroke="var(--border)"
                    strokeWidth={0.5}
                    style={{
                      default: { outline: "none" },
                      hover: { fill: "var(--accent)", outline: "none" },
                      pressed: { outline: "none" },
                    }}
                  />
                ))
              }
            </Geographies>

            {markets.map((market) => {
              const scale = market.revenue / maxRevenue;
              const r = 4 + scale * 14;
              const isActive = activeId === market.id;
              return (
                <Marker
                  key={market.id}
                  coordinates={market.coordinates}
                  onMouseEnter={() => setActiveId(market.id)}
                  onMouseLeave={() => setActiveId(null)}
                  style={{ default: { cursor: "pointer" } }}
                >
                  <circle
                    r={r}
                    fill="var(--chart-1)"
                    fillOpacity={isActive ? 0.4 : 0.2}
                    stroke="var(--chart-1)"
                    strokeOpacity={isActive ? 0.9 : 0.45}
                    strokeWidth={1}
                  />
                  <circle r={isActive ? 3.5 : 2.5} fill="var(--chart-1)" />
                </Marker>
              );
            })}
          </ComposableMap>
          </ClientOnly>


          {active ? (
            <div className="pointer-events-none absolute left-4 top-4 rounded-lg border border-border/60 bg-background/95 px-3 py-2 text-xs shadow-xl backdrop-blur">
              <div className="font-medium text-foreground">{active.name}</div>
              <div className="text-muted-foreground">{active.country}</div>
              <div className="mt-1 font-mono font-medium text-foreground">
                {formatCurrency(active.revenue)}
              </div>
              <div className="text-muted-foreground">
                {active.customers.toLocaleString("en-US")} customers
              </div>
            </div>
          ) : null}
        </div>

        <div className="space-y-3">
          <div className="text-sm font-medium text-foreground">Top markets</div>
          {topMarkets.map((market) => {
            const share = Math.round((market.revenue / total) * 100);
            return (
              <button
                key={market.id}
                type="button"
                onMouseEnter={() => setActiveId(market.id)}
                onMouseLeave={() => setActiveId(null)}
                onFocus={() => setActiveId(market.id)}
                onBlur={() => setActiveId(null)}
                className={`w-full rounded-lg border p-3 text-left transition-colors ${
                  activeId === market.id
                    ? "border-chart-1/50 bg-accent"
                    : "border-border hover:bg-accent/60"
                }`}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-sm font-medium text-foreground">{market.name}</span>
                  <span className="font-mono text-sm text-foreground">
                    {formatCurrency(market.revenue)}
                  </span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-chart-1"
                    style={{ width: `${(market.revenue / maxRevenue) * 100}%` }}
                  />
                </div>
                <div className="mt-1.5 flex justify-between text-xs text-muted-foreground">
                  <span>{market.country}</span>
                  <span>{share}% of total</span>
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
