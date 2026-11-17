import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import DrumRoom from "./pages/DrumRoom";
import PianoPark from "./pages/PianoPark";
import GuitarGlade from "./pages/GuitarGlade";
import MixerStudio from "./pages/MixerStudio";
import MyRoom from "./pages/MyRoom";
import Lessons from "./pages/Lessons";
import EarTraining from "./pages/EarTraining";
import NoteSchool from "./pages/NoteSchool";
import SongBuilder from "./pages/SongBuilder";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/drum-room" element={<DrumRoom />} />
          <Route path="/piano-park" element={<PianoPark />} />
          <Route path="/guitar-glade" element={<GuitarGlade />} />
          <Route path="/mixer-studio" element={<MixerStudio />} />
          <Route path="/my-room" element={<MyRoom />} />
          <Route path="/lektioner" element={<Lessons />} />
          <Route path="/gehor" element={<EarTraining />} />
          <Route path="/noter" element={<NoteSchool />} />
          <Route path="/latbyggare" element={<SongBuilder />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
