import { SingleLineTimeChart } from "@/components/chart-line-single";
import { getIndividualPredictions, IndividualPredictionData, TimeInterval } from "@/services/demo-api";
import { useEffect, useState } from "react";

export interface IndividualPredictionsChartProps {
    symbol: string;
    companyName: string;
    startTimeISO: string;
    endTimeISO: string;
    interval: TimeInterval;
    username: string;
}

export const IndividualPredictionsChart = ({ symbol, companyName, startTimeISO, endTimeISO, interval, username }: IndividualPredictionsChartProps) => {
    const [predictions, setPredictions] = useState<IndividualPredictionData[]>([]);

    useEffect(() => {
        const fetchPredictions = async () => {
            const predictions = await getIndividualPredictions(symbol, companyName, startTimeISO, endTimeISO, interval, username);
            setPredictions(predictions);
        };
        fetchPredictions();
    }, [symbol, startTimeISO, endTimeISO, interval, username]);

    return (
        <div className="w-full max-w-4xl mx-auto">
            <SingleLineTimeChart
                symbol={symbol}
                iconUrl={predictions[0]?.iconUrl}
                startTimeISO={startTimeISO}
                endTimeISO={endTimeISO}
                interval={interval}
                predictions={predictions}
                username={username}
                userIconUrl={predictions[0]?.userIconUrl}
            />
        </div>
    );
};