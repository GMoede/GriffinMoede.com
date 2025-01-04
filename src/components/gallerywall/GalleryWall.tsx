import React, { FC, ReactElement, useRef, useEffect, useState } from "react";
// import "./GalleryWall.module.css";
import {
  sortPaintings,
  getContainerDimensions,
  placePaintings,
  getMaxHeight,
} from "../../functions/arrangePaintings";

const GalleryWall: FC = (): ReactElement => {
  // This will contain all the references to each image element
  const imageRefs = useRef<HTMLImageElement[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);

  const [rerender, setRerender] = useState<boolean>(false);

  useEffect(() => {
    // the original pictures were huge and also don't have an actual assigned width and hegiht
    // so I'm scaling them down and assigning them a width and height
    imageRefs.current.forEach((img) => {
      const scaledHeight = img.naturalHeight / 4;
      const scaledWidth = img.naturalWidth / 4;
      img.height = scaledHeight;
      img.width = scaledWidth;
    });

    console.log("containerRef", containerRef.current);

    // sort the paintings by height
    const sortedPaintings = sortPaintings(imageRefs.current);

    // get the estimated dimensions of the container
    const containerDimensions = getContainerDimensions(sortedPaintings);

    //this will give each painting a top and left value, based on the algorithm
    placePaintings(sortedPaintings, containerDimensions.width);

    // assign the top and left value to the actual styling of each picture
    sortedPaintings.forEach((painting, index) => {
      console.log(
        "painting style.top and left",
        painting.style.top,
        painting.style.left
      );
      painting.style.top = `${painting.top}px`;
      painting.style.left = `${painting.left}px`;
    });

    console.log("sortedPaintings", sortedPaintings);
    console.log(
      "random painting top and left",
      sortedPaintings[3].top,
      sortedPaintings[3].left
    );
    // find the height that fits all the paintings
    const maxHeight = getMaxHeight(sortedPaintings);

    // set the height and width of the container
    // I'm not sure why there is an error without the if statement...
    // it's something to do with containerRef.current being possibly null
    // but I'm not sure sure exactly how to remedy this, so this is my workaround
    if (containerRef.current) {
      containerRef.current.style.height = `${maxHeight}px`;
      containerRef.current.style.width = `${containerDimensions.width}px`;
    }

    console.log("container dimensions", containerDimensions.width, maxHeight);
    console.log("useEffect has run");
  }, [imageRefs, containerRef]);

  // creating all the image routes
  const imgRoutes: string[] = [];
  for (let i = 1; i <= 12; i++) {
    imgRoutes.push(`/galleryImages/galleryimage${i}.jpg`);
  }

  const images = imgRoutes.map((img, index) => {
    return (
      <img
        src={img}
        alt="Gallery image"
        className="picture"
        key={index}
        //This line will assign a ref and add it to the imageRefs array
        // the ref will allow us to reference the elements in the useEffect
        ref={(el) => {
          imageRefs.current[index] = el ? el : imageRefs.current[index];
        }}
      />
    );
  });

  return (
    <div className="test-div" ref={containerRef}>
      {images}
    </div>
  );
};

export default GalleryWall;
