"use client";

import React, { FC, ReactElement, useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { playThroughPhone, PhoneVoice } from "./phoneAudio";

// Animation names baked into the .glb.
const IDLE_ANIMATION = "Idle_CXB";
const ANSWER_ANIMATION = "AnswerPhone";
// How long he stands idle before reaching for the phone, in seconds.
const IDLE_BEFORE_ANSWER = 1.2;
// Moments in the answer animation (24fps in Blender): the hand is deepest in
// the pocket at frame 24, where it grabs the phone, the answer button is
// pressed at frame 52, and the phone reaches his ear at frame 82, when the
// voice starts. Keep in sync with scripts/build-answer-animation.py.
const PHONE_APPEARS_AT = 24 / 24;
const BUTTON_PRESSED_AT = 52 / 24;
const PHONE_AT_EAR = 82 / 24;
// Played (without the telephone effect) as he presses the answer button.
const BUTTON_BEEP = "/Phone/audio/answer-beep.mp3";
// Name of the shape key in the .glb that opens the mouth overlay.
const MOUTH_SHAPE = "MouthOpen";
// Voice loudness below this leaves the mouth shut, so breaths and hiss don't
// move it.
const MOUTH_THRESHOLD = 0.12;

type Props = {
  src: string;
  // Played one after another once the phone is at his ear, each run through
  // the telephone effect.
  voiceSrcs?: string[];
  // Called the moment he presses the answer button.
  onAnswer?: () => void;
};

// Fills its parent with a drag-to-orbit view of the model, which pulls a cell
// phone out of its pocket, answers it, holds it to its ear, then plays the
// voice recording.
const ModelViewer: FC<Props> = ({ src, voiceSrcs = [], onAnswer }): ReactElement => {
  // Kept in a ref so a new callback doesn't restart the whole scene.
  const onAnswerRef = useRef(onAnswer);
  onAnswerRef.current = onAnswer;
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
    let voice: PhoneVoice | null = null;
    let mouthOpen = 0;
    let beeped = false;
    let talking = false;
    // Every mesh part with the mouth shape key, with that key's index.
    const mouths: { mesh: THREE.Mesh; index: number }[] = [];
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

      model.traverse((o) => {
        const mesh = o as THREE.Mesh;
        const index = mesh.morphTargetDictionary?.[MOUTH_SHAPE];
        if (index != null && mesh.morphTargetInfluences) mouths.push({ mesh, index });
      });

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
    });

    // Plays the voice clips one after another.
    const playFrom = (i: number) => {
      if (disposed || i >= voiceSrcs.length) return;
      voice = playThroughPhone(voiceSrcs[i], {
        onEnded: () => {
          voice = null;
          playFrom(i + 1);
        },
      });
    };

    const clock = new THREE.Clock();
    renderer.setAnimationLoop(() => {
      mixer?.update(clock.getDelta());
      if (answerAction?.isRunning() || answerAction?.paused) {
        const t = answerAction.time;
        if (phone) phone.visible = t >= PHONE_APPEARS_AT;
        if (answerButton) answerButton.visible = t < BUTTON_PRESSED_AT;
        if (t >= BUTTON_PRESSED_AT && !beeped) {
          beeped = true;
          onAnswerRef.current?.();
          new Audio(BUTTON_BEEP).play().catch(() => {});
        }
        if (t >= PHONE_AT_EAR && !talking) {
          talking = true;
          playFrom(0);
        }
      }

      // Open the mouth overlay with the voice: open quickly on loud bits,
      // close a little slower, and stay shut between words.
      const loud = voice ? voice.level() : 0;
      const target = loud > MOUTH_THRESHOLD ? Math.min((loud - MOUTH_THRESHOLD) * 3, 1) : 0;
      mouthOpen += (target - mouthOpen) * (target > mouthOpen ? 0.6 : 0.35);
      for (const { mesh, index } of mouths) mesh.morphTargetInfluences![index] = mouthOpen;
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
      voice?.stop();
      window.removeEventListener("resize", onResize);
      renderer.setAnimationLoop(null);
      controls.dispose();
      renderer.dispose();
      host.removeChild(renderer.domElement);
    };
  }, [src, voiceSrcs.join("|")]);

  return <div ref={container} className="model-viewer" />;
};

export default ModelViewer;
