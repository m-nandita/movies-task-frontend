"use client";

import React, { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { z } from "zod";
import axiosInstance from "@/src/utils/axios.js";
import Image from "next/image";

const MovieSchema = z.object({
  title: z.string().min(1, "Title is required"),
  publishedYear: z.string().min(4, "Published year is required"),
  posterUrl: z.string().optional(),
  id: z.string().optional(),
});

type Movie = z.infer<typeof MovieSchema>;

interface UpsertMovieProps {
  mode: "create" | "edit";
  movie?: Movie;
}

const UpsertMovie = ({ mode, movie }: UpsertMovieProps) => {
  const [imagePreview, setImagePreview] = useState<string | null>(
    movie?.posterUrl || null
  );
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [movieData, setMovieData] = useState<Movie | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const isEditMode = mode === "edit";
  const formDataRef = useRef(new FormData());

  const {
    register,
    reset: resetForm,
    handleSubmit,
    formState: { errors },
  } = useForm<Movie>({
    defaultValues: {
      title: movie?.title || "",
      publishedYear: movie?.publishedYear || "",
    },
  });

  useEffect(() => {
    if (movie && mode === "edit") {
      setMovieData(movie);
      setImagePreview(
        `${process.env.NEXT_PUBLIC_API_URL}/${movie.posterUrl}` || null
      );
      resetForm({
        title: movie.title || "",
        publishedYear: movie.publishedYear || "",
        posterUrl: movie.posterUrl || "",
        id: movie.id || "",
      });
    }
  }, [movie, mode, resetForm]);

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    setCurrentFile(file);
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith("image/")) {
        handleImageUpload(file);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleFormSubmit = (data: Movie) => {
    formDataRef.current.delete("title");
    formDataRef.current.delete("publishedYear");
    formDataRef.current.set("title", data.title);
    formDataRef.current.set("publishedYear", data.publishedYear.toString());
    if (currentFile) {
      formDataRef.current.delete("poster");
      formDataRef.current.append("poster", currentFile);
    }
    if (isEditMode) {
      axiosInstance
        .put(
          `${process.env.NEXT_PUBLIC_API_URL}/movies/update/${movieData?.id}`,
          formDataRef.current,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        )
        .then(() => {
          toast.success("Movie details edited successfully", {
            autoClose: 1000,
          });
        })
        .catch((error) => {
          if (error?.response) {
            const errorResponse = error.response;
            if (errorResponse.status == 400) {
              toast.error("Bad Request", { autoClose: 1000 });
            } else if (errorResponse.status == 404) {
              toast.error("Movie not found", { autoClose: 1000 });
            } else {
              toast.error("Internal Server Error", { autoClose: 1000 });
            }
          } else {
            toast.error("Some error occurred", { autoClose: 1000 });
          }
        })
        .finally(() => {
          router.push("/movies");
        });
    } else {
      axiosInstance
        .post(
          `${process.env.NEXT_PUBLIC_API_URL}/movies/add`,
          formDataRef.current,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        )
        .then(() => {
          toast.success("Movie details added successfully", {
            autoClose: 1000,
          });
        })
        .catch((error) => {
          if (error?.response) {
            const errorResponse = error.response;
            if (errorResponse.status == 400) {
              toast.error("Bad Request", { autoClose: 1000 });
            } else if (errorResponse.status == 409) {
              toast.error("Movie already exists", { autoClose: 1000 });
            } else {
              toast.error("Internal Server Error", { autoClose: 1000 });
            }
          } else {
            toast.error("Some error occurred", { autoClose: 1000 });
          }
        })
        .finally(() => {
          resetForm({
            title: movieData?.title || "",
            publishedYear: movieData?.publishedYear || "",
            posterUrl: movieData?.posterUrl || "",
            id: movieData?.id || "",
          });
          setImagePreview(null);
          setCurrentFile(null);
          formDataRef.current = new FormData();
          router.push("/movies");
        });
    }
  };

  return (
    <div className="h-full w-full bg-gradient-to-br relative overflow-hidden">
      <div className="relative z-10 p-8 max-w-6xl mx-auto w-full">
        <h2 className="text-5xl font-semibold mb-16">
          {isEditMode ? "Edit" : "Create a new movie"}
        </h2>
        <div className="flex gap-4 max-w-6xl mx-auto">
          <div className="flex-1">
            <div
              style={{ backgroundColor: "#224957" }}
              className={`relative border-2 border-dashed border-white rounded-lg h-100 w-90 flex flex-col items-center justify-center cursor-pointer transition-all duration-200`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                className="hidden"
              />
              {imagePreview ? (
                <div className="relative w-full h-full">
                  <Image
                    src={imagePreview}
                    alt="Movie poster"
                    fill
                    className="object-contain rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-center justify-center rounded-lg">
                    <div className="text-center">
                      <svg
                        className="w-6 h-6 mx-auto mb-4"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M14 11V14H2V11H0V14C0 15.1 0.9 16 2 16H14C15.1 16 16 15.1 16 14V11H14ZM13 7L11.59 5.59L9 8.17V0H7V8.17L4.41 5.59L3 7L8 12L13 7Z"
                          fill="white"
                        />
                      </svg>
                      <p className="text-sm">Click to change image</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <svg
                    className="w-6 h-6 mx-auto mb-4"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M14 11V14H2V11H0V14C0 15.1 0.9 16 2 16H14C15.1 16 16 15.1 16 14V11H14ZM13 7L11.59 5.59L9 8.17V0H7V8.17L4.41 5.59L3 7L8 12L13 7Z"
                      fill="white"
                    />
                  </svg>
                  <p className="text-lg">
                    {isEditMode
                      ? "Drop other image here"
                      : "Drop an image here"}
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="flex-1 flex flex-col">
            <form
              onSubmit={handleSubmit(handleFormSubmit)}
              className="space-y-6"
            >
              <div>
                <input
                  {...register("title")}
                  type="text"
                  id="title"
                  className={`w-full px-4 py-3 rounded-lg ${
                    errors.title ? "border-red-400 focus:ring-red-400" : ""
                  }`}
                  placeholder="Title"
                />
                {errors.title && (
                  <p className="mt-1 text-red-400 text-sm">
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div>
                <input
                  {...register("publishedYear")}
                  type="text"
                  id="publishedYear"
                  maxLength={4}
                  className={`w-full px-4 py-3 rounded-lg ${
                    errors.publishedYear
                      ? "border-red-400 focus:ring-red-400"
                      : ""
                  }`}
                  placeholder="Published year"
                />
                {errors.publishedYear && (
                  <p className="mt-1 text-red-400 text-sm">
                    {errors.publishedYear.message}
                  </p>
                )}
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => router.push("/movies")}
                  className="flex-1 px-6 py-3 bg-transparent border border-white rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1 px-6 py-3 rounded-lg cursor-pointer"
                >
                  {isEditMode ? "Update" : "Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpsertMovie;
