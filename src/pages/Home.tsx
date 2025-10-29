import {Code, CodeOff} from "@mui/icons-material";
import {Alert, Box, Button, Snackbar, Typography} from "@mui/material";
import {useEffect, useRef, useState} from "react";
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
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [showLongWait, setShowLongWait] = useState(false);
  const longWaitTimerRef = useRef<number | null>(null);

  const GeminiKEY = import.meta.env.VITE_GEMINI_API_KEY;

  const handleSubmit = async (details: TravelDetails) => {
    setIsLoading(true);
    setError(null);
    setTravelDetails(details);
    setOpenSnackbar(false);
    try {
      const controller = new AbortController();
      setAbortController(controller);

      // if the generation takes longer than 7s, show an extra message and abort button
      if (longWaitTimerRef.current) window.clearTimeout(longWaitTimerRef.current);
      longWaitTimerRef.current = window.setTimeout(() => setShowLongWait(true), 7000);

      const geminiService = new GeminiService(GeminiKEY);
      // pass controller.signal so the service can cancel the wait
      const plan = await geminiService.generateTravelPlan(details, controller.signal, 180000);
      setTravelPlan(plan);
    } catch (err) {
      console.error(err);
      // If the error is caused by abort, give a friendly message
      const message = err instanceof Error ? err.message : String(err);
      if (message.toLowerCase().includes("abort")) {
        setError("Generation aborted by user.");
      } else if (message.toLowerCase().includes("timed out")) {
        setError("Generation timed out. Try again or shorten the request.");
      } else {
        setError("Error: Failed to generate travel plan:");
      }
      setOpenSnackbar(true);
    } finally {
      setIsLoading(false);
      setShowLongWait(false);
      if (longWaitTimerRef.current) {
        window.clearTimeout(longWaitTimerRef.current);
        longWaitTimerRef.current = null;
      }
      setAbortController(null);
    }
  };

  const handleAbort = () => {
    if (abortController) {
      abortController.abort();
      setIsLoading(false);
      setShowLongWait(false);
      setOpenSnackbar(true);
      setError("Generation aborted by user.");
    }
    if (longWaitTimerRef.current) {
      window.clearTimeout(longWaitTimerRef.current);
      longWaitTimerRef.current = null;
    }
  };

  // cleanup on unmount
  useEffect(() => {
    return () => {
      if (longWaitTimerRef.current) window.clearTimeout(longWaitTimerRef.current);
      if (abortController) abortController.abort();
    };
  }, []);

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

          {/* Loading / long-wait UI */}
          {isLoading && (
            <Box className="max-w-3xl mx-auto mt-4 flex items-center justify-center gap-4">
              {/* <CircularProgress size={28} /> */}
              {/* <Typography variant="body1">Generating your travel plan...</Typography> */}
              {showLongWait && (
                <Box className="ml-4 flex items-center gap-2">
                  <Typography variant="body2" color="textSecondary">
                    This is taking longer than usual. You can abort the request.
                  </Typography>
                  <Button variant="outlined" color="secondary" onClick={handleAbort}>
                    Abort
                  </Button>
                </Box>
              )}
            </Box>
          )}

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
          © {new Date().getFullYear()} TravelGenie.AI • Powered by Gemini 2.5 Flash
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
