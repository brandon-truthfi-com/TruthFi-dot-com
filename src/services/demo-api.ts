import { DateTime } from 'luxon';
import { fetchPredictions } from './api'; // Import API call and interface

export type TimeInterval = 'day' | 'week' | 'month';

export interface GroupedPredictionData {
    iconUrl: string;
    timestamp: string;
    count: number;
    countPositive: number;
    countNegative: number;
    actualPrice: number;
}

export interface IndividualPredictionData {
    iconUrl: string;
    symbol: string;
    companyName: string;
    username: string;
    timestamp: string;
    actualPrice: number;
    predictedDirection: 'up' | 'down';
    userIconUrl?: string;
}

const USE_MOCK_DATA = false; // Toggle to switch between mock and API data

const userIconUrls = {
    'cathie wood': 'https://pbs.twimg.com/profile_images/1782845672829423617/xuyhQIY5_400x400.jpg',
    'jim cramer': 'https://pbs.twimg.com/profile_images/1461426655046606860/PzlSk4fZ_400x400.jpg',
    'bill ackman': 'https://pbs.twimg.com/profile_images/1619837521059348481/9UeNLFmD_400x400.jpg',
    'jason calcanis': 'https://pbs.twimg.com/profile_images/1828870492633104384/o37xorx4_400x400.jpg',
};

const generateMockIndividualPredictions = (
    symbol: string,
    companyName: string,
    startTimeISO: string,
    endTimeISO: string,
    interval: TimeInterval,
    username: string
): IndividualPredictionData[] => {
    const mockPredictionData: IndividualPredictionData[] = [];
    const start = DateTime.fromISO(startTimeISO);
    const end = DateTime.fromISO(endTimeISO);

    let cursor = start;
    while (cursor < end) {
        const nextDate = interval === 'day'
            ? cursor.plus({ days: 1 })
            : interval === 'week'
                ? cursor.plus({ weeks: 1 })
                : cursor.plus({ months: 1 });

        mockPredictionData.push({
            iconUrl: `https://img.logo.dev/${companyName}.com?token=${process.env.NEXT_PUBLIC_LOGO_API_KEY}`,
            symbol,
            companyName,
            username,
            timestamp: cursor.toISO()!,
            actualPrice: 100 + Math.random() * 900,
            predictedDirection: Math.random() < 0.5 ? 'up' : 'down',
            userIconUrl: userIconUrls[username.toLowerCase() as keyof typeof userIconUrls]
        });

        cursor = nextDate;
    }

    return mockPredictionData;
};

const generateMockGroupedPredictions = (
    symbol: string,
    companyName: string,
    startTimeISO: string,
    endTimeISO: string,
    interval: TimeInterval
): GroupedPredictionData[] => {
    const mockPredictionData: GroupedPredictionData[] = [];
    const start = DateTime.fromISO(startTimeISO);
    const end = DateTime.fromISO(endTimeISO);

    let cursor = start;
    while (cursor < end) {
        const nextDate = interval === 'day'
            ? cursor.plus({ days: 1 })
            : interval === 'week'
                ? cursor.plus({ weeks: 1 })
                : cursor.plus({ months: 1 });

        const count = Math.floor(Math.random() * 900) + 100;
        const countPositive = Math.floor(Math.random() * count);
        const countNegative = count - countPositive;

        mockPredictionData.push({
            iconUrl: `https://img.logo.dev/${companyName}.com?token=${process.env.NEXT_PUBLIC_LOGO_API_KEY}`,
            timestamp: cursor.toISO()!,
            count,
            countPositive,
            countNegative,
            actualPrice: 100 + Math.random() * 900,
        });

        cursor = nextDate;
    }

    return mockPredictionData;
};

