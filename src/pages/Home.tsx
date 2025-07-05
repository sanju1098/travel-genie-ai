import {Code, CodeOff} from "@mui/icons-material";
import {Alert, Box, Snackbar, Typography} from "@mui/material";
import {useState} from "react";
import Header from "../components/Header";
import TravelForm from "../components/TravelForm";
import TravelResults from "../components/TravelResults";
import {GeminiService, TravelDetails} from "../services/geminiService";

const Home = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [travelPlan, setTravelPlan] = useState<any>(null);
  const [travelDetails, setTravelDetails] = useState<TravelDetails | null>(null);

  const GeminiKEY = import.meta.env.VITE_GEMINI_API_KEY;

  const handleSubmit = async (details: TravelDetails) => {
    setIsLoading(true);
    setError(null);
    setTravelDetails(details);
    setOpenSnackbar(false);
    try {
      const geminiService = new GeminiService(GeminiKEY);
      const plan = await geminiService.generateTravelPlan(details);
      setTravelPlan(plan);
    } catch (err) {
      console.error(err);
      setError("Error: Failed to generate travel plan:");
      setOpenSnackbar(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setTravelPlan(null);
    setTravelDetails(null);
  };

  return (
    <div className="min-h-screen">
      <Header />

      <Box className="my-8">
        <>
          <Snackbar
            open={openSnackbar}
            autoHideDuration={4000}
            onClose={() => setOpenSnackbar(false)}
            anchorOrigin={{vertical: "top", horizontal: "center"}}
          >
            <Alert severity="error" onClose={() => setOpenSnackbar(false)}>
              {error}
            </Alert>
          </Snackbar>

          {!travelPlan && <TravelForm onSubmit={handleSubmit} isLoading={isLoading} />}

          {travelPlan && travelDetails && (
            <TravelResults
              travelPlan={travelPlan}
              travelDetails={travelDetails}
              onReset={handleReset}
            />
          )}
        </>
      </Box>

      <footer className="text-center text-[#D1D5DB] p-6 bg-[#2C3542]">
        <Typography variant="body1">
          © {new Date().getFullYear()} TravelGenie.AI • Powered by Gemini 1.5 Flash
        </Typography>
        <Typography variant="body2" className="mt-2 flex justify-center items-center gap-1">
          <Code fontSize="small" sx={{color: "#ffffff "}} />
          Developed by
          <a
            href="https://sanjay-dev-beta.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#D1D5DB] hover:underline"
          >
            Sanjay Kumar
          </a>
          <CodeOff fontSize="small" sx={{color: "#ffffff "}} />
        </Typography>
      </footer>
    </div>
  );
};

export default Home;
