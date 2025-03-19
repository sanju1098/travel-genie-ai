import {CalendarMonth, Flight, Interests, LocationOn, Person} from "@mui/icons-material";
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  Typography
} from "@mui/material";
import {AdapterDateFns} from "@mui/x-date-pickers/AdapterDateFnsV3"; // or AdapterDateFnsV4
import {DatePicker} from "@mui/x-date-pickers/DatePicker";
import {LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider";
import {addDays, differenceInDays, isBefore} from "date-fns";
import React, {useState} from "react";
import {TravelDetails} from "../services/geminiService";

interface TravelFormProps {
  onSubmit: (travelDetails: TravelDetails) => void;
  isLoading: boolean;
}

const popularInterests = [
  "Adventure",
  "Art",
  "Beach",
  "Culture",
  "Cuisine",
  "Family-friendly",
  "Hiking",
  "History",
  "Luxury",
  "Museums",
  "Nature",
  "Nightlife",
  "Photography",
  "Relaxation",
  "Shopping",
  "Sightseeing",
  "Sports",
  "Wildlife",
  "Local experiences",
  "Architecture",
  "Festivals"
];

const currencies = [
  {code: "INR", symbol: "₹", name: "Indian Rupee"},
  {code: "USD", symbol: "$", name: "US Dollar"},
  {code: "EUR", symbol: "€", name: "Euro"}
  // { code: 'GBP', symbol: '£', name: 'British Pound' },
  // { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  // { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  // { code: 'JPY', symbol: '¥', name: 'Japanese Yen' }
];

const TravelForm: React.FC<TravelFormProps> = ({onSubmit, isLoading}) => {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(addDays(new Date(), 30));
  const [endDate, setEndDate] = useState<Date | null>(addDays(new Date(), 37));
  const [budget, setBudget] = useState<any>(""); // Default 1 lakh INR
  const [travelers, setTravelers] = useState(2);
  const [interests, setInterests] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currency, setCurrency] = useState(currencies[0]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!source.trim()) newErrors.source = "Starting location is required";
    if (!destination.trim()) newErrors.destination = "Destination is required";
    if (!startDate) newErrors.startDate = "Start date is required";
    if (!endDate) newErrors.endDate = "End date is required";

    if (startDate && endDate) {
      // Check if start date is in the past
      if (isBefore(startDate, new Date())) {
        newErrors.startDate = "Start date cannot be in the past";
      }

      // Check if end date is before start date
      if (startDate && endDate && isBefore(endDate, startDate)) {
        newErrors.endDate = "End date must be after start date";
      }
    }

    if (budget <= 0) newErrors.budget = "Budget must be greater than 0";
    if (travelers <= 0) newErrors.travelers = "Number of travelers must be greater than 0";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const travelDetails: TravelDetails = {
      source,
      destination,
      startDate: startDate!,
      endDate: endDate!,
      budget,
      travelers,
      interests,
      currency: currency.code
    };

    onSubmit(travelDetails);
  };

  const tripDuration = startDate && endDate ? differenceInDays(endDate, startDate) : 0;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <div className="p-8 mt-8 rounded-xl max-w-3xl mx-auto bg-gray-100">
        <Box className="text-center mb-8 animate-fade-in">
          <Typography variant="h4" component="h1">
            Welcome to TravelGenie.AI
          </Typography>
          <Typography variant="h6">Plan smarter with your AI travel assistant</Typography>
        </Box>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TextField
              fullWidth
              label="Starting Location"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Flight />
                  </InputAdornment>
                )
              }}
              error={!!errors.source}
              helperText={errors.source}
            />

            <TextField
              fullWidth
              label="Destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationOn />
                  </InputAdornment>
                )
              }}
              error={!!errors.destination}
              helperText={errors.destination}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <Typography variant="body1">
                <CalendarMonth sx={{marginRight: "8px"}} fontSize="small" />
                Start Date
              </Typography>
              <DatePicker
                value={startDate}
                onChange={(newDate) => setStartDate(newDate)}
                disablePast
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.startDate,
                    helperText: errors.startDate
                  }
                }}
              />
            </div>

            <div>
              <Typography variant="body1">
                <CalendarMonth sx={{marginRight: "8px"}} fontSize="small" />
                End Date
              </Typography>
              <DatePicker
                value={endDate}
                onChange={(newDate) => setEndDate(newDate)}
                disablePast
                minDate={startDate || undefined}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.endDate,
                    helperText: errors.endDate
                  }
                }}
              />
            </div>
          </div>

          {startDate && endDate && tripDuration >= 0 && (
            <Typography variant="h6" sx={{textAlign: "center", fontWeight: "bold"}}>
              Trip Duration: {tripDuration} {tripDuration === 1 ? "day" : "days"}
            </Typography>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <FormControl variant="outlined" fullWidth>
                <InputLabel>Currency</InputLabel>
                <Select
                  value={currency.code}
                  onChange={(e) =>
                    setCurrency(currencies.find((c) => c.code === e.target.value) || currencies[0])
                  }
                  label="Currency"
                >
                  {currencies.map((curr) => (
                    <MenuItem key={curr.code} value={curr.code}>
                      {curr.symbol} {curr.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>

            <TextField
              fullWidth
              label={`Budget (${currency.symbol})`}
              type="number"
              value={budget}
              onChange={(e) => setBudget(Math.max(0, Number(e.target.value)))}
              error={!!errors.budget}
              helperText={errors.budget}
            />
          </div>

          <TextField
            label="Number of Travelers"
            type="number"
            value={travelers}
            onChange={(e) => setTravelers(Math.max(0, Number(e.target.value)))}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Person />
                </InputAdornment>
              )
            }}
            error={!!errors.travelers}
            helperText={errors.travelers}
          />

          <FormControl fullWidth sx={{mt: 3}}>
            <Autocomplete
              multiple
              options={popularInterests}
              value={interests}
              onChange={(_, newValue) => setInterests(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  label="Travel Interests (Optional)"
                  placeholder="Select interests"
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <InputAdornment position="start">
                          <Interests />
                        </InputAdornment>
                        {params.InputProps.startAdornment}
                      </>
                    )
                  }}
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    variant="outlined"
                    label={option}
                    {...getTagProps({index})}
                    sx={{margin: "0 3px"}}
                  />
                ))
              }
            />
            <Typography variant="caption" className="text-gray-600">
              Select interests to personalize your travel plan (optional)
            </Typography>
          </FormControl>

          <Box className="text-center mt-8">
            <Tooltip
              title={
                isLoading
                  ? "Generating your travel plan..."
                  : "Create your personalized travel plan"
              }
            >
              <span>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <CircularProgress size={24} color="inherit" className="mr-2" />
                      Generating Plan...
                    </>
                  ) : (
                    "Plan My Trip"
                  )}
                </Button>
              </span>
            </Tooltip>
          </Box>
        </form>
      </div>
    </LocalizationProvider>
  );
};

export default TravelForm;
