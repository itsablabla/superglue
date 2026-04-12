"use client";

import { Card } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { useTools } from "@/src/queries/tools";
import { useSystems } from "@/src/queries/systems";
import { ArrowRight, Blocks, Hammer } from "lucide-react";
import Link from "next/link";

export default function LandscapePage() {
  const { tools, isInitiallyLoading: toolsLoading } = useTools();
  const { systems, loading: systemsLoading } = useSystems();

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Landscape</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Overview of all systems and tools in your workspace.
        </p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Blocks className="h-4 w-4" />
            Systems ({systemsLoading ? "..." : systems.length})
          </h2>
          <Link
            href="/systems"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {systemsLoading ? (
            <Card className="p-4 col-span-full">
              <p className="text-sm text-muted-foreground text-center">Loading...</p>
            </Card>
          ) : systems.length === 0 ? (
            <Card className="p-4 col-span-full">
              <p className="text-sm text-muted-foreground text-center">No systems configured.</p>
            </Card>
          ) : (
            systems.map((system) => (
              <Link key={system.id} href={`/systems/${system.id}`}>
                <Card className="p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Blocks className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{system.id}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {system.url || "No endpoint"}
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Hammer className="h-4 w-4" />
            Tools ({toolsLoading ? "..." : tools.length})
          </h2>
          <Link
            href="/tools"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {toolsLoading ? (
            <Card className="p-4 col-span-full">
              <p className="text-sm text-muted-foreground text-center">Loading...</p>
            </Card>
          ) : tools.length === 0 ? (
            <Card className="p-4 col-span-full">
              <p className="text-sm text-muted-foreground text-center">No tools configured.</p>
            </Card>
          ) : (
            tools.slice(0, 12).map((tool) => (
              <Link key={tool.id} href={`/tools/${tool.id}`}>
                <Card className="p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Hammer className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{tool.id}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {tool.instruction?.slice(0, 60) || "No description"}
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))
          )}
        </div>
        {tools.length > 12 && (
          <Link
            href="/tools"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mt-3"
          >
            And {tools.length - 12} more tools <ArrowRight className="h-3 w-3" />
          </Link>
        )}
      </div>
    </div>
  );
}
