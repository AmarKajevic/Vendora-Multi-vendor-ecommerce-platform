"use client";
import { useRef, useState } from "react";

type Props = {
  src: string;
};

const ProductImageZoom = ({ src }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const [bgPos, setBgPos] = useState("50% 50%");
  const [zoomed, setZoomed] = useState(false);

  const handleMove = (e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;

    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setBgPos(`${x}% ${y}%`);
  };

  return (
    <div
      ref={ref}
      className="relative w-full aspect-square overflow-hidden cursor-crosshair"
      onMouseEnter={() => setZoomed(true)}
      onMouseLeave={() => setZoomed(false)}
      onMouseMove={handleMove}
    >
      {/* base image */}
      <img
        src={src}
        alt="product"
        className="w-full h-full object-contain select-none"
      />

      {/* zoom layer */}
      {zoomed && (
        <div
          className="absolute inset-0 hidden lg:block"
          style={{
            backgroundImage: `url(${src})`,
            backgroundRepeat: "no-repeat",
            backgroundSize: "250%",
            backgroundPosition: bgPos,
          }}
        />
      )}
    </div>
  );
};

export default ProductImageZoom;