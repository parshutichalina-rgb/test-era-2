import { useContext } from "react";
import { QueueContext } from "./QueueProvider";

export function useQueue() {
  const context = useContext(QueueContext);
  if (!context) {
    throw new Error("useQueue must be used inside QueueProvider");
  }
  return context;
}
