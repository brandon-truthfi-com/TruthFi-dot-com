"use client"

import { Button } from "@/components/ui/button"
import { GroupedPredictionData, TimeInterval } from "@/services/demo-api"
import { useState } from "react"
import { MultilineTimeChart } from "./chart-line-multiple"
import { SingleLineTimeChart } from "./chart-line-single"

interface ChartToggleProps {
    symbol: string
    startTimeISO: string
    endTimeISO: string
    interval: TimeInterval
    predictions: GroupedPredictionData[]
    iconUrl: string
}

export function ChartToggle(props: ChartToggleProps) {
    const [showPrice, setShowPrice] = useState(false)

    // Compute dynamic Y-axis range
    const yMin = Math.min(...props.predictions.map(p => p.countPositive || 0, p => p.countNegative || 0));
    const yMax = Math.max(...props.predictions.map(p => p.countPositive || 0, p => p.countNegative || 0));
    
    const dynamicOptions = {
        scales: {
            y: {
                min: yMin > 0 ? yMin - 5 : 0, // Ensure a buffer below the min value
                max: yMax + 5, // Add a buffer above the max value
            }
        }
    };

    return (
        <div className="w-full space-y-4">
            <div className="flex justify-end">
                <Button
                    variant="outline"
                    onClick={() => setShowPrice(!showPrice)}
                >
                    Show {showPrice ? 'Sentiment' : 'Price'} Chart
                </Button>
            </div>
            {showPrice ? (
                <SingleLineTimeChart
                    symbol={props.symbol}
                    username=""
                    iconUrl={props.iconUrl}
                    startTimeISO={props.startTimeISO}
                    endTimeISO={props.endTimeISO}
                    interval={props.interval}
                    predictions={props.predictions.map(p => ({
                        iconUrl: p.iconUrl,
                        symbol: props.symbol,
                        companyName: props.symbol,
                        username: "",
                        timestamp: p.timestamp,
                        actualPrice: p.actualPrice,
                        predictedDirection: "up"
                    }))}
                    onlyPrice={true}
                />
            ) : (
                <MultilineTimeChart
                    {...props}
                    options={dynamicOptions} // Pass the dynamic options for Y-axis
                />
            )}
        </div>
    )
}
