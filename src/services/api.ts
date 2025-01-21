import axios from 'axios';
import { DateTime } from 'luxon';

// console.log('process.env.NEXT_PUBLIC_PLAYFAIR_API_KEY:', process.env.NEXT_PUBLIC_PLAYFAIR_API_KEY);

// const VITE_API_URL = '/top-accounts-feed';
// const token = import.meta.env.VITE_BEARER_TOKEN;

// // Ensure that the token is correctly loaded
// if (!token) {
//   throw new Error('Bearer token not found in the environment variables');
// }

// const headers = {
//   'Authorization': `Bearer ${token}`,
//   'Content-Type': 'application/json'
// };

// const FLASK_API_URL = 'https://digital-dash-truthfi-try3.us-east-1.elasticbeanstalk.com/top-accounts-feed';
// const FLASK_API_URL = 'https://www.truthfi.com/top-accounts-feed'; // URL to your Flask server route
// const FLASK_API_URL = 'http://127.0.0.1:8000/top-accounts-feed';
// const FLASK_API_URL = 'http://0.0.0.0:5000/top-accounts-feed';
// const FLASK_API_URL = 'http:/52.225.234.148:5000/top-accounts-feed';
// const FLASK_API_URL = 'https://truthf-dash-try2-ce1cbb7e0b8e.herokuapp.com/top-accounts-feed';
// const FLASK_API_URL = 'https://truthfi-dash-try1-ec9fffb57b64.herokuapp.com//top-accounts-feed';
// const FLASK_API_URL = 'https://truthfi.com:5000/top-accounts-feed';
// const FLASK_API_URL = 'https://truthfi-dash-nov18-2024-42b076bad849.herokuapp.com/top-accounts-feed';
const FLASK_API_URL = 'http://api.playfairapp.com/top-accounts-feed';
// const FLASK_API_URL = 'https://truthfi-dash-nov18-2024-42b076bad849.herokuapp.com//top-accounts-feed';
// const FLASK_API_URL = 'http://127.0.0.1:5000/company-name?ticker=${symbol}';

export interface PredictionData {
  prediction_id: string;
  userID: string;
  asset: string;
  direction: string;
  price: number;
  data_date: string;
  asset_short_predictions_total: number;
  asset_long_predictions_total: number;
  asset_short_predictions_percentage_total: number;
  asset_long_predictions_percentage_total: number;
  asset_successful_short_predictions: number;
  asset_successful_long_predictions: number;
  asset_short_predictions_percentage_successful: number;
  asset_long_predictions_percentage_successful: number;
  asset_total_predictions: number;
  asset_total_predictions_percentage_successful: number;
  asset_confidence_score: number;
  asset_momentum: number;
  asset_batch_1_portfolio_return: number;
  asset_batch_2_portfolio_return: number;
  asset_batch_3_portfolio_return: number;
  asset_total_portfolio_return: number;
  overall_short_predictions_total: number;
  overall_long_predictions_total: number;
  overall_short_predictions_percentage_total: number;
  overall_long_predictions_percentage_total: number;
  overall_successful_short_predictions: number;
  overall_successful_long_predictions: number;
  overall_short_predictions_percentage_successful: number;
  overall_long_predictions_percentage_successful: number;
  overall_total_predictions: number;
  overall_total_predictions_percentage_successful: number;
  overall_confidence_score: number;
  overall_confidence_interval: number;
  overall_momentum: number;
  overall_batch_1_portfolio_return: number;
  overall_batch_2_portfolio_return: number;
  overall_batch_3_portfolio_return: number;
  overall_total_portfolio_return: number;
  overall_bullmarket_batch_1_portfoloio_return: number;
  overall_bullmarket_batch_2_portfoloio_return: number;
  overall_bullmarket_batch_3_portfoloio_return: number;
  overall_bullmarket_total_portfolio_return: number;
  overall_bearmarket_batch_1_portfoloio_return: number;
  overall_bearmarket_batch_2_portfoloio_return: number;
  overall_bearmarket_batch_3_portfoloio_return: number;
  overall_bearmarket_total_portfolio_return: number;
  overall_long_batch_1_portfolio_return: number;
  overall_long_batch_2_portfolio_return: number;
  overall_long_batch_3_portfolio_return: number;
  overall_long_total_portfolio_return: number;
  overall_short_batch_1_portfolio_return: number;
  overall_short_batch_2_portfolio_return: number;
  overall_short_batch_3_portfolio_return: number;
  overall_short_total_portfolio_return: number;
  prediction_date: string;
}


// export const fetchPredictions = async (limit: number = 100): Promise<PredictionData[]> => {
//   const payload = {
//     limit,
//   };

//   try {
//     const response = await axios.post<{ data: PredictionData[] }>(VITE_API_URL, payload, { headers });
//     return response.data.data;
//   } catch (error) {
//     console.error('Error fetching data from the API', error);
//     throw new Error('Failed to fetch predictions data. Please check the API or network connection.');
//   }
// };
/**
 * Fetch prediction data using a proxy route.
 *
 * @param limit - The number of predictions to fetch.
 * @param startDate - The start date for filtering predictions (ISO format).
 * @param endDate - The end date for filtering predictions (ISO format).
 * @param symbol - The asset symbol to filter predictions.
 * @returns A Promise resolving to an array of PredictionData.
 */
export const fetchPredictions = async (
  limit: number = 100,
  startDate?: string,
  endDate?: string,
  symbol?: string
): Promise<PredictionData[]> => {
  try {
    // Adjust end date if it matches the start date
    if (startDate && endDate && startDate === endDate) {
      endDate = DateTime.fromISO(endDate).plus({ days: 1 }).toISODate()!;
    }

    // Call the proxy route instead of the Playfair API directly
    const response = await axios.post<{ data: PredictionData[] }>(
      '/api/proxy', // Proxy route to handle API requests securely
      {
        limit,
        start: startDate,
        end: endDate,
        asset: symbol,
        page: 1,
      },
      {
        headers: {
          'Content-Type': 'application/json', // Simplified headers
        }
      }
    );

    // Return the data from the response
    return response.data.data;
  } catch (error) {
    // Log and rethrow errors for debugging
    console.error('Error fetching data from the Proxy API:', error);
    throw new Error('Failed to fetch predictions data. Please check the proxy route or network connection.');
  }
};