const bucketPredictionsByInterval = async (
    startTimeISO: string,
    endTimeISO: string,
    interval: TimeInterval,
    companyName: string,
    symbol: string
): Promise<GroupedPredictionData[]> => {
    const start = DateTime.fromISO(startTimeISO);
    const end = DateTime.fromISO(endTimeISO);

    // Create bucket date ranges
    const bucketRanges: { start: DateTime; end: DateTime }[] = [];
    let cursor = start;

    while (cursor <= end) {
        const nextDate = interval === 'day'
            ? cursor.plus({ days: 1 })
            : interval === 'week'
                ? cursor.plus({ weeks: 1 })
                : cursor.plus({ months: 1 });

        bucketRanges.push({
            start: cursor,
            end: nextDate.minus({ seconds: 1 })
        });

        cursor = nextDate;
    }

    // Fetch data for all buckets in parallel
    const bucketPromises = bucketRanges.map(async ({ start, end }) => {
        const predictions = await fetchPredictions(
            100,
            start.toFormat('yyyy-MM-dd'),
            end.toFormat('yyyy-MM-dd'),
            symbol
        );

        // Aggregate predictions for this bucket
        const totalPredictions = predictions.reduce((acc, pred) => {
            acc.count += pred.asset_total_predictions;
            acc.countPositive += pred.asset_long_predictions_total;
            acc.countNegative += pred.asset_short_predictions_total;
            acc.actualPrice = pred.price;
            return acc;
        }, {
            count: 0,
            countPositive: 0,
            countNegative: 0,
            actualPrice: 0
        });

        return {
            iconUrl: `https://img.logo.dev/${companyName}.com?token=${process.env.NEXT_PUBLIC_LOGO_API_KEY}`,
            timestamp: start.toISO()!,
            ...totalPredictions
        };
    });

    // Wait for all bucket requests to complete
    const results = await Promise.all(bucketPromises);

    // Sort by timestamp
    return results.sort((a, b) =>
        DateTime.fromISO(a.timestamp) < DateTime.fromISO(b.timestamp) ? -1 : 1
    );
};



/**
 * Fetches prediction counts for a given stock symbol within a time range
 */
export const getAssetPredictions = async (
    symbol: string,
    companyName: string,
    startTimeISO: string,
    endTimeISO: string,
    interval: TimeInterval
): Promise<GroupedPredictionData[]> => {
    if (!validateTimeRange(startTimeISO, endTimeISO)) {
        throw new Error('Invalid timestamp format or end time must be after start time');
    }

    if (!USE_MOCK_DATA) {
        return bucketPredictionsByInterval(startTimeISO, endTimeISO, interval, companyName, symbol);
    }

    return generateMockGroupedPredictions(symbol, companyName, startTimeISO, endTimeISO, interval);
};

/**
 * Fetches individual predictions for a given stock symbol within a time range
 */
export const getIndividualPredictions = async (
    symbol: string,
    companyName: string,
    startTimeISO: string,
    endTimeISO: string,
    interval: TimeInterval,
    username: string
): Promise<IndividualPredictionData[]> => {
    if (!validateTimeRange(startTimeISO, endTimeISO)) {
        throw new Error('Invalid timestamp format or end time must be after start time');
    }

    if (!USE_MOCK_DATA) {
        const predictions = await fetchPredictions(100); // Fetch real data from API
        return predictions.map((prediction) => ({
            iconUrl: `https://img.logo.dev/${companyName}.com?token=${process.env.NEXT_PUBLIC_LOGO_API_KEY}`,
            symbol: prediction.asset,
            companyName,
            username,
            timestamp: prediction.data_date,
            actualPrice: prediction.price,
            predictedDirection: prediction.direction === 'up' ? 'up' : 'down',
            userIconUrl: userIconUrls[username.toLowerCase() as keyof typeof userIconUrls],
        }));
    }

    return generateMockIndividualPredictions(symbol, companyName, startTimeISO, endTimeISO, interval, username);
};

const validateTimeRange = (startTimeISO: string, endTimeISO: string): boolean => {
    const start = DateTime.fromISO(startTimeISO);
    const end = DateTime.fromISO(endTimeISO);

    return start.isValid && end.isValid && end > start;
};
