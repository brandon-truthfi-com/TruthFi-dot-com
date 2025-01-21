"use client"

import { useState, useEffect } from "react" // ADDED USESTATE AND USEEFFECT
import { TrendingDown, TrendingUp } from "lucide-react"
import { CartesianGrid, Legend, Line, LineChart, XAxis, YAxis } from "recharts"
import LoadingBanner from '../components/LoadingBanner'; // IMPORT LOADING BANNER

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { GroupedPredictionData, TimeInterval } from "@/services/demo-api"
import { DateTime } from "luxon"

interface MultilineTimeChartProps {
  symbol: string
  startTimeISO: string
  endTimeISO: string
  interval: TimeInterval
  predictions: GroupedPredictionData[]
  iconUrl: string
}

const chartConfig = {
  positive: {
    label: "Positive",
    color: "hsl(var(--chart-1))",
  },
  negative: {
    label: "Negative",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

export function MultilineTimeChart({ symbol, iconUrl, startTimeISO, endTimeISO, interval, predictions }: MultilineTimeChartProps) {
  const [isLoading, setIsLoading] = useState(true) // ADDED LOADING STATE

  // USEEFFECT TO TRANSFORM PREDICTIONS AND SET LOADING STATE
  useEffect(() => {
    if (predictions.length > 0) {
      setIsLoading(false) // SET LOADING TO FALSE ONCE PREDICTIONS ARE AVAILABLE
    }
  }, [predictions]) // DEPENDENCY ON PREDICTIONS

  const startDate = DateTime.fromISO(startTimeISO)
  const endDate = DateTime.fromISO(endTimeISO)
  const dateRange = `${startDate.toFormat('MMM d, yyyy')} - ${endDate.toFormat('MMM d, yyyy')}`

  // SHOW LOADING BANNER UNTIL CHART DATA IS READY
  if (isLoading) {
    return <LoadingBanner message="Loading chart data, please wait..." /> // ADDED LOADING BANNER
  }

  // Transform predictions data to show percentages but keep original counts
  const chartData = predictions.map(pred => {
    const total = pred.countPositive + pred.countNegative
    const positivePercentage = (pred.countPositive / total) * 100
    const negativePercentage = (pred.countNegative / total) * 100

    // Calculate both single date and date range formats
    const startDate = DateTime.fromISO(pred.timestamp)
    const endDate = startDate.plus({ [interval]: 1 }).minus({ days: 1 })

    return {
      timestamp: startDate.toFormat('MMM d'),
      dateRange: interval === 'day'
        ? startDate.toFormat('MMM d')
        : `${startDate.toFormat('MMM d')} - ${endDate.toFormat('MMM d')}`,
      positive: Number(positivePercentage.toFixed(1)),
      negative: Number(negativePercentage.toFixed(1)),
      positiveCount: pred.countPositive,
      negativeCount: pred.countNegative
    }
  })

  // Custom tooltip formatter
  const tooltipFormatter = (value: number, name: string, props: any) => {
    const count = name === 'positive' ? props.payload.positiveCount : props.payload.negativeCount
    const label = chartConfig[name as keyof typeof chartConfig].label
    return [`${value.toFixed(1)}% (${count.toLocaleString()} predictions)`, label]
  }

  // Custom tooltip label formatter
  const tooltipLabelFormatter = (label: string, payload: any[]) => {
    if (payload[0]) {
      return payload[0].payload.dateRange
    }
    return label
  }

  // Calculate trend percentage for positive predictions
  const trendPercentage = predictions.length >= 2
    ? ((predictions[predictions.length - 1].countPositive / (predictions[predictions.length - 1].countPositive + predictions[predictions.length - 1].countNegative) * 100) -
      (predictions[0].countPositive / (predictions[0].countPositive + predictions[0].countNegative) * 100)).toFixed(1)
    : 0

  const fetchData = async () => {
    const response = await fetch('/api/data');
    const data = await response.json();
    // Use the data here
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <img src={iconUrl} alt={symbol} className="w-10 h-10 rounded-md" />
          Sentiment Distribution for {symbol}
        </CardTitle>
        <CardDescription>{dateRange}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
              bottom: 24,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="timestamp"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              domain={[Math.min(...chartData.map(d => d.positive)), Math.max(...chartData.map(d => d.positive))]}
              tickFormatter={(value) => `${value}%`}
            />
            <Legend
              verticalAlign="top"
              height={36}
              formatter={(value) => chartConfig[value as keyof typeof chartConfig].label}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent
                formatter={tooltipFormatter}
                labelFormatter={tooltipLabelFormatter}
              />}
            />
            <Line
              dataKey="positive"
              type="monotone"
              stroke="var(--color-positive)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="negative"
              type="monotone"
              stroke="var(--color-negative)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              Positive sentiment trending {Number(trendPercentage) >= 0 ? 'up' : 'down'} over this range
              {Number(trendPercentage) >= 0 ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground font-bold">
              Showing sentiment distribution for {symbol}
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
