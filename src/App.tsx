/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { AnimatePresence } from "motion/react";
import { Background } from "./components/Background";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { ProductGrid } from "./components/ProductGrid";
import { AstrologyForm } from "./components/AstrologyForm";
import { PaymentFlow } from "./components/PaymentFlow";
import { ReportDashboard } from "./components/ReportDashboard";
import { PanjikaSection, FloatingToday } from "./components/panjika/PanjikaSection";
import { ZodiacHoroscope } from "./components/ZodiacHoroscope";
import { Testimonials } from "./components/Testimonials";
import { FAQ } from "./components/FAQ";
import { Footer } from "./components/Footer";
import { generateAstrologyReport } from "./services/aiAstrologyService";
import { BirthDetails, AstrologyReport } from "./types";
import { trackMetaEvent } from "./lib/metaTracking";
import { useEffect } from "react";

export default function App() {
  const [selectedProduct, setSelectedProduct] = useState<{ id: string; price: number } | null>(null);
  const [userDetails, setUserDetails] = useState<BirthDetails | null>(null);
  const [isPaying, setIsPaying] = useState(false);
  const [report, setReport] = useState<AstrologyReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    trackMetaEvent("PageView");

    // Handle shared reports
    const params = new URLSearchParams(window.location.search);
    const sharedId = params.get("shared");
    
    if (sharedId) {
      const loadSharedReport = async () => {
        setIsLoading(true);
        try {
          const { doc, getDoc } = await import("firebase/firestore");
          const { db } = await import("./lib/firebase");
          
          const docSnap = await getDoc(doc(db, "shared_reports", sharedId));
          if (docSnap.exists()) {
            const data = docSnap.data();
            setReport(data.reportData);
            setUserDetails(data.birthDetails);
            
            // Clean up URL without refreshing
            const url = new URL(window.location.href);
            url.searchParams.delete("shared");
            window.history.replaceState({}, "", url);
          } else {
            console.error("No such report!");
            window.alert("The shared report you are looking for was not found.");
            // Clean up URL
            const url = new URL(window.location.href);
            url.searchParams.delete("shared");
            window.history.replaceState({}, "", url);
          }
        } catch (error) {
          console.error("Error loading shared report:", error);
        } finally {
          setIsLoading(false);
        }
      };
      
      loadSharedReport();
    }
  }, []);

  const handleProductSelect = (id: string, price: number) => {
    setSelectedProduct({ id, price });
    trackMetaEvent("AddToCart", {}, {
      content_ids: [id],
      content_type: "product",
      value: price,
      currency: "INR"
    });
  };

  const handleFormSubmit = (details: BirthDetails) => {
    setUserDetails(details);
    setIsPaying(true);
  };

  const handlePaymentSuccess = async () => {
    setIsPaying(false);
    setIsLoading(true);
    try {
      if (userDetails && selectedProduct) {
        const generatedReport = await generateAstrologyReport(userDetails, selectedProduct.id);
        setReport(generatedReport);
      }
    } catch (error) {
      console.error("Failed to generate report:", error);
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred while generating your report.";
      // Using alert as a simple way to show the error on the custom domain
      window.alert(errorMessage);
      resetFlow();
    } finally {
      setIsLoading(false);
    }
  };

  const resetFlow = () => {
    setSelectedProduct(null);
    setUserDetails(null);
    setIsPaying(false);
    setReport(null);
  };

  return (
    <div className="relative min-h-screen">
      <Background />
      <Navbar />
      <FloatingToday />

      <main>
        <Hero onSelect={handleProductSelect} />
        <ZodiacHoroscope onSelect={handleProductSelect} />
        <ProductGrid onSelect={handleProductSelect} />
        <PanjikaSection />
        <FAQ />
        <Testimonials />
      </main>

      <Footer />

      <AnimatePresence>
        {selectedProduct && !userDetails && (
          <AstrologyForm 
            productId={selectedProduct.id} 
            onClose={() => setSelectedProduct(null)} 
            onSubmit={handleFormSubmit}
          />
        )}

        {isPaying && selectedProduct && (
          <PaymentFlow 
            price={selectedProduct.price} 
            onClose={() => setIsPaying(false)} 
            onSuccess={handlePaymentSuccess}
          />
        )}

        {isLoading && (
          <div className="fixed inset-0 z-[300] bg-cosmic-dark flex flex-col items-center justify-center">
            <div className="relative w-24 h-24 mb-6">
              <div className="absolute inset-0 border-4 border-gold/10 rounded-full" />
              <div className="absolute inset-0 border-4 border-gold border-t-transparent rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 bg-gold/20 rounded-full animate-pulse" />
              </div>
            </div>
            <h2 className="font-serif text-2xl italic tracking-widest text-gold mb-2">Aligning the Stars</h2>
            <p className="text-gray-500 animate-pulse uppercase tracking-[0.2em] text-[10px] font-bold">Consulting Vedic Manuscripts...</p>
          </div>
        )}

        {report && userDetails && (
          <ReportDashboard 
            report={report} 
            details={userDetails} 
            onClose={resetFlow} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

