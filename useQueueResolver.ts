import { useEffect, useRef } from "react";
import cuid from "cuid";

declare type UseQueueResolver = (
  queue: { request: () => Promise<void>; id: string }[],
  removeFromQueue: (id: string) => void,
) => void;

/**
 * Resolves queue synchronously
 * @param queue
 * @param removeFromQueue
 */
const useQueueResolver: UseQueueResolver = (queue, removeFromQueue) => {
  const inProgress = useRef(false);
  useEffect(() => {
    if (queue.length > 0 && inProgress.current === false) {
      inProgress.current = true;
      queue[0].request().then(() => {
        inProgress.current = false;
        removeFromQueue(queue[0].id);
      });
    }
  }, [queue, removeFromQueue]);
};

//  const [queue, setQueue] = useState<QueueItem[]>([]);
//
//  const pushToQueue = useCallback(
//    (request) => setQueue((oldQueue) => [...oldQueue, { request, id: cuid() }]),
//    [],
//  );
//  const removeFromQueue = useCallback(
//    (id) => setQueue((oldQueue) => oldQueue.filter((el) => el.id !== id)),
//    [],
//  );
//
//   useQueueResolver(queue, removeFromQueue);
