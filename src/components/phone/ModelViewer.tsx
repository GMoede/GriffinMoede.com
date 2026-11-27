"use client";

import React, { FC, ReactElement, useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// Animation names baked into the .glb.
const IDLE_ANIMATION = "Idle_CXB";
const ANSWER_ANIMATION = "AnswerPhone";
// How long he stands idle before reaching for the phone, in seconds.
const IDLE_BEFORE_ANSWER = 1.2;
// Moments in the answer animation (24fps in Blender): the hand is deepest in
// the pocket at frame 24, where it grabs the phone, and the answer button is
// pressed at frame 52. Keep in sync with scripts/build-answer-animation.py.
const PHONE_APPEARS_AT = 24 / 24;
const BUTTON_PRESSED_AT = 52 / 24;

type Props = {
  src: string;
  // Played once the phone is at his ear.
  voiceSrc?: string;
};

// Fills its parent with a drag-to-orbit view of the model, which pulls a cell
// phone out of its pocket, answers it, holds it to its ear, then plays the
// voice recording.
const ModelViewer: FC<Props> = ({ src, voiceSrc }): ReactElement => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = container.current;
    if (!host) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(host.clientWidth, host.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      35,
      host.clientWidth / host.clientHeight,
      0.01,
      1000
    );

    scene.add(new THREE.HemisphereLight(0xffffff, 0x222233, 1.6));
    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(3, 5, 4);
    scene.add(key);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;

    let mixer: THREE.AnimationMixer | null = null;
    let answerAction: THREE.AnimationAction | null = null;
    let phone: THREE.Object3D | undefined;
    let answerButton: THREE.Object3D | undefined;
    let voice: HTMLAudioElement | null = null;
    let disposed = false;
    let startTimer: ReturnType<typeof setTimeout> | undefined;

    new GLTFLoader().load(src, (gltf) => {
      if (disposed) return;
      const model = gltf.scene;
      scene.add(model);

      // Frame the model by its height: center it and back the camera off so
      // the whole body fits with a little room to spare.
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      model.position.sub(center);
      const halfFov = THREE.MathUtils.degToRad(camera.fov / 2);
      const distance = ((size.y / 2) * 1.15) / Math.tan(halfFov);
      camera.position.set(0, 0, distance);
      camera.near = distance / 100;
      camera.far = distance * 100;
      camera.updateProjectionMatrix();
      controls.target.set(0, 0, 0);
      controls.update();

      // The phone stays hidden in his pocket until he pulls it out.
      phone = model.getObjectByName("CellPhone");
      answerButton = model.getObjectByName("AnswerButton");
      if (phone) phone.visible = false;

      mixer = new THREE.AnimationMixer(model);
      const idleClip = THREE.AnimationClip.findByName(gltf.animations, IDLE_ANIMATION);
      const answerClip = THREE.AnimationClip.findByName(
        gltf.animations,
        ANSWER_ANIMATION
      );
      const idle = idleClip && mixer.clipAction(idleClip).play();
      if (!answerClip) return;

      answerAction = mixer.clipAction(answerClip);
      answerAction.setLoop(THREE.LoopOnce, 1);
      answerAction.clampWhenFinished = true;

      startTimer = setTimeout(() => {
        if (!answerAction) return;
        answerAction.reset().play();
        if (idle) answerAction.crossFadeFrom(idle, 0.4, false);
      }, IDLE_BEFORE_ANSWER * 1000);

      mixer.addEventListener("finished", (e) => {
        if (e.action != answerAction || !voiceSrc) return;
        voice = new Audio(voiceSrc);
        voice.play().catch(() => {});
      });
    });

    const clock = new THREE.Clock();
    renderer.setAnimationLoop(() => {
      mixer?.update(clock.getDelta());
      if (answerAction?.isRunning() || answerAction?.paused) {
        const t = answerAction.time;
        if (phone) phone.visible = t >= PHONE_APPEARS_AT;
        if (answerButton) answerButton.visible = t < BUTTON_PRESSED_AT;
      }
      controls.update();
      renderer.render(scene, camera);
    });

    const onResize = () => {
      camera.aspect = host.clientWidth / host.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(host.clientWidth, host.clientHeight);
    };
    window.addEventListener("resize", onResize);

    return () => {
      disposed = true;
      clearTimeout(startTimer);
      voice?.pause();
      window.removeEventListener("resize", onResize);
      renderer.setAnimationLoop(null);
      controls.dispose();
      renderer.dispose();
      host.removeChild(renderer.domElement);
    };
  }, [src, voiceSrc]);

  return <div ref={container} className="model-viewer" />;
};

export default ModelViewer;
