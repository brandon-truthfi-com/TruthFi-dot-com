import React, { useEffect, useState } from "react";
import { fetchPredictions, PredictionData } from "../services/api";
import Image from 'next/image';
 // Adjust path if necessary

interface PredictionListProps {
  limit?: number; // Optional prop for the number of predictions
}

const PredictionList: React.FC<PredictionListProps> = ({ limit = 10 }) => {
  const [predictions, setPredictions] = useState<PredictionData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Generate the logo URL based on the company name
  const getLogoUrl = (companyName: string): string => {
    return `https://img.logo.dev/${companyName}.com?token=${process.env.NEXT_PUBLIC_LOGO_API_KEY}`;
  };

  useEffect(() => {
    const loadPredictions = async () => {
      try {
        const data = await fetchPredictions(limit); // Fetch predictions
        setPredictions(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching predictions:", err);
        setError("Failed to load predictions.");
        setLoading(false);
      }
    };

    loadPredictions();
  }, [limit]); // Re-fetch if limit changes

  if (loading) return <div>Loading predictions...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="p-4 bg-background text-foreground rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Predictions</h2>
      <ul className="space-y-4">
        {predictions.map((prediction) => {
          const logoUrl = getLogoUrl(prediction.asset); // Generate logo URL using the asset name
          return (
            <li
              key={prediction.prediction_id}
              className="p-4 border rounded-lg bg-card text-card-foreground flex items-center"
            >
              {/* Display the logo */}
              <Image
                src={logoUrl}
                alt={`${prediction.asset} logo`}
                className="w-12 h-12 mr-4 rounded-full"
                onError={(e) => {
                  // Fallback to a placeholder if the logo fails to load
                  (e.target as HTMLImageElement).src =
                    "https://via.placeholder.com/64?text=Logo";
                }}
              />

              {/* Display prediction details */}
              <div>
                <p><strong>Asset:</strong> {prediction.asset}</p>
                <p><strong>Direction:</strong> {prediction.direction}</p>
                <p><strong>Price:</strong> ${prediction.price.toFixed(2)}</p>
                <p><strong>Date:</strong> {new Date(prediction.prediction_date).toLocaleDateString()}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default PredictionList;
