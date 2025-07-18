import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { ToastContainer } from "react-toastify";
import Footer from "../components/footer";
import TanstackProvider from "../utils/tanstack-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Movie App",
  description: "Movie App",
};

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const RootLayout = ({ children }: Readonly<{ children: React.ReactNode }>) => {
  return (
    <html lang="en">
      <body
        className={`${montserrat.variable} antialiased min-h-screen flex flex-col`}
      >
        <TanstackProvider>
          <main className="flex flex-col justify-center items-center flex-1 p-8">
            {children}
          </main>
          <ToastContainer />
          <Footer />
        </TanstackProvider>
      </body>
    </html>
  );
};

export default RootLayout;
