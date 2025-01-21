import { ChartToggle } from "@/components/chart-toggle";
import { getAssetPredictions, GroupedPredictionData, TimeInterval } from "@/services/demo-api";
import { useEffect, useState } from "react";

export interface CrowdSentimentChartProps {
    symbol: string;
    companyName: string;
    startTimeISO: string;
    endTimeISO: string;
    interval: TimeInterval;
}

export const CrowdSentimentChart = ({ symbol, companyName, startTimeISO, endTimeISO, interval }: CrowdSentimentChartProps) => {
    const [predictions, setPredictions] = useState<GroupedPredictionData[]>([]);

    useEffect(() => {
        const fetchPredictions = async () => {
            const predictions = await getAssetPredictions(symbol, companyName, startTimeISO, endTimeISO, interval);
            setPredictions(predictions);
        };
        fetchPredictions();
    }, [symbol, startTimeISO, endTimeISO, interval]);

    return (
        <div className="w-full max-w-4xl mx-auto">
            <ChartToggle
                symbol={symbol}
                iconUrl={predictions[0]?.iconUrl}
                startTimeISO={startTimeISO}
                endTimeISO={endTimeISO}
                interval={interval}
                predictions={predictions}
            />
        </div>
    )
};