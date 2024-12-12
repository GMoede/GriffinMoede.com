import React, { FC, ReactElement, useRef, useEffect, useState } from "react";
import Image from "next/image";
import "./GalleryWall.module.css";
import {
  sortPaintings,
  getContainerDimensions,
  placePaintings,
  getMaxHeight,
} from "../../functions/arrangePaintings";

interface painting {
  width: number;
  height: number;
  x?: number;
  y?: number;
}

const GalleryWall: FC = (): ReactElement => {
  // This will contain all the references to each image element
  const imageRefs = useRef<HTMLImageElement[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // the original pictures were huge and also don't have an actual assigned width and hegiht
    // so I'm scaling them down and assigning them a width and height
    imageRefs.current.forEach((img) => {
      const scaledHeight = img.naturalHeight / 4;
      const scaledWidth = img.naturalWidth / 4;
      img.height = scaledHeight;
      img.width = scaledWidth;
    });
    const sortedPaintings = sortPaintings(imageRefs.current);

    const containerDimensions = getContainerDimensions(sortedPaintings);

    placePaintings(sortedPaintings, containerDimensions.width);

    sortedPaintings.forEach((painting, index) => {
      painting.style.top = `${painting.top}px`;
      painting.style.left = `${painting.left}px`;
    });

    const maxHeight = getMaxHeight(sortedPaintings);

    containerRef.current.style.height = `${maxHeight}px`;
    containerRef.current.style.width = `${containerDimensions.width}px`;

    setIsLoading(false);
  }, []);

  // creating all the image routes
  const imgRoutes: string[] = [];
  for (let i = 1; i <= 12; i++) {
    imgRoutes.push(`/galleryImages/galleryimage${i}.jpg`);
  }

  const testPaintingss: painting[] = [
    { width: 1000, height: 1000 },
    { width: 2000, height: 1100 },
    { width: 500, height: 900 },
    { width: 770, height: 800 },
    { width: 1250, height: 1200 },
    { width: 1100, height: 1200 },
    { width: 3000, height: 980 },
    { width: 1000, height: 830 },
    { width: 900, height: 1040 },
    { width: 800, height: 500 },
    { width: 450, height: 1000 },
    { width: 900, height: 1100 },
    { width: 1000, height: 1000 },
    { width: 1000, height: 1100 },
    { width: 500, height: 900 },
    { width: 770, height: 800 },
  ];
  const testPaintings = testPaintingss.map((painting) => {
    return {
      width: painting.width / 2,
      height: painting.height / 2,
    };
  });

  const sortedPaintings = sortPaintings(testPaintings);
  const containerDimensions = getContainerDimensions(sortedPaintings);

  // console.log("sortedPaintings before", sortedPaintings);
  placePaintings(sortedPaintings, containerDimensions.width);
  const maxHeight = getMaxHeight(sortedPaintings);

  // creating all the image elements
  // const images = sortedPaintings.map((img, index) => {
  //   return (
  //     // <Image
  //     //   src={imgRoute}
  //     //   alt="Gallery image"
  //     //   width={500}
  //     //   height={500}
  //     //   className="picture"
  //     //   key={index}
  //     //   style={{
  //     //     // top: "1000px",
  //     //     position: "absolute",
  //     //     top: index === 0 ? "1000px" : "0px",
  //     //   }}
  //     //   //This line will assign a ref and add it to the imageRefs array
  //     //   ref={(el) => {
  //     //     imageRefs.current[index] = el;
  //     //   }}
  //     // />
  //     <div
  //       className="picture"
  //       style={{
  //         height: img.height,
  //         width: img.width,
  //         top: img.y,
  //         left: img.x,
  //       }}
  //     ></div>
  //   );
  // });

  const images = imgRoutes.map((img, index) => {
    return (
      <img
        src={img}
        alt="Gallery image"
        className="picture"
        key={index}
        style={{
          // top: "1000px",
          position: "absolute",
        }}
        //This line will assign a ref and add it to the imageRefs array
        ref={(el) => {
          imageRefs.current[index] = el ? el : imageRefs.current[index];
        }}
      />
    );
  });

  return (
    <div
      className="test-div"
      style={{
        width: containerDimensions.width,
        height: 5000,
      }}
      ref={containerRef}
    >
      {images}
    </div>
  );
};

export default GalleryWall;
