import React from "react";

export default function CategoryCard({ img, title }) {
  return (
    <div className="w-[200px] rounded-2xl bg-white p-4">
      <div className="overflow-hidden rounded-xl">
        <img
          src={img}
          alt={title}
          className="h-[140px] w-full object-cover"
        />
      </div>

      <h2 className="m-4 text-center text-xl font-bold text-black">
        {title}
      </h2>
    </div>
  );
}