import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, setDoc, getDoc, collection, getDocs, query, limit } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/client";
import { Role, Company } from "@/types";

export const getRegisteredCompanies = async (): Promise<Company[]> => {
  try {
    const q = query(collection(db, "companies"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as Company);
  } catch (err) {
    console.error("Failed to fetch companies", err);
    return [];
  }
};

export const registerOrganization = async (email: string, password: string, name: string, companyName: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  
  const companyId = `comp_${Date.now()}`;
  
  // Create company
  await setDoc(doc(db, "companies", companyId), {
    id: companyId,
    name: companyName,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  // Create admin user
  await setDoc(doc(db, "users", user.uid), {
    id: user.uid,
    email: user.email,
    name,
    role: "ADMIN" as Role,
    companyId: companyId,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
  
  return userCredential;
};

export const joinAsEmployee = async (email: string, password: string, name: string, companyId: string) => {
  // Validate company exists before creating user to be safe
  const companyDoc = await getDoc(doc(db, "companies", companyId));
  if (!companyDoc.exists()) {
    throw new Error("Invalid or missing Company ID.");
  }

  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  
  // Emulate standard employee
  await setDoc(doc(db, "users", user.uid), {
    id: user.uid,
    email: user.email,
    name,
    role: "EMPLOYEE" as Role,
    companyId: companyId,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
  
  return userCredential;
};

// Legacy alias to fix any broken imports during transition (will point to employee logic by default if used)
export const registerUser = async (email: string, password: string, name: string, companyName: string) => {
  return registerOrganization(email, password, name, companyName);
};

export const loginUser = async (email: string, password: string) => {
  return await signInWithEmailAndPassword(auth, email, password);
};

export const logoutUser = async () => {
  return await signOut(auth);
};

export const loginWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  const userCredential = await signInWithPopup(auth, provider);
  const user = userCredential.user;

  const userDocRef = doc(db, "users", user.uid);
  const userDoc = await getDoc(userDocRef);
  
  if (!userDoc.exists()) {
    const dummyCompanyId = `comp_${Date.now()}`;
    
    await setDoc(userDocRef, {
      id: user.uid,
      email: user.email || "",
      name: user.displayName || "Google User",
      role: "EMPLOYEE" as Role,
      companyId: dummyCompanyId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    await setDoc(doc(db, "companies", dummyCompanyId), {
      id: dummyCompanyId,
      name: `${user.displayName?.split(' ')[0] || "User"}'s Workspace`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  }

  return userCredential;
};
