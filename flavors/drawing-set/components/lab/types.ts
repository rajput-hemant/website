export type ExperimentSceneProps = {
  /** Called once the first frame with real content has been drawn, so the static fallback can fade out. */
  onReady: () => void;
};
