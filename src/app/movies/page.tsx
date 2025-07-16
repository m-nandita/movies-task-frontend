"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axiosInstance from "@/src/utils/axios";
import Cookies from "js-cookie";
import Image from "next/image";
import z from "zod";

const MovieSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  publishedYear: z.string().min(1, "Published year is required"),
  posterUrl: z.string().optional(),
});

type Movie = z.infer<typeof MovieSchema>;

const MoviesPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [totalMovies, setTotalMovies] = useState(0);
  const moviesPerPage = 8;
  const router = useRouter();

  const totalPages = Math.ceil(totalMovies / moviesPerPage);

  const handleLogout = () => {
    Cookies.remove("accessToken");
    Cookies.remove("refreshToken");
    router.push("/sign-in");
    toast.success("Logged out successfully", { autoClose: 1000 });
  };

  useEffect(() => {
    axiosInstance
      .get(`/movies?page=${currentPage}&limit=${moviesPerPage}`)
      .then((res) => {
        setMovies(res.data.movies);
        setTotalMovies(res.data.total);
      })
      .catch((error) => {
        if (error?.response) {
          const errorResponse = error.response;
          if (errorResponse.status == 400) {
            toast.error("Bad Request", { autoClose: 1000 });
          } else if (errorResponse.status == 404) {
            toast.error("Movies not found", { autoClose: 1000 });
          } else {
            toast.error("Internal Server Error", { autoClose: 1000 });
          }
        } else {
          toast.error("Some error occured", { autoClose: 1000 });
        }
      });
  }, [currentPage]);

  return (
    <div className="h-full w-full bg-gradient-to-b relative">
      <div
        className="container mx-auto relative z-10"
        style={{
          padding: movies?.length > 0 ? "24px" : "0px",
        }}
      >
        <div className="flex justify-between items-center mb-16 mx-auto">
          {movies?.length > 0 ? (
            <div className="flex flex-1 items-center justify-start gap-2">
              <h1 className="text-5xl font-semibold">My movies</h1>
              <button
                onClick={() => router.push("/movies/add")}
                className="cursor-pointer"
              >
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 28 28"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M15.3334 7.33332H12.6667V12.6667H7.33342V15.3333H12.6667V20.6667H15.3334V15.3333H20.6667V12.6667H15.3334V7.33332ZM14.0001 0.666656C6.64008 0.666656 0.666748 6.63999 0.666748 14C0.666748 21.36 6.64008 27.3333 14.0001 27.3333C21.3601 27.3333 27.3334 21.36 27.3334 14C27.3334 6.63999 21.3601 0.666656 14.0001 0.666656ZM14.0001 24.6667C8.12008 24.6667 3.33341 19.88 3.33341 14C3.33341 8.11999 8.12008 3.33332 14.0001 3.33332C19.8801 3.33332 24.6667 8.11999 24.6667 14C24.6667 19.88 19.8801 24.6667 14.0001 24.6667Z"
                    fill="white"
                  />
                </svg>
              </button>
            </div>
          ) : null}
          <button
            onClick={handleLogout}
            className="flex flex-1 justify-end items-center gap-3 cursor-pointer"
          >
            Logout
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20px"
              height="20px"
              viewBox="0 0 20 20"
              version="1.1"
            >
              <g id="surface1">
                <path
                  style={{
                    stroke: "none",
                    fillRule: "nonzero",
                    fill: "rgb(100%,100%,100%)",
                    fillOpacity: 1,
                  }}
                  d="M 15.554688 5.554688 L 13.988281 7.121094 L 15.746094 8.890625 L 6.667969 8.890625 L 6.667969 11.109375 L 15.746094 11.109375 L 13.988281 12.867188 L 15.554688 14.445312 L 20 10 Z M 2.222656 2.222656 L 10 2.222656 L 10 0 L 2.222656 0 C 1 0 0 1 0 2.222656 L 0 17.777344 C 0 19 1 20 2.222656 20 L 10 20 L 10 17.777344 L 2.222656 17.777344 Z M 2.222656 2.222656 "
                />
              </g>
            </svg>
          </button>
        </div>
        {movies?.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <h2 className="text-5xl font-semibold mb-6">
              Your movie list is empty
            </h2>
            <button
              onClick={() => router.push("/movies/add")}
              className="btn-primary cursor-pointer py-3 px-6 rounded-lg"
            >
              Add a new movie
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-20">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 justify-center items-center">
              {movies?.map((movie) => (
                <div
                  key={movie.id}
                  onClick={() => router.push(`/movies/${movie.id}`)}
                  style={{
                    backgroundColor: "#092C39",
                    width: "240px",
                    height: "400px",
                    borderRadius: "12px",
                    padding: "8px 8px 16px 8px",
                    gap: "16px",
                  }}
                  className="relative flex flex-col items-center justify-center group cursor-pointer transform transition-transform duration-300 hover:scale-105"
                >
                  <Image
                    src={`${process.env.NEXT_PUBLIC_API_URL}/${movie.posterUrl}`}
                    alt={movie.title}
                    width={240}
                    height={400}
                    style={{
                      objectFit: "cover",
                      borderRadius: "12px",
                      overflow: "hidden",
                    }}
                  />
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      justifySelf: "flex-start",
                      alignSelf: "flex-start",
                      color: "white",
                      gap: "8px",
                      padding: "0 8px",
                    }}
                  >
                    <h3
                      style={{
                        fontWeight: "500",
                        fontSize: "20px",
                        lineHeight: "32px",
                        letterSpacing: "0%",
                      }}
                    >
                      {movie.title}
                    </h3>
                    <p
                      style={{
                        fontWeight: "400",
                        fontSize: "14px",
                        lineHeight: "24px",
                        letterSpacing: "0%",
                      }}
                    >
                      {movie.publishedYear}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center items-center gap-4">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="cursor-pointer disabled:text-gray-500"
              >
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded-lg cursor-pointer ${
                      currentPage === page
                        ? "active-navigation-button"
                        : "inactive-navigation-button"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="cursor-pointer disabled:text-gray-500 focus:outline-none"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MoviesPage;
