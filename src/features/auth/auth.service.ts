import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/client";
import { Role } from "@/types";

export const registerUser = async (email: string, password: string, name: string, companyName: string) => {
  // Simple creation logic
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  
  // Dummy company ID generation
  const dummyCompanyId = `comp_${Date.now()}`;
  
  // Store user in Firestore
  await setDoc(doc(db, "users", user.uid), {
    id: user.uid,
    email: user.email,
    name,
    role: "EMPLOYEE" as Role,
    companyId: dummyCompanyId,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
  
  // Create dummy company document
  await setDoc(doc(db, "companies", dummyCompanyId), {
    id: dummyCompanyId,
    name: companyName,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  return userCredential;
};

export const loginUser = async (email: string, password: string) => {
  return await signInWithEmailAndPassword(auth, email, password);
};

export const logoutUser = async () => {
  return await signOut(auth);
};
