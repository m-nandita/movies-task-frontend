"use client";

import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axiosInstance from "@/src/utils/axios.js";
import UpsertMovie from "@/src/components/upsert-movie";
import z from "zod";

const MovieSchema = z.object({
  title: z.string().min(1, "Title is required"),
  publishedYear: z.string().min(1, "Published year is required"),
  posterUrl: z.string().optional(),
  id: z.string().optional(),
});

type Movie = z.infer<typeof MovieSchema>;

const EditMoviePage = () => {
  const [movie, setMovie] = useState<Movie | null>(null);
  const params = useParams();
  const slug = params?.slug as string;

  useEffect(() => {
    if (slug) {
      axiosInstance
        .get(`/movies/${slug}`)
        .then((res) => {
          setMovie(res.data.movie);
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
            toast.error("Some error occured", { autoClose: 1000 });
          }
        });
    }
  }, [slug]);

  return <UpsertMovie mode="edit" movie={movie || undefined} />;
};

export default EditMoviePage;
