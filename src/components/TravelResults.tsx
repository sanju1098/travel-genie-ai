import {CalendarMonth, Flight, LocationOn} from "@mui/icons-material";
import {Box, Button, Chip, Typography} from "@mui/material";
import React, {useEffect, useRef} from "react";
import Markdown from "react-markdown";
import {TravelDetails} from "../services/geminiService";

interface TravelResultsProps {
  travelPlan: any;
  travelDetails: TravelDetails;
  onReset: () => void;
}

const getCurrencySymbol = (currencyCode: string = "INR") => {
  const currencies = {
    INR: "₹",
    USD: "$",
    EUR: "€",
    GBP: "£",
    AUD: "A$",
    CAD: "C$",
    JPY: "¥"
  };

  return currencies[currencyCode as keyof typeof currencies] || "₹";
};

const TravelResults: React.FC<TravelResultsProps> = ({travelPlan, travelDetails, onReset}) => {
  const resultRef = useRef<HTMLDivElement>(null);
  const currencySymbol = getCurrencySymbol(travelDetails.currency);

  useEffect(() => {
    if (resultRef.current) {
      resultRef.current.scrollIntoView({behavior: "smooth", block: "start"});
    }
  }, [travelPlan]);

  return (
    <div
      ref={resultRef}
      className="animate-slide-up max-w-5xl mx-auto my-12 bg-white text-[#333333] rounded-lg shadow-lg"
    >
      <Box className="p-8">
        <Box className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <Typography variant="h4" component="h2" className="font-bold mb-2 md:mb-0">
            Your Travel Plan
          </Typography>
          <Button
            variant="outlined"
            color="primary"
            onClick={onReset}
            sx={{
              borderColor: "primary.dark",
              color: "primary.dark",
              "&:hover": {backgroundColor: "primary.light"}
            }}
          >
            Plan Another Trip
          </Button>
        </Box>

        <Box className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Box className="flex items-center">
            <Flight sx={{color: "#333333", marginRight: "12px"}} />
            <Typography variant="body1" className="font-medium">
              <strong>From:</strong> {travelDetails.source}
            </Typography>
          </Box>
          <Box className="flex items-center">
            <LocationOn sx={{color: "#333333", marginRight: "12px"}} />
            <Typography variant="body1" className="font-medium">
              <strong>To:</strong> {travelDetails.destination}
            </Typography>
          </Box>
          <Box className="flex items-center">
            <CalendarMonth sx={{color: "#333333", marginRight: "12px"}} />
            <Typography variant="body1" className="font-medium">
              <strong>Dates:</strong> {travelDetails.startDate.toLocaleDateString()} to{" "}
              {travelDetails.endDate.toLocaleDateString()}
            </Typography>
          </Box>
          <Box className="flex items-center">
            <Typography variant="body1" className="font-medium">
              <strong>Budget:</strong> {currencySymbol}
              {travelDetails.budget.toLocaleString()}
            </Typography>
          </Box>

          {travelDetails.interests && travelDetails.interests.length > 0 && (
            <Box className="col-span-1 sm:col-span-2 mt-2">
              <Typography variant="body1" className="font-medium mb-2">
                <strong>Interests:</strong>
              </Typography>
              <Box className="flex flex-wrap gap-2">
                {travelDetails.interests.map((interest, index) => (
                  <Chip
                    key={index}
                    label={interest}
                    size="small"
                    sx={{backgroundColor: "#34D399", color: "#000000"}}
                  />
                ))}
              </Box>
            </Box>
          )}
        </Box>
      </Box>
      <Box className="p-8 travel-details-response bg-gray-100 text-[#333333] rounded-b-lg shadow-md">
        <Markdown>{travelPlan}</Markdown>
      </Box>
    </div>
  );
};

export default TravelResults;
