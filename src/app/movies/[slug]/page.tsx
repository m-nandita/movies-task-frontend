"use client";

import { movieStore } from "@/src/app/movies/page";
import UpsertMovie from "@/src/components/upsert-movie";

const EditMoviePage = () => {
  return <UpsertMovie mode="edit" movie={movieStore.state} />;
};

export default EditMoviePage;
