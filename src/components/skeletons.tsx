import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ChartSkeleton() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Loading chart...</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2" >
          <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
          <div className="h-300 w-full bg-gray-200 rounded animate-pulse" />
        </div>
      </CardContent>
    </Card>
  );
}