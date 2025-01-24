// import { ReactElement } from "react";

interface painting {
  width: number;
  height: number;
  left?: number;
  top?: number;
  style?: any;
}

type floor = { x: number; y: number; length: number }[];

export const sortPaintings = (paintings: painting[]): painting[] => {
  return paintings.sort((a, b) => {
    return b.height - a.height;
  });
};

export const getContainerDimensions = (
  Paintings: painting[],
  aspectRatio: number = 2 / 1,
  margin: number = 30
) => {
  let totalArea = 0;

  Paintings.forEach((painting) => {
    totalArea += (painting.width + margin) * (painting.height + margin);
  });

  // this is the width of a rectangle with a area equal to the total area
  // and an aspect ratio equal to the desired aspect ratio
  const idealWidth = Math.sqrt(totalArea * aspectRatio);
  const idealHeight = idealWidth / aspectRatio;

  //giving a an extra 10% width and an extra height of the tallest painting
  const adjustedWidth = idealWidth * 1.1;
  const adjustedHeight = idealHeight + Paintings[0].height;

  return {
    width: adjustedWidth,
    height: adjustedHeight,
  };
};

export const placePaintings = (
  sortedPaintings: painting[],
  floorLength: number,
  floor: floor = [{ x: 0, y: 0, length: floorLength }],
  startingIndex: number = 0,
  reverse: boolean = false,
  margin: number = 40
) => {
  // exit condition. all paintings have been placed
  if (startingIndex >= sortedPaintings.length) {
    return;
  }

  let newFloor: floor = [];
  let currentIndex = startingIndex;
  let currentX = reverse
    ? floorLength - sortedPaintings[currentIndex].width
    : 0;

  if (reverse) {
    // iterate through paintings, assigning each an x and y value
    // but starting from the right boundary

    while (currentX >= 0) {
      let currentY;
      const currentPainting = sortedPaintings[currentIndex];
      const currentPaintingWidth = currentPainting.width + margin;
      const currentPaintingHeight = currentPainting.height + margin;

      // find the y value for the current X value
      for (let i = 0; i < floor.length; i++) {
        const section = floor[i];
        // check if current x is within this section
        if (currentX >= section.x && currentX < section.x + section.length) {
          // check if painting fits in the section or if it extends past it
          if (currentPaintingWidth > section.length - (currentX - section.x)) {
            // if it doesn't fit, check if it would overlap the next section
            if (section.y < floor[i + 1]?.y) {
              currentY = floor[i + 1].y;
              break;
            } else {
              currentY = section.y;
              break;
            }
          } else {
            currentY = section.y;
            break;
          }
        }
      }

      // assign x and y values to the current painting
      currentPainting.left = currentX;
      currentPainting.top = currentY;

      // add painting to the new floor
      const newFloorSection = {
        x: currentX,
        y: currentY + currentPaintingHeight,
        length: currentPaintingWidth,
      };

      newFloor.unshift(newFloorSection);

      currentIndex++;
      if (currentIndex >= sortedPaintings.length) {
        break;
      }
      currentX -= sortedPaintings[currentIndex].width + margin;
    }
  } else {
    // interate through paintings, assigning each an x and y value
    // starting from the left boundary
    while (currentX + sortedPaintings[currentIndex].width <= floorLength) {
      let currentY;
      const currentPainting = sortedPaintings[currentIndex];
      const currentPaintingWidth = currentPainting.width + margin;
      const currentPaintingHeight = currentPainting.height + margin;

      // find the y value for the current X value
      for (let i = 0; i < floor.length; i++) {
        const section = floor[i];
        // check if current x is within the section
        if (currentX >= section.x && currentX < section.x + section.length) {
          // check if painting fits in the section
          if (currentPaintingWidth > section.length - (currentX - section.x)) {
            // if it doesn't fit, check if it would overlap the next section
            if (section.y < floor[i + 1]?.y) {
              currentY = floor[i + 1].y;
              break;
            } else {
              currentY = section.y;
              break;
            }
          } else {
            currentY = section.y;
            break;
          }
        }
      }
      //add x and y values to the current painting
      currentPainting.left = currentX;
      currentPainting.top = currentY;

      // add painting to the new floor
      const newFloorSection = {
        x: currentX,
        y: currentY + currentPaintingHeight,
        length: currentPaintingWidth,
      };

      newFloor.push(newFloorSection);

      // iterate to the next painting
      currentX += currentPaintingWidth;
      currentIndex++;
      if (currentIndex >= sortedPaintings.length) {
        break;
      }
    }
  }

  // add the remainder of the old floor to the new floor (reverse direction)
  if (reverse) {
    // our currentX is left off outside the left boundary, so we need to
    //shift currentX back to the last placed painting

    currentX += sortedPaintings[currentIndex - 1].width;

    //iterate through the old floor BACKWARDS, adding the partial section from wehere the last
    // painting was placed to the end of that section
    for (let i = floor.length - 1; i >= 0; i--) {
      if (currentX >= floor[i].x && currentX < floor[i].x + floor[i].length) {
        const newLength = currentX - floor[i].x;
        newFloor.unshift({ x: floor[i].x, y: floor[i].y, length: newLength });

        //also add any sections that are to the left of the last painting
      } else if (currentX > floor[i].x + floor[i].length) {
        newFloor.unshift(floor[i]);
      }
    }
  } else {
    // add the remainder of the old floor to the new floor (normal direction)
    floor.forEach((section, index) => {
      // itereate through the old floor FORWARDS, adding the partial section from where the last
      // painting was placed to the end of that section
      if (currentX >= section.x && currentX < section.x + section.length) {
        const newLength = section.length + section.x - currentX;
        newFloor.push({ x: currentX, y: section.y, length: newLength });
        return;

        //also add any sections that are to the right of the last painting
      } else if (currentX < section.x) {
        newFloor.push(section);
      }
    });
  }

  //recursive call with the new floor, the next index, and the opposite reverse boolean
  placePaintings(
    sortedPaintings,
    floorLength,
    newFloor,
    currentIndex,
    !reverse
  );
};

export const getMaxHeight = (paintings: any[]): number => {
  let maxHeight = 0;

  paintings.forEach((painting) => {
    if (painting.height + painting.left > maxHeight) {
      maxHeight = painting.height + painting.top;
    }
  });

  return maxHeight;
};

// const testPaintings: painting[] = [
//   { width: 100, height: 100 },
//   { width: 200, height: 110 },
//   { width: 50, height: 90 },
//   { width: 77, height: 80 },
//   { width: 125, height: 120 },
//   { width: 110, height: 120 },
//   { width: 300, height: 98 },
//   { width: 100, height: 83 },
//   { width: 90, height: 104 },
//   { width: 80, height: 50 },
//   { width: 45, height: 200 },
//   { width: 90, height: 180 },
// ];

// const sortedPaintings = sortPaintings(testPaintings);
// const containerDimensions = getContainerDimensions(sortedPaintings);

// console.log("sortedPaintings before", sortedPaintings);
// placePaintings(sortedPaintings, containerDimensions.width);
// console.log("sortedPaintings after", sortedPaintings);

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
