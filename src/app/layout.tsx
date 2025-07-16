import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import Footer from "../components/footer";
import { ToastContainer } from "react-toastify";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Movie App",
  description: "Movie App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${montserrat.variable} antialiased min-h-screen flex flex-col`}
      >
        <main className="flex flex-col justify-center items-center flex-1 p-8">
          {children}
        </main>
        <ToastContainer />
        <Footer />
      </body>
    </html>
  );
}
