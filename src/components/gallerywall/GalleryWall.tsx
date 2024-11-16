import React, { FC, ReactElement } from "react";
import Head from 'next/head';
import Image from 'next/image'
import Script from 'next/script'
import Link from 'next/link'
import './GalleryWall.module.css'

const GalleryWall: FC = (): ReactElement => {
  const images: string[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  const imageElements: any = [];
  images.forEach((img) => {
    var image = <Image src={`/galleryImages/galleryimage${img}.jpg`} alt={img} width={500}
      height={500} />;
      imageElements.push(image);
  });

  return (
    <div>
      <Head>
        <meta name="generator" content="SuperHi" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Basic Goods</title>
        <Link rel="stylesheet" href="/GalleryWall.module.css" />
      </Head>
      <div>
        <header>
          <h1>Basic Goods</h1>
          <a href="#">Buy now</a>
        </header>
        <section className="panner">
          <div className="world">
            {imageElements}
          </div>
        </section>
      </div>

      <Script src="/static/pan.js"></Script>
    </div>
  );
};

export default GalleryWall;