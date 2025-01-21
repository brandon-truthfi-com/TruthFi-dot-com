import { HydraClient } from "hydra-ai";
import { ComponentContextTool } from "hydra-ai/dist/hydra-ai/model/component-metadata";
import { CrowdSentimentChart } from "./components/crowd-sentiment-chart";
import { IndividualPredictionsChart } from "./components/individual-predictions-chart";
import { ChartSkeleton } from "./components/skeletons";
import { getAssetPredictions } from "./services/demo-api";
import { WelcomeCard } from "./components/WelcomeCard";
import PredictionList from "./components/PredictionList";



const hydra = new HydraClient({
    hydraApiKey: process.env.NEXT_PUBLIC_HYDRA_API_KEY,
    hydraApiUrl: "https://api.usehydra.ai",
});

export const initializeHydra = () => {
    hydra.registerComponent({
        name: "stock-sentiment-graph",
        description: "A component that displays a list of predictions for a given stock symbol (or index like S&P 500) grouped by time interval, where each prediction is a 'sentiment' of an individual. The predictions are grouped by the time interval specified in the props. You should usually request predictions over more than one time bucket. For example if the user asks about stock predictions last month you should use the start and end of the month as the time range and the interval should be daily or weekly. This can be used to help the user understand the sentiment of a stock over time. This is the most commonly reference componenet when asking for displays of aggregate predictions across equities. If the user does not specify a time region, default to the prior 1 month of time. The user will almost always input a time so only use this is a last resort if you cannot infer the time from their plain language. In some cases, there may not be any prediction data for a day, in which case the line will show a breakage. This is not okay for our users, so in these cases, please take the average sentiment ratios of the two surrounding time periods to ensure the chart is continuous. Only do this when you absolutely have to, this will be the vast minority of cases.",
        component: CrowdSentimentChart,
        propsDefinition: { symbol: "string which is the stock symbol", companyName: "string which is the single word company name", startTimeISO: "string which is the start time of the predictions to query", endTimeISO: "string which is the end time of the predictions to query", interval: "day | week | month,  which is the time interval of the predictions to query" },
        // contextTools: [sentimentContextTool],
        loadingComponent: ChartSkeleton
    });

    hydra.registerComponent({
        name: "individual-sentiment-chart",
        description: "A component that displays a list of predictions for a given stock symbol (or index like S&P 500) grouped by time interval, where each prediction is a 'sentiment' of an individual. The predictions are grouped by the time interval specified in the props. You should usually request predictions over more than one time bucket. For example if the user asks about stock predictions last month you should use the start and end of the month as the time range and the interval should be daily or weekly. This can be used to help the user understand the sentiment of a stock over time. If human name is provided, this is the component you should use",
        component: IndividualPredictionsChart,
        propsDefinition: { symbol: "string which is the stock symbol.", companyName: "string which is the single word company name", startTimeISO: "string which is the start time of the predictions to query", endTimeISO: "string which is the end time of the predictions to query", interval: "day | week | month,  which is the time interval of the predictions to query", 
            username: "'Cathie Wood' | 'Jim Cramer' | 'Bill Ackman' | 'Jason Calcanis' string which is the username of the user to filter the predictions by" },
        loadingComponent: ChartSkeleton
    });
    hydra.registerComponent({
        name: "welcome-card", // Unique name for the component
        description: "A customizable welcome card that greets the user and displays their role.",
        component: WelcomeCard, // The WelcomeCard component
        propsDefinition: {
          userName: "string which is the name of the user",
          role: "string which is the role of the user (optional)",
          age: "string which is defined by the user. If not given, please default to 40",
          theme: "light | dark (optional, defaults to 'light')",
        },
    });

    hydra.registerComponent({
        name: "prediction-list", // Unique name for the component
        description: "A component that fetches and displays a list of predictions for financial assets. When prompted by the user, please sum up the appropriate values of the all the predictions specified and return a summary answer. If they ask about how many predictions over a given time period, for example, how many last week, please fetch all the prediciton made over the last week and sum that number up. This is just one example. Please extrapolate this logic further to other time ranges. Only use this if the user is asking for a list of predictions specifically.",
        component: PredictionList, // The PredictionList component
        propsDefinition: {
          limit: "number which specifies the maximum number of api call pages to fetch. There are usually 100 predictions per page, so ensure to only fetch as many are needed for the time perdiod specified by the user.",
        },
    });
      
};

const sentimentContextTool: ComponentContextTool = {
    getComponentContext: async (params) => {
        const {
            symbol,
            startTimeISO,
            endTimeISO,
            interval,
            direction,
            aggregateType,
        } = params;

        // Fetch data from the API using existing logic
        const predictions = await getAssetPredictions(
            symbol,
            null, // CompanyName is not needed for API fetching
            startTimeISO,
            endTimeISO,
            interval
        );

        // Perform aggregation based on the requested type
        switch (aggregateType) {
            case "totalPredictions":
                return predictions.length;

            case "bullishPredictions":
                return predictions.filter((p) => p.direction === "long").length;

            case "bearishPredictions":
                return predictions.filter((p) => p.direction === "short").length;

            case "symbolSpecificPredictions":
                return predictions.filter((p) => p.asset === symbol).length;

            default:
                throw new Error("Invalid aggregateType provided.");
        }
    },
    definition: {
        name: "sentiment-context",
        description:
            "A tool that provides sentiment-related data for a given stock symbol over a time range and interval, including aggregates for predictions.",
        parameters: [
            {
                name: "symbol",
                type: "string",
                description: "Stock symbol (e.g., SPY) to fetch predictions for.",
                isRequired: false,
            },
            {
                name: "startTimeISO",
                type: "string",
                description: "Start time of the prediction data range in ISO format (e.g., 2024-12-01).",
                isRequired: true,
            },
            {
                name: "endTimeISO",
                type: "string",
                description: "End time of the prediction data range in ISO format (e.g., 2024-12-30).",
                isRequired: true,
            },
            {
                name: "interval",
                type: "string",
                description: "Time interval for grouping predictions (day, week, month).",
                isRequired: true,
            },
            {
                name: "direction",
                type: "string",
                description: "Filter predictions by direction (e.g., long, short).",
                isRequired: false,
            },
            {
                name: "aggregateType",
                type: "string",
                description:
                    "Specifies the type of aggregation to perform. Options: totalPredictions, bullishPredictions, bearishPredictions, symbolSpecificPredictions.",
                isRequired: true,
            },
        ],
    },
};


export default hydra;
