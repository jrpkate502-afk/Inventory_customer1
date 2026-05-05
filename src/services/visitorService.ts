import { doc, getDoc, runTransaction, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";

const STATS_DOC = "stats/global";

export const incrementVisitorCount = async () => {
  const docRef = doc(db, STATS_DOC);
  try {
    await runTransaction(db, async (transaction) => {
      const sfDoc = await transaction.get(docRef);
      if (!sfDoc.exists()) {
        transaction.set(docRef, { visitorCount: 1 });
      } else {
        const newCount = (sfDoc.data().visitorCount || 0) + 1;
        transaction.update(docRef, { visitorCount: newCount });
      }
    });
  } catch (e) {
    console.error("Transaction failed: ", e);
  }
};

export const subscribeToVisitorCount = (callback: (count: number) => void) => {
  const docRef = doc(db, STATS_DOC);
  return onSnapshot(docRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data().visitorCount || 0);
    }
  });
};
