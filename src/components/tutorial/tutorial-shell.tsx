"use client";

import { TutorialPrompt, TutorialStepOverlay } from "./tutorial-overlay";

export function TutorialShell() {
  return (
    <>
      <TutorialPrompt />
      <TutorialStepOverlay />
    </>
  );
}
