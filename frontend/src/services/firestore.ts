import { db } from "../config/firebase"
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore"
import type { Message, ChatSession } from "../types"

function serializeMessages(messages: Message[]) {
  return messages.map(({ id, role, text, label, timestamp }) => ({
    id,
    role,
    text,
    label: label ?? null,
    timestamp,
  }))
}

export async function createChatSession(
  userId: string,
  title: string,
  messages: Message[],
): Promise<string> {
  if (!db) throw new Error("Firestore başlatılmamış")
  const ref = await addDoc(collection(db, "users", userId, "chats"), {
    title: title.slice(0, 60),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    messages: serializeMessages(messages),
  })
  return ref.id
}

export async function updateChatSession(
  userId: string,
  chatId: string,
  messages: Message[],
): Promise<void> {
  if (!db) throw new Error("Firestore başlatılmamış")
  await updateDoc(doc(db, "users", userId, "chats", chatId), {
    messages: serializeMessages(messages),
    updatedAt: serverTimestamp(),
  })
}

export async function fetchChatSessions(userId: string): Promise<ChatSession[]> {
  if (!db) throw new Error("Firestore başlatılmamış")
  const q = query(
    collection(db, "users", userId, "chats"),
    orderBy("updatedAt", "desc"),
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => {
    const data = d.data()
    const createdAt =
      data.createdAt instanceof Timestamp
        ? data.createdAt.toDate().toISOString()
        : new Date().toISOString()
    return {
      id: d.id,
      title: data.title ?? "Sohbet",
      createdAt,
      messages: (data.messages ?? []) as Message[],
    }
  })
}
