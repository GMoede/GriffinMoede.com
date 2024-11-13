import React, { FC, ReactElement } from "react";
import Head from 'next/head';
import Image from 'next/image'
import Script from 'next/script'
import Link from 'next/link'
import './GalleryWall.module.css'

const GalleryWall: FC = (): ReactElement => {
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
            <Image src="/galleryImages/galleryimage1.jpg" alt="Gallery image" width={500}
              height={500} />
            <Image src="/galleryImages/galleryimage2.jpg" alt="Gallery image" width={500}
              height={500} />
            <Image src="/galleryImages/galleryimage3.jpg" alt="Gallery image" width={500}
              height={500} />
            <Image src="/galleryImages/galleryimage4.jpg" alt="Gallery image" width={500}
              height={500} />
            <Image src="/galleryImages/galleryimage5.jpg" alt="Gallery image" width={500}
              height={500} />
            <Image src="/galleryImages/galleryimage6.jpg" alt="Gallery image" width={500}
              height={500} />
            <Image src="/galleryImages/galleryimage7.jpg" alt="Gallery image" width={500}
              height={500} />
            <Image src="/galleryImages/galleryimage8.jpg" alt="Gallery image" width={500}
              height={500} />
            <Image src="/galleryImages/galleryimage9.jpg" alt="Gallery image" width={500}
              height={500} />
            <Image src="/galleryImages/galleryimage10.jpg" alt="Gallery image" width={500}
              height={500} />
            <Image src="/galleryImages/galleryimage11.jpg" alt="Gallery image" width={500}
              height={500} />
            <Image src="/galleryImages/galleryimage12.jpg" alt="Gallery image" width={500}
              height={500} />
          </div>
        </section>
        </div>

      {/* <script src="/superhi.js"></script> */}



      <Script src="/static/pan.js"></Script>
      </div>
  );
};

export default GalleryWall;