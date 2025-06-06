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
      const response = await fetch("/api/photos");
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

      const photos = await Promise.all(photoPromises);
      const sortedPaintings = sortPaintings(photos);

      const containerDimensions = getContainerDimensions(sortedPaintings);
      console.log("containerDimensions", containerDimensions);
      console.log("container width", containerDimensions.width);
      placePaintings(sortedPaintings, containerDimensions.width);
      // sortedPaintings.forEach((painting, index) => {
      //   console.log(
      //     "painting style.top and left",
      //     painting.style.top,
      //     painting.style.left
      //   );
      //   painting.style.top = `${painting.top}px`;
      //   painting.style.left = `${painting.left}px`;
      // });
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

    // // the original pictures were huge and also don't have an actual assigned width and hegiht
    // // so I'm scaling them down and assigning them a width and height
    // imageRefs.current.forEach((img) => {
    //   const scaledHeight = img.naturalHeight / 4;
    //   const scaledWidth = img.naturalWidth / 4;
    //   img.height = scaledHeight;
    //   img.width = scaledWidth;
    // });

    // console.log("containerRef", containerRef.current);

    // // sort the paintings by height
    // const sortedPaintings = sortPaintings(imageRefs.current);

    // // get the estimated dimensions of the container
    // const containerDimensions = getContainerDimensions(sortedPaintings);

    // //this will give each painting a top and left value, based on the algorithm
    // placePaintings(sortedPaintings, containerDimensions.width);

    // // assign the top and left value to the actual styling of each picture
    // sortedPaintings.forEach((painting, index) => {
    //   console.log(
    //     "painting style.top and left",
    //     painting.style.top,
    //     painting.style.left
    //   );
    //   painting.style.top = `${painting.top}px`;
    //   painting.style.left = `${painting.left}px`;
    // });

    // // find the height that fits all the paintings
    // const maxHeight = getMaxHeight(sortedPaintings);

    // // set the height and width of the container
    // // I'm not sure why there is an error without the if statement...
    // // it's something to do with containerRef.current being possibly null
    // // but I'm not sure sure exactly how to remedy this, so this is my workaround
    // if (containerRef.current) {
    //   containerRef.current.style.height = `${maxHeight}px`;
    //   containerRef.current.style.width = `${containerDimensions.width}px`;
    // }

    // setLoaded(false);
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

export default GalleryWall;
