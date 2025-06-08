import React, { FC, ReactElement, useRef, useEffect, useState } from "react";
import {
  sortPaintings,
  getContainerDimensions,
  placePaintings,
  getMaxHeight,
  getImageDimensions,
} from "../../functions/arrangePaintings";
import "../../app/styles/pages/gallery.css";

const GalleryWall: FC = (): ReactElement => {
  // This will contain all the references to each image element
  const imageRefs = useRef<HTMLImageElement[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [imageElements, setImages] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(true);

  useEffect(() => {
    ///

    const fetchPhotos = async () => {
      const response = await fetch("/api/photos", { cache: "no-store" });
      const data = await response.json();
      console.log("Fetched photos: ", data);
      const photoPromises = data.pictures.map(
        async (photo: { url: string }) => {
          const { width, height } = await getImageDimensions(photo.url);
          return (
            <img
              src={photo.url}
              alt="Gallery image"
              className="picture"
              key={photo.url}
              height={height / 4}
              width={width / 4}
              style={{ top: "0px", left: "0px" }}
            />
          );
        }
      );
      console.log("1");
      console.log("photoPromises", photoPromises);

      const photos = await Promise.all(photoPromises);

      console.log("2");
      const sortedPaintings = sortPaintings(photos);
      console.log("sortedPaintings", sortedPaintings);

      const containerDimensions = getContainerDimensions(sortedPaintings);
      console.log("containerDimensions", containerDimensions);
      console.log("container width", containerDimensions.width);
      placePaintings(sortedPaintings, containerDimensions.width);

      const maxHeight = getMaxHeight(sortedPaintings);
      if (containerRef.current) {
        console.log("maxHeight", maxHeight);
        console.log("containerRef.current", containerRef.current);
        console.log("containerdimensions.width", containerDimensions.width);
        containerRef.current.style.height = `${maxHeight}px`;
        containerRef.current.style.width = `${containerDimensions.width}px`;
      }
      console.log("updated containerRef", containerRef.current);
      setImages(sortedPaintings);
      setLoaded(false);
    };

    fetchPhotos();
  }, []);

  return (
    <>
      <div className="test-div" ref={containerRef}>
        {!loaded && <>{imageElements}</>}
        {loaded && <div>loading...</div>}
      </div>
    </>
  );
};
export const revalidate = 10; // seconds
export default GalleryWall;
