"use client"

import { CartesianGrid, Legend, Line, LineChart, XAxis, YAxis } from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import { IndividualPredictionData, TimeInterval } from "@/services/demo-api"
import { DateTime } from "luxon"

interface SingleLineTimeChartProps {
    symbol: string
    username: string,
    startTimeISO: string
    endTimeISO: string
    interval: TimeInterval
    predictions: IndividualPredictionData[]
    iconUrl: string
    onlyPrice?: boolean
    userIconUrl?: string
}

const chartConfig = {
    price: {
        label: "Price",
        color: "hsl(var(--chart-1))",
    },
} satisfies ChartConfig

export function SingleLineTimeChart({ symbol, iconUrl, startTimeISO, endTimeISO, interval, predictions, username, onlyPrice = false, userIconUrl = "https://pbs.twimg.com/profile_images/1782845672829423617/xuyhQIY5_400x400.jpg" }: SingleLineTimeChartProps) {
    const startDate = DateTime.fromISO(startTimeISO)
    const endDate = DateTime.fromISO(endTimeISO)
    const dateRange = `${startDate.toFormat('MMM d, yyyy')} - ${endDate.toFormat('MMM d, yyyy')}`

    // Transform predictions data to show price per interval
    const chartData = predictions.reduce<any[]>((acc, pred) => {
        const startDate = DateTime.fromISO(pred.timestamp)
        const endDate = startDate.plus({ [interval]: 1 }).minus({ days: 1 })

        const existingEntry = acc.find(entry => entry.timestamp === startDate.toFormat('MMM d'))

        if (existingEntry) {
            // Use the latest price for the interval
            existingEntry.price = pred.actualPrice
            existingEntry.predictions.push(pred)
        } else {
            acc.push({
                timestamp: startDate.toFormat('MMM d'),
                dateRange: interval === 'day'
                    ? startDate.toFormat('MMM d')
                    : `${startDate.toFormat('MMM d')} - ${endDate.toFormat('MMM d')}`,
                price: pred.actualPrice,
                predictions: [pred]
            })
        }

        return acc
    }, [])

    // Custom tooltip formatter
    const tooltipFormatter = (value: string | number, name: string, item: any, index: number) => {
        const predictions = item.payload.predictions;
        const prediction = predictions[predictions.length - 1];
        const direction = prediction.predictedDirection;
        const directionText = direction === 'up' ? 'bullish' : 'bearish';
        const directionColor = direction === 'up' ? 'text-green-500' : 'text-red-500';

        const numericValue = typeof value === 'string' ? parseFloat(value) : value;
        return (
            <div className="flex items-center gap-2">
                {!onlyPrice && <img src={userIconUrl} alt={username} className="w-10 h-10 rounded-full" />}
                <div>
                    <div>Price: ${numericValue.toFixed(2)}</div>
                    {!onlyPrice && <div className={`font-bold ${directionColor}`}>{directionText}</div>}
                </div>
            </div>
        )
    }

    // Custom tooltip label formatter
    const tooltipLabelFormatter = (label: string, payload: any[]) => {
        if (payload[0]) {
            return payload[0].payload.dateRange
        }
        return label
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <img src={iconUrl} alt={symbol} className="w-10 h-10 rounded-md" />
                    {symbol} price trend {!onlyPrice && `with predictions by ${username}`}
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
                            tickFormatter={(value) => `$${value.toFixed(2)}`} // Ensures proper formatting of numbers
                            domain={[
                                chartData.length > 0
                                    ? Math.min(...chartData.map(d => d.price))
                                    : 0, // Fallback minimum value
                                chartData.length > 0
                                    ? Math.max(...chartData.map(d => d.price))
                                    : 100, // Fallback maximum value
                            ]}
                        />

                        <Legend
                            verticalAlign="top"
                            height={36}
                            formatter={() => `${chartConfig.price.label} of ${symbol}`}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent
                                formatter={(value, name, item, index) => tooltipFormatter(value as string | number, name as string, item, index)}
                                labelFormatter={tooltipLabelFormatter}
                            />}
                        />
                        <Line
                            dataKey="price"
                            type="monotone"
                            stroke="var(--color-price)"
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
                            {onlyPrice ? "Hover to see price" : "Hover to see predictions"}
                        </div>
                    </div>
                </div>
            </CardFooter>
        </Card>
    )
} 