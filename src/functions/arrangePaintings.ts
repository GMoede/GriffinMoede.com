// import { ReactElement } from "react";

interface painting {
  width: number;
  height: number;
  x?: number;
  y?: number;
}

type floor = { x: number; y: number; length: number }[];

export const sortPaintings = (paintings: painting[]): painting[] => {
  return paintings.sort((a, b) => {
    return b.height - a.height;
  });
};

export const getContainerDimensions = (
  Paintings: painting[],
  aspectRatio: number = 2 / 1
) => {
  let totalArea = 0;

  Paintings.forEach((painting) => {
    totalArea += painting.width * painting.height;
  });

  // this is the width of a rectangle with a area equal to the total area
  // and an aspect ratio equal to the desired aspect ratio
  const idealWidth = Math.sqrt(totalArea * aspectRatio);
  const idealHeight = idealWidth / aspectRatio;

  //giving a an extra 10% width and an extra height of the tallest painting
  const adjustedWidth = idealWidth * 1.1;
  const adjustedHeight = idealHeight + sortedPaintings[0].height;

  return {
    width: adjustedWidth,
    height: adjustedHeight,
  };
};

export const placePaintings = (
  sortedPaintings: painting[],
  floorLength: number,
  floor: floor = [{ x: 0, y: 0, length: floorLength }],
  startingIndex: number = 0
) => {
  // if no more paintings, exit recusive function
  if (startingIndex >= sortedPaintings.length) {
    return;
  }

  console.log("floor", floor);

  let newFloor: floor = [];
  let currentIndex = startingIndex;
  let currentX = 0;

  console.log("starting painting", sortedPaintings[currentIndex]);

  // interate through paintings, assigning each an x and y value
  while (currentX + sortedPaintings[currentIndex].width <= floorLength) {
    let currentY;
    const currentPainting = sortedPaintings[currentIndex];

    // find the y value for the current X value
    for (let section of floor) {
      if (currentX >= section.x && currentX < section.x + section.length) {
        currentY = section.y;
        break;
      }
    }
    currentPainting.x = currentX;
    currentPainting.y = currentY;

    // add painting to the new floor
    const newFloorSection = {
      x: currentX,
      y: currentY + currentPainting.height,
      length: currentPainting.width,
    };
    newFloor.push(newFloorSection);

    // iterate to the next painting
    currentIndex++;
    currentX += currentPainting.width;
    if (currentIndex >= sortedPaintings.length) {
      break;
    }
  }

  // add the remainder of the old floor to the new floor
  floor.forEach((section, index) => {
    if (currentX >= section.x && currentX < section.x + section.length) {
      const newLength = section.length + section.x - currentX;
      newFloor.push({ x: currentX, y: section.y, length: newLength });
      return;
    } else if (currentX < section.x) {
      newFloor.push(section);
    }
  });

  console.log("recursing");
  placePaintings(sortedPaintings, floorLength, newFloor, currentIndex);
};

const testPaintings: painting[] = [
  { width: 100, height: 100 },
  { width: 200, height: 110 },
  { width: 50, height: 90 },
  { width: 77, height: 80 },
  { width: 125, height: 120 },
  { width: 110, height: 120 },
  { width: 300, height: 98 },
  { width: 100, height: 83 },
  { width: 90, height: 104 },
  { width: 80, height: 50 },
  { width: 45, height: 200 },
  { width: 90, height: 180 },
];

const sortedPaintings = sortPaintings(testPaintings);
const containerDimensions = getContainerDimensions(sortedPaintings);

// console.log("sortedPaintings before", sortedPaintings);
placePaintings(sortedPaintings, containerDimensions.width);
console.log("sortedPaintings after", sortedPaintings);

// --------------------------------------------
//--------------------------------------------
// these functions were started when I was trying to place paintings
// starting from a central origin point. I think it's a little too complicated for now
// So I'm going to use a simpler method of starting in a corner
// --------------------------------------------
//--------------------------------------------

// export const arrangePaintings = (sortedPaintings: Element[]): Element[] => {
//   const corners: { x: number; y: number }[] = [];
//   let square: [number, number] = [0, 0];

//   sortedPaintings.forEach((painting) => {
//     const paintingRect = painting.getBoundingClientRect();
//     const paintingWidth = paintingRect.width;
//     const paintingHeight = paintingRect.height;
//     const paintingArea = paintingWidth * paintingHeight;

//     let newSquare;
//   });
//   return [];
// };

// export const placeFirstPaintings = (sortedPaintings: Element[]): any[] => {
//   const corners: { x: number; y: number }[] = [];
//   let square: [number, number] = [0, 0];
//   const positions: { x: number; y: number }[] = [];
//   const secondPaintingRect = sortedPaintings[1].getBoundingClientRect();
//   const thirdPaintingRect = sortedPaintings[2].getBoundingClientRect();

//   //first painting
//   positions.push({ x: 0, y: 0 });

//   //second painting
//   const secondPaintingX = 0 - secondPaintingRect.width;
//   const secondPaintingY = 0;

//   positions.push({ x: secondPaintingX, y: secondPaintingY });

//   //third painting
//   const thirdPaintingX = 0;
//   const thirdPaintingY = 0 + thirdPaintingRect.height;
//   positions.push({ x: thirdPaintingX, y: thirdPaintingY });

//   return positions;
// };

// --------------------------------------------
//--------------------------------------------
